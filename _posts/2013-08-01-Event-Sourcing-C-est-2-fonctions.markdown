# L'event sourcing c'est juste 2 fonctions!

## Générateurs d'évênements

Soit `A` l'ensemble des _aggregate roots_
Soit `G` l'ensemble des fonctions qui étant donnés un nombre variable
de paramètres, produit une liste de tuples (e,a) avec e ds E et a dans A.

C'est via les fonction de G que l'utilisateur agit sur le modèle,
en générant des évênements pour un aggregate root.
Chaque tuple (e,a) définit un évênement e à appliquer sur un aggrégate
root a.

## Consommateurs d'évênements

Soit `C` l'ensemble des fonctions `C: (e,a1) -> a2`.

Une fonction `c` prend un évênement `e` et l'applique sur un aggrégate 
root `a`. En terme purement fonctionnels, a1 étant dans l'état 1,
`c` renvoie `a2` qui est `a1` auquel on a appliqué `e`.

Pour tout `(e,a)`, `c` doit à n'importe quel instant `t` renvoyer `a2`.
Autrement dit, le résultat de `c` est déterministe.

## Mise en oeuvre

Pour mettre en oeuvre l'event sourcing il suffit de 

* Créer un ensemble G permettant d'inter-agir avec le domaine.
Cela s'appelle des services. Ils doivent produire des évênements 
cohérents. Un évênment doit obligatoirement être couvert fonctionnellement
par le modèle métier.

Par exemple, imaginons un jeu de bataille avec 32 cartes. Un joueur
ne peut pas jouer la carte _13 de rémoulade_ car cette carte n'existe pas.
Il ne peut pas commencer une partie seul.

* Créer un ensemble C pour consommer les évênements.
Ces fonctions ont une parfaite maitrise du métier et savent exactement
comment agir sur l'aggregate root et le transformer. Elles font 
partie intrinsèquement du modèle métier.

Par exemple l'évènement _jouer un roi de coeur sur un 7 de coeur_ conduit
à changer le nombre de plis gagnant d'un des joueurs et d'initier un
nouveau tour de jeu.

## Conclusion

Ben voilà, l'event sourcing c'est tout bête:

- générer des évêments
- les consommer sur des aggregates

Reste à organiser son code pour cela, et à gérer la persistance.
