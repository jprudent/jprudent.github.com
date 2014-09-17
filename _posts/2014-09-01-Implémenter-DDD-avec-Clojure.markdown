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

~~java
    interface MedicService {
        void prescrire(Medecin medecin, Patient patient, Ordonnance ordonnance);
        void retirer-medicament(Patient patient, Dispensaire dispensaire);
    }
~~~

On voit les bénéfices que nous offre la version Clojure :
- La version Clojure est un code qui est valide. On peut l'évaluer dans une REPL.
- La version Java nécessite la création de 3 classes (Medecin, Patient, Ordonance) pour que ça compile.
- La version Clojure ne fixe pas encore le type des paramètres. Ordonnance pourra être un `vector`, une `map`, un `record`, ou une `class` java. C'est un détail à décider plus tard.
- La version Clojure ne force pas le choix cornélien entre une méthode d'un objet et un service. C'est aussi un détail à décider plus tard.

Ces deux lignes de code permettent d'enchainer l'interview (fictif):

    Analyste : - Le médecin peut prescrire une ordonance à n'import qui ?
    Expert :   - Non, chaque patient fait l'objet d'un suivi. A chaque visite le médecin doit pouvoir consulter le dossier médical du patient.


~~~clojure

    (ns prescription)
    (defn prescrire [medecin patient ordonnance] )
    (defn retirer-medicaments [patient dispensaire])

    (ns suivi)
    (defrecord Patient [id])
    (defn historique [patient])
~~~

