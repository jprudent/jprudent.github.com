---
layout: default
title: Dependency Inversion Principle
categories:
- articles_prog
published: true
---

# Dependency Inversion Principle

<div id="toc-js">
</div>

## Motivations

En creusant sur DIP je me suis apperçu que je avais à peine effleuré le sujet, que je l'avais mal appliqué et que je confondais plein de choses.

Cet article me permet avant tout de clarifier mes propres connaissances. J'espère qu'il pourra vous être aussi utile.

### Motivation 1 : Réflexion sur mes pratiques de développement.

Je suis arrivé sur le marché du travail en 2006, sur un gros projet en Java. A cette époque, on était en plein boom Spring. L'un des point fort de Java est l'_interface_, qui est un super moyen d'abstraction. Ajoutons là dessus Spring pour faire de l'injection et de la manipulation de code (AOP, Transactions, ...) et les interfaces deviennent indispensables. On crée donc des interfaces à tout va. Cela permet même de tester son code plus facilement !

Aussi les librairies ont beaucoup évoluées et rendent le découpage interface / implémentation dispensable. Spring est capable d'injecter des implémentations sans interface. Mockito est capable de mocker des implémentations aussi bien que des interfaces. La création systématique d'interface est un anti pattern. Ce n'est pas justifié.

__Dans quelles circonstances une interface a une valeur ajoutée ?__

### Motivation 2 : Désambiguïser les concepts

J'entends parler de Dependency Inversion Principle, de Dependency Injection et de Inversion of Control. Tout ça semble nécessiter la création d'interface. L'interface permet de découpler le code, de tester facilement et d'utiliser Spring. 

__Tous ces termes - DIP, DI, IoC - c'est pour les [pinailleurs](http://en.wiktionary.org/wiki/enculeur_de_mouches), c'est la même chose, n'est-ce pas ?__

### Motivation 3 : Un devoir d'histoire

En tant que "jeune" développeur, il faut donc comprendre les problèmes du passé pour donner du sens aux pratiques du présent. Le papier de Robert C. Martin, qui a inventé ce terme, date de 1996! 18 ans! Personne n'avait de téléphone portable ! Internet c'était [36 millions d'utilisateurs](http://www.internetworldstats.com/emarketing.htm) (3 milliards aujourd'hui) ! Java était en version 1.0 !

Beaucoup de patterns sont historiques. Les langages ont petit à petit simplifié l'usage des patterns allant jusqu'à les inclure carrément dans le langage. L'_interface_ de Java est un outil d'abstraction beaucoup plus simple que le _header file_ et les classes purement abstraites de C++.

 __DIP est-il une réponse technique à un problème technique de l'époque ?__

## Dependency Invertion Principle

### Objectif 

