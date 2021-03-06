# Environnement de développement

## Repl 

## IDE

## Build tool

# Caractéristiques du code

## C'est du Clojure

### Régularité

Le code est *régulier*. Il existe très peu de fantaisie dans la syntaxe contrairement à [d'autres langages concurrents](http://brenocon.com/scalacheat). De ce fait, pour un oeil exercé, la lecture est grandement facilitée. 

Il est possible de forcer encore la régularité en limitant le plus possible la création de macros funkys et de suivre un bon [guide de style](https://github.com/bbatsov/clojure-style-guide).

Autre avantage de la régularité est qu'on 

Le code est *concis*. Programmer en fonctionnel avec Java 8 est beaucoup plus verbeux. Clojure fournit les bons sucres syntaxiques pour manipuler les structures de données de base. Et qui dit moins de code dit moins de commentaire (je vous laisse apprécier si c'est un sophisme ou non). 

# Documentation et commentaires

La documentation permet d'utiliser correctement une API et de décrire un produit. Elle est aussi bien utile au producteur qu'au consommateur.

Le commentaire en revanche est un détail interne qui ne parle qu'aux développeurs. On dit d'un commentaire qu'il n'est jamais nécessaire.

## DSL

Un programme écrit avec un DSL est autodescriptif. Il n'y a pas de bruit technique. Les commentaires sont inutiles.

Clojure est [expressif](http://www.infoq.com/news/2013/03/Language-Expressiveness). Il permet de construire des DSL "à la Lisp". On ne peut pas se "débarrasser" des parenthèses. En revanche on peut créer des verbes avec des fonctions, des noms avec des _var_s et de la donnée. Voici un extrait d'un jeu vidéo :

        (defn move-enemy [{:keys [enemy? in-zone? id] :as enemy-entity}]
          (when (and enemy? in-zone? (not (moving-fast? enemy-entity)))
            (let [added-velocity (random-vec2 x-max y-max)]
              (add-event [:enemy-moved id added-velocity]))))

On peut également s'appuyer sur un jeu de macros pour casser un peu la régularité du langage. Voici par exemple l'utilisation d'[un DSL que j'ai écrit](https://github.com/jprudent/hdl-clj/blob/master/src/hdl_clj/core.clj) pour définir des portes logiques :

    (hdl/defgate Or [a b] => [out]
                 (Not [a] => [not-a])
                 (Not [b] => [not-b])
                 (And [not-a not-b] => [w])
                 (Not [w] => [out]))
             
et voici le langage HDL qu'il permet de générer :

    (println (hdl/gate->hdl Or))
    /** Generated with hdl-clj **/
    CHIP Or{
        IN a, b;
        OUT out;
        PARTS :
        Not(a=a, out=not-a);
        Not(a=b, out=not-b);
        Not(a=not-a, out=w);
        Not(a=w, out=out);
    }

L'inconvénient est que pour écrire un DSL il faut souvent avoir recours à des macros qui a mon sens sont difficiles à lire et concevoir (question d'habitude ?). C'est un problème que l'on observe aussi en Scala où on doit utiliser de la syntaxe avancée (_implicits_, notation _infixe_, ...).

## Préconditions / Postconditions
Il est parfois plus simple d'écrire des préconditions et des postconditions au lieu de gros patés de chaines de caractère. De plus, c'est de la documentation vivante, on ne peut pas oublier de la mettre à jour. Elle est exécutée uniquement sur les environnements de développement. Les préconditions permettent de décrire les paramètres en sorties. Les postconditions permettent de décrire les propriétés invariables de la fonction.

    (defn replacev-at [v i val]
      {:pre [(vector? v)                  ;; v doit être un vecteur
             (not (neg? i))               ;; i ne doit pas être négatif
             (> (count v) i)]             ;; i doit être adressable dans v
       :post [(= val (nth % i))           ;; le ième élément du vecteur doit être égal à val
              (= (count v) (count %))]}   ;; le vecteur n'a pas changé de taille
       (into (conj (subvec v 0 i) val) (subvec v (inc i))))
        
    (replacev-at [] 0 true)
    AssertionError Assert failed: (> (count v) i)
    (replacev-at {} 1 true)
    AssertionError Assert failed: (vector? v)
    (replacev-at ["j" "p"] -1 true)
    AssertionError Assert failed: (not (neg? i))
    (replacev-at [1 9 3] 1 2)
    => [1 2 3]

## Schema

## Metadonnées
Par défaut une _var_ a quelques métadonnées prédéfinies:

    (def rounded-pi 3.14)
    => #'user/rounded-pi
    (meta #'rounded-pi)
    {:ns #<Namespace user>,
     :name rounded-pi,
     :file
     "/home/stup3fait/.IntelliJIdea14/system/tmp/form-init8681063326206695118.clj",
     :column 1,
     :line 1}
    => nil
    
On peut attacher des métadonnées à n'importe quelle `var`.
Ces métadonnées sont accessibles au runtime, d'autres fonctions (ou elle même !) peuvent s'appuyer dessus. Libre d'imaginer ce que l'on peut faire avec !

    (defn ^{:deprecated true} old-service [] (println "Bien le bonjour"))
    => #'user/old-service
    
    (defn new-service [] ("slt"))
    => #'user/new-service
    
    (defn deprecation-warning [f & args]
      (when (:deprecated (meta f))
        (println "Warning ! The service is deprecated"))
      (apply f args))
    => #'user/deprecation-warning
    
    (deprecation-warning old-service)
    Bien le bonjour
    => nil
    
    (deprecation-warning #'old-service)
    Warning ! The service is deprecated
    Bien le bonjour
    => nil

## Docstrings

Une _docstring_ est une métadonnée. La plupart des fonctions et macros permettant de définir quelquechose (_var_, _protocol_, ...) autorise la création de cette méta donnée un peu particulière.

    (:doc (meta #'rounded-pi)) ;; cherche la valeur pour la clé :doc dans la map des métadonnées
    => "valeur de pi arrondi à 2 décimales"

Il est donc possible d'accéder à la documentation au runtime. Notamment la fonction `doc` fait cela très bien.

    (doc rounded-pi)
    -------------------------
    user/rounded-pi
      valeur de pi arrondi à 2 décimales
    => nil

 
