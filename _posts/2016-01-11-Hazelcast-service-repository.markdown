REST sans hypermédia n'est pas REST. La réponse d'un service REST doit fournir quelques liens permettant à l'utilisateur
de poursuivre sa navigation.

Parlons un peu de cuisine. Il s'agit d'une startup, miam.fr, fournisseuse d'APIs culinaires. 

                      +----------+
                      |          |
          +-----------+ RECETTE  +-------------+
          |           |          |             |
          |           +----------+             |
    +-----V----+                               |
    |          |                               |
    | CALCUL   |                               |
    | CALORIES |                               |
    |          |                        +------V-----+
    +----------+                        |            |
                                        | PHOTO      |
                                        | INGREDIENT |
                                        |            |
                                        +------------+
                                        
La webapp principale _recette_ est une API qui renvoie une recette de cuisine. Cette recette décrit les
ingrédients nécessaires et les étapes de confection. Elle invite le consommateur d'API à consulter la plus belle photo d'un ingrédient en interrogeant la 
webapp _photo ingredient_. Un lien qui calcule l'apport calorique de la recette envoie sur la webapp _calcul calories_.

Un extrait de la recette pourrait donc ressembler à : 

    {
        "id": 12
        "title": "Boeuf Bourgignon"
        "steps": [ ... ]
        "links": [{
            "rel": "related",
            "title": "la plus belle photo d'échalotte"
            "type": "image/jpeg"
            "href": "ingredient.miam.fr/ingredient/echalotte/best"
        }, {
            "rel": "related",
            "title": "calories pour 100g"
            "type": "application/json"
            "href": "calories.miam.fr/calories/boeuf%20bourguignon"
        }]
    }

Note: j'ai fait un gros mélange [atom](https://en.wikipedia.org/wiki/Atom_%28standard%29), [HAL](https://en.wikipedia.org/wiki/Hypertext_Application_Language), et [json-schema-hypermedia](http://json-schema.org/latest/json-schema-hypermedia.html).
De toute façon aucun de ces "standards" ne semble faire l'unanimité.

Demandons-nous maintenant comment la webapp _recette_ est capable de construire de tels liens ?

La webapp charge un fichier de configuration qui contient les hostnames correspondant à chaque URL.

        #        SERVICE              ;       HOST
        /ingredient/{ingredient}/best ; ingredient.miam.fr
        /calories/{recette}           ; calories.miam.fr

Un fichier de configuration n'est ni plus, ni moins qu'un annuaire statique.

Le terme d'annuaire est bien imagé, on comprend bien à quoi cela sert. Cet annuaire répond aux question du genre : _où est le service de photos ?_
Il existe une autre façon de voir les choses. On a une dépendance entre la webapp _recette_ et les webapps _ingredient_ et _calories_.
Un annuaire de service est un genre d'injecteur de dépendance. On cherche une interface `/ingredient/{ingredient}/best` (dans API, ya le mot interface) et on nous propose une implémentation sur `ingredient.miam.fr`.