Dans son [article original](http://www.objectmentor.com/resources/articles/dip.pdf), Robert Martin définit un code avec avec un mauvais design :
 
 1. Du code _rigide_ : un code difficile à modifier car chaque changement affecte plusieurs parties du system
 
 2. Du code _fragile_ : Quand on fait un changement, on fait une régression sur une partie inattendue du système.
 
 3. Du code _immobile_ : le code a tellement d'adhérence avec l'application qu'il est impossible de l'extraire pour le réutiliser.
 
 Ce qui rend un code rigide, fragile, et immobile est l'adhérence entre modules. DIP permet de mieux maitriser ces adhérences en appliquant ces deux principes :
 
 - les modules de haut niveau (qui ont une dépendance), ne doit pas dépendre des modules de bas niveau (la dite dépendance). Les modules doivent dépendre d'une abstraction.

 - les abstractions ne doivent pas faire apparaître les détails d'implémentations. Les détails doivent dépendre des abstractions.
 
### Mise en oeuvre
 
#### Couplage 

 Voici du code couplé :
 
 ![Service->Persistance](/images/articles/DIP/0.png "Du code couplé")
 
 Le code de `Service` utilise et dépend du code de `Persistance`. `Persistance` contient tous les détails d'implémentation. Plus un composant est détaillé, plus il est probable qu'il soit soumis à modification. La modification de `Persistance` peut impacter `Service`. Il faut les découpler.
 
#### Découplage
 
 On découple `Service` et `Persistance` en ajoutant une _abstraction de Persistance_ :
 
![Service->Abstraction<-Implementation](/images/articles/DIP/1.png "Du code découplé")
  
 Wahou, c'est une interface. Mais quelle interface ?
 
#### Niveau conceptuel de la dépendance

Soit `java.sql.Connection` l'abstraction de `Persistance`:

![Service->Connection<-Persistance](/images/articles/DIP/2.png "Une interface au mauvais niveau")

Cette interface contient des méthodes comme `close` ou encore `createStatement` alors que `Service` parle de votre métier. Certes `java.sql.Connection` permet de se découpler du vendeur de base de données mais le code métier est pollué de détails relatifs à la persistance.
L'interface JDBC ne permet pas de résoudre notre problème particulier, mais de résoudre un problème global : converser avec une base de donnée.

DIP ne se résume pas à une interface. Une interface est une abstraction qui nous aide à écrire du bon code, mais ce n'est pas suffisant. Il faut en plus qu'elle soit au même niveau conceptuel que le code qui en dépend :

![Service->Repository<-RepositoryImpl](/images/articles/DIP/3.png "Une interface au bon niveau")

Pour que DIP fonctionne, les interfaces doivent avoir un niveau d'abstraction approprié aux besoins réels du système. Par exemple on privilégie une interface Repository avec des méthodes propre au domaine versus un CRUD incipide. `Repository` contient des méthodes relatives au métier fournit par `Service`, comme `findMauvaisPayeurs` ou `payerFacture`. 
 
#### Inversion de la dépendance

L'interface doit être définie par celui qui l'utilise et doit se retrouver dans le même package, voir module.

![(Service->Repository)<-RepositoryImpl](/images/articles/DIP/4.png "Interface fournie")

La dépendance est inversé car `Service` ne dépend plus de `Persistance`. Au contraire elle devient fournisseur d'une interface (SPI) à laquelle se conformer. Elle impose un vocabulaire et des fonctionnalités.
 
DIP permet de dépendre d'un concept plutôt que d'une implémentation. Et les concepts changent rarement une fois qu'ils ont été analysés et établis (voir DDD, BDD) alors que les implémentations sont souvent mouvantes (refactoring, structure de l'entreprise, effet de mode, ...). 

DIP n'enlève pas la dépendance mais la spécialise et la relocalise.
 
 Le bénéfice est que `Service` est réutilisable en l'état si au lieu d'une base de donnée SQL on décide de passer à du NoSQL. `SqlRepository` ne contient pas de code stratégique. Elle se cantonne à passer des octets en RAM sur disque dur.
 
## Relations entre DIP, DI et IoC

L'Inversion of Control (IoC) est un style programmatique : _Ne nous appelez pas, c'est nous qui vous rappelons_. L'exemple classique est le passage d'une callback à un listener d'évênement : "Quand le bouton est cliqué, exécute moi ce code". L'IoC est mis en oeuvre dans un framework (cadre de travail litéralement) : DOM, Spring ...  Ces deux frameworks n'ont pas les mếmes ambitions mais utilisent toutes deux IoC.

["what aspect of control are they inverting?"](http://martinfowler.com/articles/injection.html) se demandait Martin Fowler. Dans le cadre de Spring, l'IoC gère la résolution des dépendances, la configuration et le cycle de vie d'un object. 

Dependency Injection est une forme d'IoC qui permet d'externaliser le cablage des composants. On dit a Spring : _"Quand Service a besoin d'une référence vers Repository, utilise SqlRepository"_.

On utilise DI pour résoudre les dépendances dans le cadre de DIP. Mais on pourrait utiliser un _Service Locator_ à la place.


## Epilogue

C'est avec un sentiment de honte et de soulagement que j'achève cet article. Honte d'avoir mis autant de temps à maitriser le sujet. Honte de n'y avoir jamais accordé davantage importance. Soulagé de mettre ça une fois pour toute derrière moi.

Et pour répondre à mes questions :

- Dans le cadre de DIP, la plus value d'une interface est de maitriser une dépendance et rendre un composant réutilisable.

- IoC définit le sens d'appel du code, DI permet de cabler du code, et DIP donne une forme au code.

- DIP est un outil pour concevoir une application et n'a rien à voir avec la technologie sous-jacente. 

## Sur le web

Cet article est notamment inspiré de :

-  [papier original de Robert C. Martin sur DIP](http://www.objectmentor.com/resources/articles/dip.pdf)

-  [Cet article](http://martinfowler.com/articles/dipInTheWild.html) présente plusieurs usages de DIP.

-  [Cet article](http://aspiringcraftsman.com/2008/12/28/examining-dependency-inversion) renforce le précédent.
