layout: default
categories:
- articles_prog
---


Le pattern observer avec Scala
==============================

Introduction au pattern Observer
--------------------------------

Le pattern observer est une manière habile de notifier des informations d’un 
objet, appelé le _sujet_, vers un ensemble d’autres objets, appelés _observeurs_.


Le _sujet_ gère une liste d’_observeurs_. Il envoie une notification à chacun des
membres de cette liste lorsque quelquechose lui arrive. C’est donc le _sujet_ 
qui décide de l’information à envoyer. Il décide dans quelle mesure il 
décide d’altérer l’encapsulation de ses données.


Chaque _observeur_ a quant à lui la possibilité de s’_inscrire_ ou de se 
_désinscrire_ au service de notification du _sujet_.


Ce pattern est extrêmement utile dans les applications évênementielles où la 
mise à jour de certaines parties du code dépend du status d’autres parties ou d’évênements
spontanés (clique de souris, cours d’une cote boursière qui s’effondre, …)

Implémentation en orienté objet
-------------------------------

Le _sujet_ propose un service d’_inscription_ et de _désinscription_. Le sujet 
doit donc implémenter une interface que les observateurs pourront appeler.


Les _observateurs_ doivent être notifiés par le sujet au moyen d’une interface
commune.

Un cas concrêt
--------------

Imagine un jeu d’échec en ligne où le vaiqueur gagne 1 million d’euros. Étant
donné l’enjeu, il faut un _arbitre_ qui vérifie que personne ne triche. Aussi,
Chuck Norris, pardon, Monsieur Chuck Norris a décidé de relevé le défi. Cette 
annonce a médiatisé la compétition et les devs ont bossés un vendredi soir 
pour qu’il soit possible d’assister à la compétition comme spectateur.


Voici ce que donne le faux schéma UML :

