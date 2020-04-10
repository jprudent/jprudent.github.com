---
layout: default
lang: fr
title: Expérimentation de FRP avec Bacon.js
category: articles_prog
categories:
- articles_prog
tags:
- paradigm
- javascript
---

# Expérimentation de FRP avec Bacon.js
<div id="toc-js">
</div>

## La théorie


### Ethymologie

Tout anagramme mérite une petite explication. C'est souvent par là qu'il faut commencer pour mieux comprendre une technologie.

Functional Reactive Programming

Reactive : d'après [wordnet](http://wordnetweb.princeton.edu/perl/webwn?s=reactive) "qui réagit à un stimulus".

Functional Programming: fait référence à la [programmation fonctionnelle](http://fr.wikipedia.org/wiki/Programmation_fonctionnelle)


### Analogie

L'analogie que l'on retrouve le plus souvent sur le net pour expliquer FRP est la feuille de calcul d'un [tableur](http://www.libreoffice.org/features/calc/screenshot-of-calc-the-libreoffice-spreadsheet-program/).

Certaines cellules contiennent des `valeurs` que l'utilisateur peut changer, et d'autres des `formules`.

Par exemple

![alt une formule dans un tableur](/images/articles/frp/spreadsheet.png)

Appliqué à FRP une feuille de calcul s'explique de la manière suivante :

- `A1` et `B1` sont des _streams d'events_. Quand un utilisateur change la valeur de la cellule, un _event_ est envoyé à la cellule qui change alors sa _valeur courante_
- `C1` est aussi un _stream d'events_. Seulement, les évênements ne sont plus générés directement par l'utilisateur mais induits par un changement de _valeur courante_ de `A1` et `B1`.
`C1` _réagit_, _observe_, _écoute_ les _évênements_ des deux autres cellules.


C'est sorte d'implémentation du fameux [observateur](http://fr.wikipedia.org/wiki/Observateur_%28patron_de_conception%29).

### Vocabulaire

Sur le net on trouvera un vocabulaire éparse et confus pour désigner des concepts sémantiquements identiques. Enumérons :

- _event_ : les stimuli de l'application
- _event stream_, _property_, _behaviour_, _observable_ :  une variable qui réagit à des _events_
- _observer_, _listener_ : généralement une fonction qui prend la _valeur courante_ d'un _event stream_ et réalise un _side effect_.
- _side effect_ : une action qui modifie l'environnement. Par exemple une sortie sur la console, une affectation de variable ou encore la manipulation du DOM.

## Présentation Bacon.js

[Bacon.js](https://github.com/baconjs/bacon.js) prend son inspiration en la librairie [RxJs](https://github.com/Reactive-Extensions/RxJS) de Microsoft.

Bacon.js propose deux types d' _observable_:

- _event stream_
- _property_ : est très similaire à _event stream_, à l'exception qu'une _property_ a toujours une valeur, dès sa création.

Bacon.js propose des méthodes pour passer d'un type d'_observable_ à l'autre, et des méthodes pour créer et [mixer](https://github.com/baconjs/bacon.js/wiki/Diagrams) des _observables_.
Le plus simple, est d'aller faire un tour sur le [readme](https://github.com/baconjs/bacon.js/tree/master) du projet pour vous faire un première idée. Visitez le [wiki](https://github.com/baconjs/bacon.js/wiki) et les quelques exemples.

## La pratique

### Objectif

Dans ce document d'exploration on va implémenter un formulaire qui permet de choisir son pays. La liste des pays est récupérée d'un service qui cause en JSON. Il faudra gérer un spinner et la gestion des erreurs. Simple ? Cela dépend de la rigueur que l'on met à traiter tous les états ...

J'ai écrit un petit serveur tout simple en clojure dont les sources sont [ici](https://github.com/jprudent/jam-frp). Pour le builder, il faut récupérer [lein](http://leiningen.org/) et
lancer la commande

    lein ring server

Autrement, l'application complète (client et serveur) est déployée sur [http://rocky-reef-4045.herokuapp.com/index.html](http://rocky-reef-4045.herokuapp.com/index.html). Attention aux yeux,
ça pique un peu comme design :)


### Récupérer la liste des pays

Un GET sur [/countries](http://rocky-reef-4045.herokuapp.com/countries) permet de récupérer la liste des pays. C'est un objet JSON de cette forme :

{% highlight javascript %}
    {
      "FRA" : "France",
      "VEN" : "Venezuela"
    }

{% endhighlight %}

Bacon.js s'intègre bien avec [jQuery](http://www.jquery.com). `fromPromise` permet de créer un `EventStream` pour un appel ajax renvoyant une promesse.

{% highlight javascript %}
    var ajaxCountries = Bacon.fromPromise($.ajax(URL.countries)) // creation d'un event stream à partir de la requête ajax
      .mapError("ERROR"); // en cas d'erreur produit une string spéciale
{% endhighlight %}

Si l'appel réussit, le stream `ajaxContries` contiendra la réponse du serveur. Sinon l'état du stream est en erreur.
Le cas d'erreur est un peu spécial, il ne produit pas de valeur mais fait basculer l'état du stream à `error`. `mapError` permet de produire quand même une valeur
en cas d'erreur.


A des fins de test, environ 1 fois sur 4 le crache une erreur 500. D'expérience, la gestion des erreurs dans une application faisant un usage d'AJAX doit être prévue depuis la conception.

Votre application Javascript **doit** prévoir les cas d'erreur. Si elle ne les prévoit pas vous aurez sûrement des erreurs de déférencement, et un freeze de l'application. True story.


Donc nous allons déjà adresser le cas d'erreur en créant une nouvelle `Property`.
{% highlight javascript %}
    var isError = function(v){
      return v === "ERROR";
    };

    var isErrorAjaxCountries = ajaxCountries
        .map(isError)
        .toProperty(false)
        .skipDuplicates();
{% endhighlight %}

`map` permet de transformer une valeur en une autre valeur. Ici, si la valeur vaut `"ERROR"` on map à `true` sinon `false`.
`map` et `mapError` renvoient un nouvel `EventStream` et prennent normalement une fonction en paramètre. Cette fonction prend en
paramètre la _valeur_ de l'évènement et retourne la nouvelle valeur.

Ici on passe une constante. C'est un sucre syntaxique pour une fonction qui serait similaire à :

{% highlight javascript %}
    constant = function(v){
      return function(){return v};
    }

    stream.map(constant("ERROR")); // le stream ne contiendra que des true
{% endhighlight %}

`toProperty` transforme un `EventStream` en une `Property` avec une _valeur par défaut_, ici `false`.
En effet, quelque soit l'état de l'application on doit savoir s'il faut ou non afficher le message d'erreur.
C'est la principale différence entre un `EventStream`, qui peut ne pas avoir de valeur (pendant le temps de la requête),
et une `Property` qui a toujours une valeur.

`skipDuplicate` est une petite optimisation qui empêche que deux valeurs consécutives dans le stream soient égales.

Pour résumé, voici les 2 états possibles des deux streams que nous avons créé :

![les 2 états possibles des streams](/images/articles/bacon/ajaxCountries.png)

Pour le moment nous n'avons écrit que des **définitions**. Ce sont des vérités qui seront toujours vraies, quelque soit l'état de l'application.
Nous n'avons que des variables immutables. Aucun _side effect_.


Attaquons nous maintenant aux side effects.

Le DOM sera produit à partir du fichier HTML suivant :

{% highlight html %}
    <!DOCTYPE HTML>
    <html>
    <meta charset="UTF-8">
        <head>
            <link rel="stylesheet" href="index.css" media="all">
        </head>
    <body>
        <span class="error"></span>

        <script src="http://cdnjs.cloudflare.com/ajax/libs/bacon.js/0.7.10/bacon.js" type="text/javascript"></script>
        <script src="http://code.jquery.com/jquery-1.10.1.min.js" type="text/javascript"></script>
        <script src="index.js"></script>

    </body>
    </html>
{% endhighlight %}

Un `span` contient l'erreur. Le reste du document est de la machinerie.

Maintenant, traitons visuellement le cas d'erreur:

{% highlight javascript %}
    var showOrHideErrorMessage = function(show) {
      console.log("showError = ", show);
      if(show) $(".error").show();
      else $(".error").hide();
    }

    isErrorAjaxCountries.onValue(showOrHideErrorMessage);
{% endhighlight %}

A chaque fois qu'une nouvelle valeur arrive dans la `Property` `isErrorAjaxCountries`, on appelle la fonction chargée d'exécuter le _side effect_, ici `showOrHideErrorMessage`.
Cette fonction peut faire n'importe quoi. Ici elle cache le span si la valeur est `false`, sinon elle l'affiche.

Nous avons géré un appel ajax en traitant le cas d'erreur avec 2 vars et 2 fonction.

### Ajout du spinner de chargement

{% highlight javascript %}
    var isOngoingAjaxCountries = isErrorAjaxCountries.awaiting(ajaxCountries);
{% endhighlight %}

On **définit** une nouvelle `Property` `isOngoingAjaxCountries` qui vaut :

- `false` tant que l'un des 2 `EventStream` n'a pas été alimenté ou dès que `isErrorAjaxCountries` a été alimenté par `ajaxCountries`
- `true` tant que `isErrorAjaxCountries` n'a pas été alimenté par `ajaxCountries`

{% highlight html %}
  <span class="spinner"></span>
{% endhighlight %}

Visuellement, le spinner n'est qu'un `span` que l'on décide d'afficher ou non.

{% highlight javascript %}
    var showOrHide = function(show, selector){
      if(show) selector.show();
      else selector.hide();
    };

    var showOrHideSpinner = function(show) {
      console.log("showSpinner = ", show)
      showOrHide(show, $(".spinner"));
    };

    isOngoingAjaxCountries.onValue(showOrHideSpinner);
{% endhighlight %}

On applique le _side effect_ pour afficher ou non le spinner, de façon similaire au message d'erreur.

### Affichage d'une boîte de saisie du pays

{% highlight javascript %}
    var isDoneAjaxCountries = ajaxCountries
        .map(not(isError))
        .toProperty(false)
        .skipDuplicates();
{% endhighlight %}

On définit un `EventStream` qui est un peu l'inverse de `isErrorAjaxCountries`.

{% highlight html %}
    <input type="text" name="country" list="countries"/>
    <datalist id="countries">
    </datalist>
{% endhighlight %}

Visuellement, c'est une combobox éditable.

{% highlight javascript %}
    var showOrHideInputCountry = function(show){
      console.log("show country input", show);
      showOrHide(show, $("[name='country']"));
    }

    isDoneAjaxCountries.onValue(showOrHideInputCountry);
{% endhighlight %}

On applique le _side effect_ pour afficher ou non l'input, de façon similaire au message d'erreur.

### Remplissage de la boîte de saisie

{% highlight javascript %}
    var countriesList = ajaxCountries
      .filter(not(isError));
{% endhighlight %}

On définit un `EventStream` qui nous renseigne sur la disponibilité
de la liste des pays.

{% highlight javascript %}
    var fillCountries = function(countries){
      for(var countryCode in countries){
        $("#countries").append('<option value="'+ countries[countryCode] +'">' + countryCode + '</option>');
      }
    };

    countriesList.onValue(fillCountries);
{% endhighlight %}

On remplit la datalist avec la liste des pays.

## Récapitulons

Le code javascript complet est accessible [ici](https://github.com/jprudent/jam-frp/blob/master/src/resources/public/index.js), je vous conseille de le parcourir rapidement. Le code est divisé en deux parties.

<br/>

D'une part, une partie que j'appelle _définitions_. Cette partie est  agnostique à la technologie. Elle décrit le flux de données de notre application.

Chaque `Observable` défini dans cette partie a une sémantique propre et vraie quelque soit l'état de l'application. L'ensemble forme un graphe de dépendances.

- `ajaxCountries` : le résultat de la requête ajax. C'est l'observable tout en haut de la pyramide des dépendances.
- `isErrorAjaxCountries` : contient `true` si la requête s'est mal passée.
- `isDoneAjaxCountries` : contient `true` si la requête s'est bien passée.
- `isOngoingAjaxCountries` : Contient `true` si la requête ajax est en cours.
- `countriesList` : contient la liste des pays.

![graphe de dépendance](/images/articles/bacon/dependencies.png)

Je trouve tout cela claire : on a la requête, ses 3 états et sa valeur finale.
Je trouve aussi que c'est extensible. Par exemple on pourrait retravailler facilement les valeurs de `countriesList` avec un méthode `map` pour les passer en majuscule. Ou alors on aurait pu conditionner `ajaxCountries` par un autre `EventStream` pour ne faire la requête que sous certaines conditions ...

<br/>

D'autre part, une partie appelée _side effects_ qui ne contient que de la logique d'affichage :

- `isErrorAjaxCountries.onValue` : on affiche ou pas un message d'erreur
- `isOngoingAjaxCountries.onValue` : on affiche ou pas un spinner
- `isDoneAjaxCountries.onValue` : on affiche ou pas la boîte de saisie à l'utilisateur
- `countriesList.onValue` : on traite le résultat de la requête

J'ai un bon sentiment sur le code que j'ai écrit. J'ai pas l'impression d'avoir laissé trainer des bugs. On a presque l'impression d'avoir écrit une preuve mathématique.
On ne flippe pas sur un problème de déférencement non plus car toutes les variables sont immutables.

## Difficultés

### EventStream ou Property ?

Bacon.js fait une distinction entre `EventStream` et `Property`. Je trouve que ce n'est pas très pratique, et on est souvent entrain de se demander quel est le type de notre Observable. Aussi, je trouve la barrière entre les deux concepts un peu floue. La seule différence semble être que la `Property` *peut* avoir une valeur par défaut.

### Un graphe de dépendance

Le debuggage est assez compliqué, il n'est parfois pas évident de trouver pourquoi tel événement a eu lieu.
Avec un exemple assez conséquent, on oublie qui dépend de qui. Il faut reparcourir les définitions. Pouvoir extraire un arbre des dépendances et le visualiser synthétiserait et aiderait beaucoup le développeur. J'ai trop souvent recours à des `console.log()` pour debugger.


## Verbosité ?

D'aucun me rétorquera qu'avec jQuery, on fait tout ça de manière moins verbeuse (`complete`, `error`, `success`, ...). J'ai pris une requête ajax en exemple, car cela reste conçis mais j'aurais pu trouver un exemple où jQuery n'offre pas autant de raccourcis.

J'ai également volontairement variabilisé les différentes étapes et les fonctions au lieu de les inliner. Je trouve ça plus claire, la syntaxe de Javascript étant très lourde.


## Aller plus loin ?

J'ai à peine effleuré les capacité de Bacon. Il y a des tas de façon de travailler les streams (`merge`, `flatMap`, ...). Notons aussi qu'il existe un petit `event bus` qui peut se révéler pratique sur des pages de plus grande envergure.


Mais imaginons un scénario plus complexe où après avoir choisi son pays on l'invite à saisir son code postal. Dès que les 2 premiers chiffres sont saisis, on l'invite à choisir sa ville dans une liste récupérée en ajax, tout en lui laissant le choix de compléter son code postal en mettant à jour la liste des villes au fur et à mesure. On ne rend le bouton envoyer cliquable que si tout est saisi sans erreur. Le tout avec spinners et message d'erreur...
Ce que je viens de décrire, je l'ai vraiment implémenté une fois avec un jQuery 1.4 (pas de `complete`, `error`, `success`) et sans plugins (je ne vous dirai pas où, j'ai trop honte). Et c'était l'enfer. Il faudrait que j'essaye de réimplémenter ça ...

## Resources

[https://github.com/baconjs/bacon.js](L'indispensable readme.md)

[http://www.ustream.tv/recorded/29299079](Video of the creator of Bacon.js)
