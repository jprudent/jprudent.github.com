---
layout: default
lang: fr
categories:
- articles_prog
tags:
- couchbase
---
# Les 3 connexions du client couchbase java #

<div id="toc-js">
</div>  

## Avant propos ##

Dans les exemples de ce billet, je travaille avec
1 cluster constitué de 3 noeuds. 

Le cluster gère 2 buckets, _sso_ et _cache_.

## 4 promesses ##

Quand on visite la page [overview](http://www.couchbase.com/couchbase-server/overview)
de couchbase server, on nous vante 4 mérites à ce produit :

Scalabilité facile 
: l'ajout et la suppression de noeud hyper simplifiée.

Jamais d'indisponibilité 
: toutes les opérations de maintenance cluster se font sans interruption.

Haute performance 
: la vitesse d'accès aux données est constante.

Modèle flexible 
: pas de shéma, on stocke ce que l'on veut.



Nous allons voir comment ces avantages sont mis en oeuvre côté client.

## Création du client ##

La création d'un client se fait simplement en renseignant __un__ 
(j'y reviendrai) des noeuds du cluster, le nom du bucket,
et l'éventuel password.

{% highlight java %}
    
    public CouchbaseClient newCouchbaseClient() throws IOException {
        List<URI> baseList = asList(URI.create("http://node1:8091/pools"));
        return new CouchbaseClient(baseList,"sso","");
    }
    
{% endhighlight %}

Le client offre une [API](http://www.couchbase.com/docs/couchbase-sdk-java-1.1/api-reference-summary.html)
riche qui permet d'intéragir simplement avec couchbase, en faisant du
clé/valeur ou en interrogeant des views.

Derrière cette simplicité se cache une machinerie assez lourde ...

## Phase de bootstrap ##

Quand on crée un client, on passe une `baseList`.
Cette `baseList` contient une liste d'URL sur laquelle les clients 
peuvent interroger une API REST afin de découvrir la topologie 
du cluster et d'initier une connexion vers un bucket.

La `baseList` doit contenir l'URL d'au moins un des noeuds du cluster.



Côté serveur, 

chaque _bucket_ est dans une liste de buckets,

cette liste appartient à une _pool_, 

et il existe plusieurs _pools_.  



Le client va récupérer successivement ces informations du plus 
gros grain, la liste de pools, jusqu'au bucket qu'on lui a 
spécifié.

La récupération de la liste des pools se fait sur `http://node1:8091/pools`

{% highlight json %}

	{
		"pools": [
			{
				"name": "default",
				"uri": "/pools/default?uuid=b7e59676b22aecc10425b23507368662",
				"streamingUri": "/poolsStreaming/default?uuid=b7e59676b22aecc10425b23507368662"
			}
		]
	}

{% endhighlight %}

On voit qu'il existe une seule pool, appelée _default_. On récupère 
ses informations sur `http://node1:8091/pools/default?uuid=b7e59676b22aecc10425b23507368662`

{% highlight json %}

    {

    "storageTotals": { … },
    "name": "default",
    "alerts": [ ],
    "alertsSilenceURL": "/controller/resetAlerts?token=0&uuid=e9909bc948c7ad5a9358db43e0f1d32f",
    "nodes": [ … ],
    "buckets": {
        "uri": "/pools/default/buckets?v=125187379&uuid=e9909bc948c7ad5a9358db43e0f1d32f"
    },
    "remoteClusters": {
        "uri": "/pools/default/remoteClusters?uuid=e9909bc948c7ad5a9358db43e0f1d32f",
        "validateURI": "/pools/default/remoteClusters?just_validate=1"
    },
    "controllers": { … },
    "balanced": true,
    "failoverWarnings": [ ],
    "rebalanceStatus": "none",
    "rebalanceProgressUri": "/pools/default/rebalanceProgress",
    "stopRebalanceUri": "/controller/stopRebalance?uuid=e9909bc948c7ad5a9358db43e0f1d32f",
    "nodeStatusesUri": "/nodeStatuses",
    "maxBucketCount": 10,
    "autoCompactionSettings": { … },
    "fastWarmupSettings": { … },
    "tasks": { … },
    "stats": { … },
    "counters": { … },
    "stopRebalanceIsSafe": true

    }
	
{% endhighlight %}

Ensuite le client récupère la liste des buckets sur
`http://node1:8091/pools/default/buckets?v=125187379&uuid=e9909bc948c7ad5a9358db43e0f1d32f`

{% highlight json %}
	
	[
		{ ... }, // infos bucket sso
		{ ... }  // infos bucket cache
	]
		
{% endhighlight %}

Après cette phase de bootstrap, le client dispose de 
toutes les informations requises pour se connecter au bucket et 
travailler dessus. Je détaillerai ces informations plus tard.

## Les 3 types de connexion du client ##

![Les 3 types de connexion du client](/images/articles/couchbase/connexions.svg)

Le client a 3 types de connexion :


- En vert, le _bucket monitor_, un canal par lequel le cluster informe le client de sa topologie.
- En jaune, le canal par lequel transite le protocol couchbase (set, get, delete, ...)
- En rouge, le canal par lequel le client peut interroger les vues


Le client __doit__ ouvrir un canal jaune et rouge sur __chacun__ des noeuds. 
Le canal vert est ouvert sur l'un des noeuds seulement.

### Le bucket monitor ###

Le _bucket monitor_ permet au client de découvrit et d'être averti des
modifications de topologie du cluster. 

A la phase de bootstrap le client avait finalement récupéré la liste
des buckets. En détail cela contient les noeuds auxquels il est rattaché,
et où sont distribuées les clés. 

{% highlight json %}

	{

		"name": "sso",
		"bucketType": "membase",
		"authType": "sasl",
		"saslPassword": "",
		"proxyPort": 0,
		"replicaIndex": true,
		"uri": "/pools/default/buckets/sso?bucket_uuid=dbb0c92417cc30b0050f5170948e5ef9",
		"streamingUri": "/pools/default/bucketsStreaming/sso?bucket_uuid=dbb0c92417cc30b0050f5170948e5ef9",
		"localRandomKeyUri": "/pools/default/buckets/sso/localRandomKey",
		"controllers": {
			"flush": "/pools/default/buckets/sso/controller/doFlush",
			"compactAll": "/pools/default/buckets/sso/controller/compactBucket",
			"compactDB": "/pools/default/buckets/sso/controller/compactDatabases"
		},
		"nodes": [
			{
				"couchApiBase": "http://node1:8092/sso",
				"systemStats": { ... },
				"interestingStats": { ... },
				"uptime": "1716233",
				"memoryTotal": 4019253248,
				"memoryFree": 961105920,
				"mcdMemoryReserved": 3066,
				"mcdMemoryAllocated": 3066,
				"replication": 1,
				"clusterMembership": "active",
				"status": "healthy",
				"thisNode": true,
				"hostname": "10.40.64.116:8091",
				"clusterCompatibility": 131072,
				"version": "2.0.0-1976-rel-community",
				"os": "x86_64-unknown-linux-gnu",
				"ports": {
					"proxy": 11211,
					"direct": 11210
				}
			},
			{ ... }, // infos node2
			{ ... }, // infos node3
		],
		"stats": { ... },
		"nodeLocator": "vbucket",
		"autoCompactionSettings": false,
		"fastWarmupSettings": false,
		"uuid": "dbb0c92417cc30b0050f5170948e5ef9",
		"vBucketServerMap": {
			"hashAlgorithm": "CRC",
			"numReplicas": 1,
			"serverList": [
				"node1:11210",
				"node2:11210",
				"node3:11210"
			],
			"vBucketMap": [
				[
					0,
					1
				],
				[
					0,
					2
				],
				[
					1,
					0
				],
				.... // beaucoup beaucoup (1018)
				[
					1,
					2
				],
				[
					2,
					0
				],
				[
					2,
					1
				]
			]
		},
		"replicaNumber": 1,
		"quota": {
			"ram": 314572800,
			"rawRAM": 104857600
		},
		"basicStats": { ... },
		"bucketCapabilitiesVer": "",
		"bucketCapabilities": [
			"touch",
			"couchapi"
		]

	}

{% endhighlight %}

Dans cette description l'une des infos est la fameuse `streamingUri`. 
Le client ouvre une connexion permanente dessus, dite de streaming,
genre [Comet](http://en.wikipedia.org/wiki/Comet_%28programming%29). 
C'est via ce canal que le client est informé des modifications de 
topologie du cluster (ajout d'un noeud, noeud en failover, ...).
Quand une modification survient, le client se reconfigure automatiquement.

### Communication avec couchbase (jaune) ###

Couchbase promet des temps d'accès aux données constants. Cela est
notamment dû au fait que la charge de travail est répartie équitablement 
sur chaque noeud du cluster. En effet, une clé est sous la responsabilité 
d'un seul noeud et d'un seul. 

Aussi, le client à la __responsabilité__ d'envoyer ou de demander des 
clés __directement__ au bon noeud du cluster. 
Par conséquence, le client doit se connecter à tous les noeuds du cluster
afin de travailler avec n'importe quel clé.

A la phase de bootstrap, couchbase récupère l'intégralité des 
généralement adresses des noeuds du cluster et y ouvre une connexion 
TCP permanente, généralement sur le port 11210.

#### Répartition des clés ####

A la phase de bootstrap le client récupère la `vBucketServerMap`.
Elle est constituée de 4 informations :


* `hashAlgorithm` : l'algorithme de hashage utilisé pour répartir 
les clés sur les noeuds. Ici, un simple [CRC](http://fr.wikipedia.org/wiki/Contr%C3%B4le_de_redondance_cyclique)	
* `numReplica` : le nombre de fois que la clé est répliquée.
* `serverList` : le tableau des noeuds du cluster. L'ordre est important
* `vBucketMap` : la répartition des clés dans les noeuds du cluster.


C'est un tableau de 1024 éléments. Chaque élément est appelé _virtual 
bucket_. Cela permet de simuler un cluster de 1024 noeuds.
Un _virtual bucket_ est un tableau. Le nombre à l'indice 0 est le noeud
dit _master_ qui est responsable de la clé. Les indices suivants sont 
les noeuds _replicas_ où sont stockées les répliques.

Avec ces informations, le client est en mesure de connaitre pour une
clé `k` le noeud _master_ et les noeuds _replicas_.

dans notre cas (pseudo code):

	indiceVBucketMap = CRC(k) modulo 1024
	noeud_master = vBucketMap[indiceVBucketMap][0]
	noeud_replica1 = vBucketMap[indiceVBucketMap][1]

Le client a donc bien la responsabilité d'accéder au bon noeud.
A l'insertion, il envoie la clé au noeud _master_ et aux noeuds _replicas_.
A la récupération, le client interroge le noeud _master_, éventuellement
les _replicas_ s'il est en _failover_.
Pour s'en convaicre, cette méthode, expérimentale, renvoie l'addresse du 
noeud _master_ pour une clé :

{% highlight java %}

	private String getNodeByKey(String key, CouchbaseClient couchbaseClient) throws NoSuchFieldException, IllegalAccessException {
			Field declaredField = MemcachedClient.class.getDeclaredField("mconn");
			declaredField.setAccessible(true);
			Object mconn = declaredField.lget(couchbaseClient);
			NodeLocator locator = ((CouchbaseConnection) mconn).getLocator();
			return locator.getPrimary(key).getSocketAddress().toString();
	}

{% endhighlight %}

### Canal des vues ###

Bien que l'interrogation d'une vue puisse se faire sur n'importe quel
noeud, un canal dédié aux vues est ouvert sur chaque noeud du cluster.

Cela permet de répartir la charge en faisant du [round robin](http://fr.wikipedia.org/wiki/Round-robin_%28informatique%29)
sur la liste des noeuds. 

## 4 promesses tenues ? ##

Scalabilité facile
: Le bucket monitor permet de répondre automatiquement aux changements
de topologie du cluster.

Jamais d'indisponibilité 
: Le client s'adapte sans redémarrage. 

Haute performance 
: Les clés sont réparties uniformément sur tous les noeuds du cluster
grâce au système de virtual bucket. 
Aussi, l'interrogation des vues ne se fait jamais sur le même noeud.
Ainsi la charge du cluster est répartie sur tous les noeuds du client.

Modèle flexible 
: Au niveau de l'API, la clé est une chaine de caractère, et la 
valeur est un `Object` sérialisable. Bref, c'est libre.

## Conclusion ##

Couchbase réussit à tenir ses promesses en délégant pas mal 
d'intelligence au client: localisation des noeuds, réplication, ...


Ce qu'on retient aussi c'est la lourdeur d'initialisation du client.
Plus les noeuds du cluster sont nombreux, plus la phase d'initialisation 
prend du temps car le nombre de connexions TCP à ouvrir est assez 
impressionnant.

Il va sans dire (mais on le dit quand même) qu'il ne faut créer qu'une
seule fois un client par application. 