<svg viewBox="2 0 531 263" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <g>
    <rect style="fill: #ffffff" x="3" y="2" width="187.1" height="44"/>
    <rect style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" x="3" y="2" width="187.1" height="44"/>
    <text style="fill: #000000;text-anchor:middle;font-size:12.8;font-family:monospace;font-style:normal;font-weight:normal" x="96.55" y="18">&lt;&lt;interface&gt;&gt;</text>
    <text style="fill: #000000;text-anchor:middle;font-size:16;font-family:sanserif;font-style:normal;font-weight:700" x="96.55" y="37">Subject</text>
    <rect style="fill: #ffffff" x="3" y="46" width="187.1" height="52"/>
    <rect style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" x="3" y="46" width="187.1" height="52"/>
    <text style="fill: #000000;text-anchor:start;font-size:12.8;font-family:monospace;font-style:normal;font-weight:normal" x="6" y="60">+register(o:observer)</text>
    <text style="fill: #000000;text-anchor:start;font-size:12.8;font-family:monospace;font-style:normal;font-weight:normal" x="6" y="76">+unregister(o:Observer)</text>
    <text style="fill: #000000;text-anchor:start;font-size:12.8;font-family:monospace;font-style:normal;font-weight:normal" x="6" y="92">+notifyAll()</text>
  </g>
  <g>
    <rect style="fill: #ffffff" x="308.6" y="1.7" width="140.9" height="44"/>
    <rect style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" x="308.6" y="1.7" width="140.9" height="44"/>
    <text style="fill: #000000;text-anchor:middle;font-size:12.8;font-family:monospace;font-style:normal;font-weight:normal" x="379.05" y="17.7">&lt;&lt;interface&gt;&gt;</text>
    <text style="fill: #000000;text-anchor:middle;font-size:16;font-family:sanserif;font-style:normal;font-weight:700" x="379.05" y="36.7">Observer</text>
    <rect style="fill: #ffffff" x="308.6" y="45.7" width="140.9" height="20"/>
    <rect style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" x="308.6" y="45.7" width="140.9" height="20"/>
    <text style="fill: #000000;text-anchor:start;font-size:12.8;font-family:monospace;font-style:normal;font-weight:normal" x="311.6" y="59.7">+notify(o:Object)</text>
  </g>
  <g>
    <rect style="fill: #ffffff" x="18" y="172" width="71.6" height="28"/>
    <rect style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" x="18" y="172" width="71.6" height="28"/>
    <text style="fill: #000000;text-anchor:middle;font-size:16;font-family:sanserif;font-style:normal;font-weight:700" x="53.8" y="191">Joueur</text>
    <rect style="fill: #ffffff" x="18" y="200" width="71.6" height="20"/>
    <rect style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" x="18" y="200" width="71.6" height="20"/>
    <text style="fill: #000000;text-anchor:start;font-size:12.8;font-family:monospace;font-style:normal;font-weight:normal" x="21" y="214">-jouer()</text>
  </g>
  <g>
    <polyline style="fill: none; fill-opacity:0; stroke-width: 2; stroke-dasharray: 8; stroke: #000000" points="96.55,116.236 96.55,135 53.8,135 53.8,172 "/>
    <polygon style="fill: #ffffff" points="104.55,116.236 96.55,100.236 88.55,116.236 "/>
    <polygon style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" points="104.55,116.236 96.55,100.236 88.55,116.236 "/>
  </g>
  <g>
    <rect style="fill: #ffffff" x="217" y="168" width="125.5" height="28"/>
    <rect style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" x="217" y="168" width="125.5" height="28"/>
    <text style="fill: #000000;text-anchor:middle;font-size:16;font-family:sanserif;font-style:normal;font-weight:700" x="279.75" y="187">Arbitre</text>
    <rect style="fill: #ffffff" x="217" y="196" width="125.5" height="20"/>
    <rect style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" x="217" y="196" width="125.5" height="20"/>
    <text style="fill: #000000;text-anchor:start;font-size:12.8;font-family:monospace;font-style:normal;font-weight:normal" x="220" y="210">-vérifierCoup()</text>
  </g>
  <g>
    <rect style="fill: #ffffff" x="421.6" y="168.7" width="109.55" height="28"/>
    <rect style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" x="421.6" y="168.7" width="109.55" height="28"/>
    <text style="fill: #000000;text-anchor:middle;font-size:16;font-family:sanserif;font-style:normal;font-weight:700" x="476.375" y="187.7">Spectateur</text>
    <rect style="fill: #ffffff" x="421.6" y="196.7" width="109.55" height="20"/>
    <rect style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" x="421.6" y="196.7" width="109.55" height="20"/>
    <text style="fill: #000000;text-anchor:start;font-size:12.8;font-family:monospace;font-style:normal;font-weight:normal" x="424.6" y="210.7">-commenter()</text>
  </g>
  <g>
    <polyline style="fill: none; fill-opacity:0; stroke-width: 2; stroke-dasharray: 8; stroke: #000000" points="379.05,83.9361 379.05,117.2 476.375,117.2 476.375,168.7 "/>
    <polygon style="fill: #ffffff" points="387.05,83.9361 379.05,67.9361 371.05,83.9361 "/>
    <polygon style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" points="387.05,83.9361 379.05,67.9361 371.05,83.9361 "/>
  </g>
  <g>
    <polyline style="fill: none; fill-opacity:0; stroke-width: 2; stroke-dasharray: 8; stroke: #000000" points="379.05,83.9361 379.05,116.85 279.75,116.85 279.75,168 "/>
    <polygon style="fill: #ffffff" points="387.05,83.9361 379.05,67.9361 371.05,83.9361 "/>
    <polygon style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" points="387.05,83.9361 379.05,67.9361 371.05,83.9361 "/>
  </g>
  <g>
    <polyline style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" points="283.428,23.7 249.35,23.7 249.35,24 190.1,24 "/>
    <polygon style="fill: #ffffff" points="308.6,23.7 294.6,28.5 280.6,23.7 294.6,18.9 "/>
    <polygon style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" points="308.6,23.7 294.6,28.5 280.6,23.7 294.6,18.9 "/>
  </g>
  <g>
    <polyline style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" points="53.8,220 53.8,233 279.75,233 279.75,216 "/>
    <text style="fill: #000000;text-anchor:middle;font-size:12.7998;font-family:monospace;font-style:normal;font-weight:normal" x="166.775" y="230">sujet</text>
    <polygon style="fill: #000000" points="143.525,230 143.525,222 135.525,226 "/>
  </g>
  <g>
    <polyline style="fill: none; fill-opacity:0; stroke-width: 2; stroke: #000000" points="476.375,216.7 476.375,262 53.8,262 53.8,220 "/>
    <text style="fill: #000000;text-anchor:middle;font-size:12.7998;font-family:monospace;font-style:normal;font-weight:normal" x="265.087" y="259">sujet</text>
    <polygon style="fill: #000000" points="241.838,259 241.838,251 233.837,255 "/>
  </g>
</svg>

Les classes `Arbitre` et `Spectateur` implémentent l’interface `Observer`. 
Elles ont pour sujet d’observation un objet de la classe `Joueur`.


`Arbitre` implémente la méthode `notify()` d’un appel à `verifierCoup()`. Similairement,
`Spectateur` implémente la méthode `notify()` d’un appel à `commenter()`.


