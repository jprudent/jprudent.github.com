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

### Création du client ###

La création d'un client se fait simplement en renseignant __un__ 
(j'y reviendrai) des noeuds du cluster, le nom du bucket,
et l'éventuel password.

{% highlight java %}
    
    public CouchbaseClient newCouchbaseClient() throws IOException {
        List<URI> baseList = asList(URI.create("http://node1:8091/pools"));
        return new CouchbaseClient(baseList,"sso","s3cr3t");
    }
    
{% endhighlight %}

Le client offre une [API](http://www.couchbase.com/docs/couchbase-sdk-java-1.1/api-reference-summary.html)
riche qui permet d'intéragir simplement avec couchbase, en faisant du
clé/valeur ou en interrogeant des views.

Derrière cette simplicité se cache une machinerie assez lourde ...

### Les 3 types de connexion du client ###

Le shéma décrit une topologie avec 1 cluster constitué de 3 noeuds. 

Le cluster gère 2 buckets, _sso_ et _cache_.

1 client est connecté au bucket _sso_.

Le client a 3 types de connexion :
- En vert, le _bucket monitor_, un canal par lequel le cluster informe le client de sa topologie.
- En jaune, le canal par lequel transite le protocol couchbase (set, get, delete, ...)
- En rouge, le canal par lequel le client peut interroger les vues

Le client __doit__ ouvrir un canal jaune et rouge sur __chacun__ des noeuds. 
Le canal vert est ouvert sur l'un des noeuds seulement.

#### Le bucket monitor ####

Le _bucket monitor_ permet au client de découvrit et d'être averti des
modifications de topologie du réseau. 

Il s'agit de la première connection réseau initiée par le client, la 
fameuse `baseList` passée en paramètre du client.

Cette `baseList` contient une liste d'URL sur laquelle les clients 
peuvent initier une connexion HTTP afin de découvrir la topologie 
du cluster.

Côté serveur, chaque _bucket_ appartient à une _pool_, 
et il existe plusieurs _pools_.  

Pour obtenir la liste des pools, rendez-vous sur http://node1:8091/pools

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

On voit qu'il existe une seule pool, appelée _default_