On injecte la dépendance certe, mais il y a un problème de responsabilité. Est-ce la responsabilité de la webapp _recette_ de maintenir la liste de toutes les implémentations des interfaces dont elle dépend ? Bien sûr que non, et c'est d'autant plus vrai quand il existe une armée de [micro-développeurs](http://www.arolla.fr/blog/2015/12/comment-devient-on-un-micro-developpeur/) qui s'amusent à changer la topologie du SI.
Alors on sépare les responsabilité, et l'annuaire devient un service distinct qui propose deux fonctionnalités :
- publier une implémentation d'interface pour les fournisseurs
- fournir des implémentation pour les consommateurs

mettre schéma

Et pour bien faire le parallèle avec une application traditionnelle :

même schéma en mettant use, inject, Spring application context

Nous avons résolu la première problématique de distribution des responsabilités, à savoir que la webapp ne travaille 
qu'avec des interfaces et récupère des implémentations qui ne sont pas définies chez elles.

Supposons maintenant que _calcul calories_ crashe soudainement. _recette_ n'est pas au courant et continue de fournir
les mêmes réponses avec un lien sur _calcul calories_. L'utilisateur suit le lien morbide, et pouf ! C'est une très
mauvaise expérience utilisateur. 

Il faudrait que l'annuaire puisse retirer une implémentation quand le fournisseur disparait. 
Ainsi, _recette_ pourrait passer en mode dégradé et ne plus proposer la fonctionnalité de calcul des calories.
Ce mode dégradé n'est certes pas souhaitable, mais il est préférable au mode qui propose une fonctionnalité qui 
ne fonctionne pas.

Deux stratégies me viennent à l'esprit pour résoudre ce problème de de tolérance aux pannes.
 
La première admet qu'il existe un mécanisme de détection de disponibilité entre l'_annuaire_ et le fournisseur d'interface.
Cela peut aller d'un simple [keep alive TCP](http://www.tldp.org/HOWTO/TCP-Keepalive-HOWTO/overview.html), à la 
transmission d'un message de haut niveau dans le protocole de communication avec l'_annuaire_. Quand l'_annuaire_ détecte
l'indisponibilité d'un fournisseur, il retire ses implémentations. Le consommateur d'interface ne trouvant pas
d'implémentation peut prendre les mesures nécessaires.

Dans la seconde solution, l'_annuaire_ mémorise temporairement les implémentations associées à un fournisseur. Le 
 fournisseur doit régulièrement publier ses implémentations à l'_annuaire_ avant qu'elles ne périment et disparaissent.
Cette seconde solution ne demande pas de traitement particulier quand un fournisseur devient
indisponible. Il peut cependant exister un moment où les implémentations proposées dans l'annuaire n'existent pas, cela
dépend du taux de rafraichissement.

Avec un tel annuaire nous avons résolu deux problèmes :

- Distribution des responsabilités : le consommateur ne travaille qu'avec des interfaces, il se fait injecter des implémentations.
- Tolérance aux pannes : un consommateur dépendant d'un fournisseur peut réagir à la disparition d'un fournisseur.

Nous avons un nouveau problème.
La webapp _recette_ est maintenant dépendante d'un service d'annuaire [central](https://en.wikipedia.org/wiki/Single_point_of_failure).
Si le service d'_annuaire_ devient indisponible, _recette_ ne peut plus proposer la fonctionnalité de calcul des calories,
 ni les photos des ingrédients. C'est pas terrible !
 
Vous vous en doutez, j'ai là encore une solution ! Je propose que les 3 webapps se parlent directement ! 
L'annuaire existe toujours conceptuellement mais physiquement il s'agit d'une structure de donnée distribuée sur les
3 webapps. Il existe de nombreuses base de données distribuées qui permettent de créer des clusters. Mais celle que 
je veux présenter a l'avantage d'être embarquable par une application.

Dans un article précédent, je mentionnais Hazelcast. La homepage s'intitule "Hazelcast the Leading In-Memory Data Grid",
ce qui ne veut absolument rien dire. J'ai lu pour vous la documentation. Décryptage rapide.

Hazelcast permet de créer un cluster. Tous les noeuds du cluster se valent, il n'y a pas de relation maître-esclave.
Les noeuds du cluster forment un réseau Peer To Peer au dessus de TCP. Déployer Hazelcast signifie que tous les 
noeuds du cluster puisse ouvrir une socket TCP en écoute. C'est une "contrainte" simple mais pas forcément évidente
dans toutes les DSI.

Mais, qu'ont en commun tous ces noeuds ? Que s'échangent-ils ? Des structures de données ! Hazelcast fournit notamment des
implémentations distribuées des structures de données Map, Queue, List, EventBus et Lock. Il permet aussi de distribuer
des calculs via une implémentation d'[Executor](http://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Executor.html)
et de [Map Reduce](https://en.wikipedia.org/wiki/MapReduce). Les structures de données sont en mémoire, mais sont 
"persistantes" dans le sens où les données sont partagées et répliquées sur les noeuds du cluster. Sous le capot,
 quelque chose s'approchant du [hashing consistant](http://www.arolla.fr/blog/2016/01/le-hashing-consistant/) est 
 très probablement utilisé.
 
  
Concrètement, Hazelcast se présente sous la forme d'un jar à embarquer avec son application.
Si vous ne travaillez pas sur la JVM, vous pouvez essayer un client embarquable pour d'autres plateformes ou bien utiliser un 
client distant.

Voici le code Java pour rejoindre un cluster, créer une Map, ajouter une entrée et lire une valeur :



