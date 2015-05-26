# Documentation du code

## Pas besoin de documentation !

Un code Clojure a deux caractéristiques essentielles :

1. Le code est *régulier*. Il existe très peu de fantaisie dans la syntaxe contrairement à [d'autres langages concurrents](http://brenocon.com/scalacheat). De ce fait, pour un oeil exercé, la lecture est grandement facilitée. Il est possible de forcer encore la régularité en limitant le plus possible la création de macros funkys et de suivre un bon [guide de style](https://github.com/bbatsov/clojure-style-guide).
Un code concis a besoin de beaucoup moins de documentation.

2. Le code est relativement concis. Clojure fournit les bons sucres syntaxiques pour accéder aux structures de données. Il permet de construire des DSL "à la Lisp". Voici par exemple l'utilisation d'[un DSL que j'ai écrit](https://github.com/jprudent/hdl-clj/blob/master/src/hdl_clj/core.clj) pour définir des portes logiques :


    (hdl/defgate Or [a b] => [out]
                 (Not [a] => [not-a])
                 (Not [b] => [not-b])
                 (And [not-a not-b] 
             
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

## DSL
Clojure est expressif. Il permet de construire des DSL "à la Lisp".

## Préconditions / Postconditions
Il est parfois plus simple d'écrire des préconditions et des postconditions au lieu de gros patés de chaines de caractère. Deplus, c'est de la documentation vivante exécutée uniquement sur les environnements de développement.

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
Ces métadonnées sont accessibles au runtime, d'autre fonctions (ou elle même !) peuvent s'appuyer dessus.
Exemple choix d'une version d'un service.

## Docstrings
Une _docstring_ est une simple métadonnée. La plupart des fonctions et macros permettant de définir quelquechose (_var_, _protocol_, ...) autorise la création de cette méta donnée un peu particulière.

    (:doc (meta #'rounded-pi)) ;; cherche la valeur pour la clé :doc dans la map des métadonnées
    => "valeur de pi arrondi à 2 décimales"

Il est donc possible d'accéder à la documentation au runtime. Notamment la fonction `doc` fait cela très bien.

    (doc rounded-pi)
    -------------------------
    user/rounded-pi
      valeur de pi arrondi à 2 décimales
    => nil

 