La classe `Joueur` implémente `Subject`. Pour implémenter `notifyAll`, elle tient
en interne la liste des observateurs. Dès que le joueur a terminé l’appel à 
`jouer()`, il procède à la notification de tous ses observeurs. L’arbitre peut
alors vérifier le coup et les spectateurs aller bon train dans leurs commentaires.

Implémentation naïve en Scala
-----------------------------
Tout d’abord nos deux interfaces `Observer` et `Subject`
{% highlight scala %}
trait Observer {
  def notify(s:Subject, n:Any):Unit
}
trait Subject {
  private var observers = List[Observer]()
  def register(o:Observer):Unit = {
    observers ::= o
  }
  def unregister(o:Observer):Unit = {
    observers = observers.filter( _ == o)
  }
  def notifyAll(n:Any):Unit = {
    observers.foreach(_.notify(this,n))
  }
}
{% endhighlight %}
`Subject` implémente toutes ses méthodes. Le fait d’être `Subject` est totalement
indépendant de la nature de la classe observée.
En revanche, être `Observer` nécessite une implémentation spécifique de
`notify(s:Subject, n:Any):Unit`.


Ensuite nos classes métier `Joueur`, `Spectateur` et `Arbitre`.
{% highlight scala %}
class Joueur(val nom:String) extends  Subject {
  val coups = List("la reine en A1", "la tour en P23")
  private var nbCoup = 0
  def jouer {
    notifyAll(coups(nbCoup))
    nbCoup = (nbCoup + 1) % 2
  }
}
class Arbitre extends  Observer {
  def verifierCoup(nom:String, coup:String) = {
    if(coup contains ("P23")) println("— Arbitre: Le coup de " + nom + " est invalide.")
    else println("— Arbitre: Le coup de " + nom + " est validé")
  }
  def notify(s:Subject, n:Any) {
    s match {
      case s:Joueur => n match {
        case c : String => verifierCoup(s.nom,c)
        case _ => println("Je ne peux pas vérifier ça.")
      }
      case _ => println("Ce n’est pas un joueur.")
    }
  }
}
class Spectateur extends  Observer {
  def commenter(nom:String, coup:String) {
    if (nom contains ("Norris"))
      println("— Spectateur: Balèze !")
    else
      println("— Spectateur: Joli déplacement de " + coup)
  }
  def notify(s:Subject, n:Any) {
    s match {
      case s:Joueur => n match {
        case c : String => commenter(s.nom,c)
        case _ => println("Je ne peux pas vérifier ça.")
      }
      case _ => println("Ce n’est pas un joueur.")
    }
  }
}
{% endhighlight %}
`Joueur` appelle `notifyAll` dans sa méthode `jouer`. C’est le seul lien avec sa
nature de `Subject` observé.
`Arbitre` et `Spectateur` définissent respectivement `vérifierCoup` et `commenter`
 qui sont des méthodes purement métier. Elles implémentent chacune la méthode
`apply` qui vérifie que les paramètres sont intelligibles, en extrait les
données intésessantes et appelle les méthodes métier.

Enfin un jeu d’essai.
{% highlight scala %}
object Observer1Test {
  def main(args: Array[String]) {
    val chuck = new Joueur("Chuck Norris")
    val kaspa = new Joueur("Kasparov")
    val jerome = new Spectateur
    chuck.register(jerome)
    kaspa.register(jerome)
    val capello = new Arbitre
    chuck.register(capello)
    kaspa.register(capello)
    0.until(3).foreach{i=>
      chuck.jouer
      kaspa.jouer
    }
  }
}
{% endhighlight %}

Et le résultat

    — Arbitre: Le coup de Chuck Norris est validé
    — Spectateur: Balèze !
    — Arbitre: Le coup de Kasparov est validé
    — Spectateur: Joli déplacement de la reine en A1
    — Arbitre: Le coup de Chuck Norris est invalide.
    — Spectateur: Balèze !
    — Arbitre: Le coup de Kasparov est invalide.
    — Spectateur: Joli déplacement de la tour en P23
    — Arbitre: Le coup de Chuck Norris est validé
    — Spectateur: Balèze !
    — Arbitre: Le coup de Kasparov est validé
    — Spectateur: Joli déplacement de la reine en A1

On a donc deux `Joueur`s qui peuvent jouer tranquillement sans se soucier de
combien de d’yeux sont rivés sur lui. Le seul prix à payer est d’étendre
`Subject` et d’appeler `notifyAll` à chaque endroit digne d’intérêt.

Critique
--------

Tout d’abord, au niveau de mon implémentation, on voit qu’on mélange la nature
de `Subject` et `Observer` à des classes qui ne devraie contenir que de la
logique métier. Le remède est simple, il faut isoler le métier dans une classe
dédiée.






