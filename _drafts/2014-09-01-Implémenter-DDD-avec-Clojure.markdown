Implémenter DDD avec Clojure
============================

Motivations
-----------

En septembre dernier, j'ai participé pendant deux jours à la formation DDD ....

Pendant cette formation, les ateliers pratiques se divisaient en deux langages : C# et Java. J'ai choisi Clojure et j'y ai trouvé beaucoup d'avantages que je voulais approfondir et partager.


Domain Driven Design
--------------------

Cet article n'a pas pour objectif de présenter DDD. Mais pour ceux qui ne connaissent pas encore [Domain Driven Design](http://en.wikipedia.org/wiki/Domain-driven_design),
il s'agit d'une approche et de bonnes pratiques pour développer un logiciel. DDD est axé sur le coeur de métier et permet de créer un logiciel conforme, extensible et compréhensible. Le sujet est très riche, il couvre à la fois les aspects fonctionnels et techniques, et mérite vraiment une attention particulière. 


Clojure
-------

[Clojure](http://clojure.org) est un langage à là Lisp. Le profane le trouve peu esthétique. Passé cette première impression c'est un langage qui se révèle :

- pratique : REPL, rechargement de code à chaud, orienté donnée, gestion de l'identité (vs valeur)

- simple : peu d'éléments dans le langage

- cohérent : l'API de base est bien articulée

- ubiquiste : Clojure compile en bytecode JVM. ClojureScript compile en JavaScript. ClojureCLR tourne sur CLR. Le langage est interopérapérable avec la plateforme sous-jacente (utilisation de librairies natives).

Bref, j'adore ce langage.


Sujet d'étude
-------------

Pour illustrer mes propos j'ai choisi le domaine médical.

Prises de notes
===============

Le pilier centrale de DDD est le métier. On essaye donc toutes les astuces possibles pour faire parler les experts métier (rarement disponibles). L'expert fait des phrases. Il introduit un vocabulaire riche composé de noms et de verbes. Il donne des définitions, des règles, des exemples. La prise de note est essentiel pour ne pas perdre ces précieuses informations.

Clojure est un langage concis et expressif. On peut donc essayer de prendre ces notes sous forme de code Clojure.
Le but de DDD n'est pas de rédiger une expression de besoin mais d'implémenter un logiciel qui réponde expressivement à un besoin. Deplus, en tant que développeur, j'ai l'habitude de raisonner avec du code. L'écriture du code sucite des interrogations et oblige à creuser le détail. La prise de note sous forme de code est donc un grale à atteindre.

Pendant la formation, c'est ce que j'ai essayé de faire et ça marche plutôt bien. Bien sûr dans le cadre d'une formation, les exemples sont simples et bien énoncés. Dans la réalité ce n'est peut-être pas aussi simple et l'on devra sans doute se contenter de pseudo-code à paufiner. Par exemple l'expert vous dit :

    Expert : Le médecin prescrit au patient une ordonnance pour que le patient puisse aller retirer ses médicaments au dispensaire.

Cette phrase doit suciter beaucoup de questions mais elle peut s'exprimer en code aussi vaguement :

~~~clojure
        (defn prescrire [medecin patient ordonnance] )
    (defn retirer-medicaments [patient dispensaire])
~~~

C'est une bête traduction de la phrase. La convention est que le premier argument de chaque méthode est l'objet porteur de l'action (`this`). En Java on aurait

~~~java
    medecin.prescrire(patient, ordonnance)
    patient.retirerMedicament(dispensaire)
~~~

ou alors on définirait les actions dans un service, pour avoir

~~~java
    interface MedicService {
        void prescrire(Medecin medecin, Patient patient, Ordonnance ordonnance);
        void retirer-medicament(Patient patient, Dispensaire dispensaire);
    }
~~~

On voit les bénéfices que nous offre la version Clojure :

- La version Clojure est un code qui est valide. On peut l'évaluer dans une REPL.

- La version Java nécessite la création de 3 classes (Medecin, Patient, Ordonance) pour que ça compile.

- La version Clojure ne fixe pas encore le type des paramètres. Ordonnance pourra être un `vector`, une `map`, un `record`, ou une `class` java. C'est un détail à décider plus tard : on prend des notes.

- La version Clojure ne force pas le choix cornélien entre une méthode d'un objet et un service. On ne sait pas encore. C'est aussi un détail à décider plus tard.

Ces deux lignes de code suscitent des interrogations. Elles permettent de s'immerger dans le métier en continuant l'interview de l'expert. C'est une première **expérience**, un premier jet sans réflexion mais durant lequel on essaye de faire ce pour quoi on est payé : répondre à un besoin avec du code. A l'issue de l'entretien on a quelque chose de concrêt sur lequel raisonner.

Dans son livre, Eric Evans semble prendre une direction opposée à celle-ci. Il utilise des schémas pour se mettre d'accord avec l'expert, puis passer à un prototypage. En revanche, il mentionne que le modèle émerge notamment grâce à une _boucle de feedback au travers de l'implémentation_ (_feedback loop through implementation_), ce qu'on est justement entrain de faire avec un expert à nos côtés.

La prise de note sous forme de code est définitevement à tester en situation réelle. Clojure, par son aspect dynamique, est à mon avis un langage qui se prête bien au jeu.


Architecture
------------

DDD est agnostique à l'architecture utilisée. A vrai dire DDD ne traite pas d'architecture. Implémenter DDD consiste à développer une librairie avec une API qui répond aux cas d'utilisation métier et où chaque ligne de code transpire le métier. Le code ne doit en aucun cas être pollué par des imports de framework ou des contraintes d'architecture. 

### Architecture en couche

 Dans son livre Evans met l'accent sur une _architecture en couche_. En 2003, c'était le truc vachement bien. Pour qu'une architecture en couche puisse être testable et modulaire, il faut appliquer _Dependency Inversion Principle_ :

 - les modules de haut niveau (qui ont une dépendance), ne doit pas dépendre des modules de bas niveau (la dite dépendance). Les modules doivent dépendre d'une abstraction.

 - les abstractions ne doivent pas faire apparaître les détails d'implémentations. Les détails doivent dépendre des abstractions
 
 L'exemple typique est le _repository_. Notre coeur de programme n'ayant pas de dépendance, il doit définir une interface utilisée dans les autres morceaux de code, un _service_ par exemple. Cette interface est alors implémentée dans la couche de persistance avec toutes les dépendances techniques dont elle a besoin.

 Admettons que nous ayons le _service_ suivant :
 
~~~clojure
        (ns pharma.prescription.service)
     
        (defn prescrire-ordonnance [medecin-id patient-id ordonnance]
          (let [medecin (medecin-of-id medecin-id)]
            (throw (Exception. "not yet implemented"))))  
~~~ 

`prescrire-ordonnance` est un _service_.  Il a besoin de récupérer le médecin via la fonction `medecin-of-id`.

Dans un langage fonctionnel, une fonction est une valeur et son abstraction est sa signature. Clojure n'étant pas fortement typé, n'importe quelle fonction d'un argument bindée au symbole `medecin-of-id` fait l'affaire.

~~~clojure
(defn prescrire-ordonnance [medecin-of-id medecin-id patient-id ordonnance]
  (let [medecin (str (medecin-of-id medecin-id))]
    (throw (Exception. "not yet implemented"))))
~~~

On peut injecter le service en paramètre. L'inconvénient, je trouve est que ça dénature la signature de `prescrire-ordonnance`.

L'utilisateur peut retrouver la signature originelle avec une partielle mais cela reste peut pratique.

~~~clojure
        (def prescrire-ordonnance (partial prescrire-ordonnance (fn [id] (throw (Exception. "TODO"))))      
         
         (prescrire-ordonnance 1 1 [])
~~~
 
C'est mieux. Mais ce serait encore plus satisfaisant si `medecin-of-id` pouvait être récupéré de manière plus dynamique et élégante. Nous avons pour cela 3 patterns : _Plugin_, _Service Locator_ et _Injection de Dépendance_.
 
 
#### DIP en long, en large

 
 
 Ne pas confondre :
 
 - Dependency Injection : qui est juste un pattern qui fournit une référence à une dépendance. 
    
- Inversion Of Control : est un style programmatique. "Ne nous appelez pas, c'est nous qui vous rappelons". L'exemple classique est le passage d'une callback à un listener d'évênement : "Quand le bouton est cliqué, exécute moi ce code".






Le découplage des composants de haut niveau des composants de bas niveau est obtenu en créant des interfaces appatenant aux packages de haut niveau.

Le rôle de DI est de découpler la manière dont une dépendance est obtenue. Elle ne joue aucun rôle dans l'abstraction et un rôle mineur dans le découplage.






### Alors DIP ou pas DIP ?

Dans le cadre de DDD, il est néanmoins nécessaire de créer des _interfaces publiques_ car on crée un API. On peut certes s'en passer si les couches supérieures utilisent Spring ou Mockito mais nous ne voulons pas faire de telles suppositions.

On veut aussi créer des interfaces car on crée des SPIs. Typiquement, pour nos  _repositories_ car notre coeur logiciel est indépendant des technologies de persitence ou de communication sous-jacentes.

Par contre à l'intérieur, c'est dans 99% des cas une idiotie que de créer des interfaces.

On a donc  2 types d'interfaces :

- celles de l'API (Application Programming Interface), qui sont les points d'entrée concrêts permettant d'utiliser notre coeur logiciel.
 
- celles de la SPI (Service Provider Interface), qui sont les points de sorties qui permettent d'implémenter les briques purement technique.

Dans les deux cas les interfaces sont spécifiques au métier que l'on est entrain de développer. Des interfaces de type CRUD sont typiquement à proscrire.

On voit qu'il n'est pas tellement aisé de parler d'architecture en couche, surtout dans un contexte de connectivité.

### Architecture hexagonale

Vaughn Vernon utilise quant à lui une architecture dite _hexagonale_. Je trouve que cela s'inscrit bien dans le contexte de connectivité de 2013. Il n'est pas rare d'être fournisseur de service pour plusieurs clients avec des besoins spécifiques (desktop vs mobile) et l'on devra développer plusieurs _ports_ et _adapters_. 

http://stackoverflow.com/questions/2954372/difference-between-spi-and-api


### Event sourcing

Aussi il utilise avantageusement l'_event sourcing_. L'_event sourcing_ permet notamment de rendre son SI immutable et cela colle parfaitement avec un langage fonctionnel. 




Value "objects"
------
Record ou pas ?


Entities
--------

Services 
--------

Aggregate
---------
Invariants, consistance
preconditions ?
schema ?

Factories
---------
factory functions and constructors

Repositories
------------

Supple Design
------------

Documentation
------------------
style déclaratif
préconditions
métadonnées








En Clojure, les fonctions n'ont pas besoin d'être encapsul