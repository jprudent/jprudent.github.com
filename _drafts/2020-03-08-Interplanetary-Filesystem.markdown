
### C'était mieux avant

Depuis longtemps je pense qu'internet est détourné de son
usage. A la base, c'est un projet de hippie destiné 
à libérer la l'information. Internet repose sur des 
protocoles qui sont peer-to-peer. Pourtant les milliards
de navigateurs sont clients, et jamais serveurs. Nos
ISP n'offre même pas des débits montant / descendants
symétriques.

Je ne comprends toujours pas qu'avec nos crypto-techno et le
nombre de device connectés faut contacter un serveur bien
spécifique pour consulter une page Wikipedia, ou envoyer
un email à Tata Micheline pour lui souhaiter bonne année. 

### Freenet 

Il y a 15 ans, j'ai découvert [Freenet][1]. 
> Freenet is a peer-to-peer platform for censorship-resistant
> communication and publishing

Freenet est une perle technologique, dont
la sécurité n'a jamais été compromise. Freenet n'est jamais
tombé. Au dessus de Freenet, ont été développés des forums
et une messagerie notamment.
Freenet est une base de donnée distribuée dont la politique
d'éviction est liée à la popularité de la donnée.
C'est lent mais ça marche.

Malheureusement, c'est une saloperie de nid à 
pédophiles et autres tarés morbides qu'auraient jamais dû
naître. Et le problème de Freenet, c'est que dès qu'on est
dans le réseau notre noeud sert de passerelle pour ces 
enfoirés. Il n'y a aucun moyen de sensurer ce qui passe 
sur notre noeud. Qui sait quelles infamies sont stockées 
dans les 10 gigas de mon disque ? Bref Freenet rempli bien
sa fonction mais déso, je peux pas.

### Interplanetary Filesystem

IPFS a un autre motto :
> The InterPlanetary File System is a peer-to-peer hypermedia 
>protocol designed to make the web faster, safer, and more open.

Ok, j'ai testé. Faster : nop. Safer : par défaut. Open : yep!

#### Faster

Pour simplifier IPFS, c'est un gros cache distribué.
Le modèle est le suivant :
- Roger de Dijon ajoute la recette du coq au vin de Tata Micheline
dans IPFS (parceque c'est bon). Son noeud est le seul à servir la 
recette.
- Michel de Montreal se taperait bien un coq au vin, il a entendu parlé
de la recette de Micheline et la récupère (la recette) depuis
la machine de Roger. La recette est dans le cache de Michel.
- Monica de Chicago a envie de french cuisine. Ah ouais,
un bon coq au vin ! Elle récupère la recette en parallèle depuis
 chez Roger de l'autre côté de l'Atlantique, et depuis chez Michel
qui habite derrière le lac Michigan (environ). Paf, la recette est
 aussi dans son cache.
- Robert, le mari de Monica, n'a jamais entendu parlé de
"cow cow wine", et télécharge intantanément la recette 
depuis le noeud de Monica qui se trouve sur le même réseau
local.

La popularité d'un fichier est proportionnelle à sa disponibilité.
Et plus il est disponible, plus il est accessible rapidement.
IPFS découpe chaque fichier en bloc afin de paralléliser
son téléchargement. Freenet ça marche comme ça aussi, 
sauf qu'ici mon noeud ne redistribue que ce que j'ai consulté.
Un noeud IPFS tout frais, ne télécharge rien, ne distribue rien,
mis à part sa participation à la DHT (désactivable avec
l'option `--routing=dhtclient`). Il ne distribue que ce 
qui est dans le cache.

J'ai testé du partage de fichier entre ma tablette et 
mon ordinateur. C'est trop bien, ça passe les firewalls, 
ça reste dans le réseau local, c'est très rapide, plus 
simple qu'un Termux avec un client SSH.
 
En bonus je peux partager mon fichier dans le reste du monde.
Là ça se gâte un peu, parceque mon réseau c'est pas celui
d'Amazon. On se croirait revenu au temps de la Mule mais
c'est ben cool.

J'ai aussi essayé de mettre ce blog sur IPFS. Alors,
oui ça marche mais c'est rapide comme un Minitel. A
cette vitesse, le SEO je peux faire une croix dessus. 
Mais c'est jouissif de devenir acteur d'internet sans 
avoir à configurer des DNS / Nginx / NAT.

Il faudrait que des millions de machine fassent tourner
IPFS pour que ça soit rapide. On est trop accroc à l'instantané
pour espérer que ça plaise à des vrais Roger, Michel et Monica.
> — ... et là tu vois on utilise véritablement ce pourquoi
>   internet a été conçu, on participe égalitairement à un
>   réseau de millions de machi ...
>
> — c'est lent ton bazar, r'mets moi le Google, chuis habitué 

Aujourd'hui, ya rien de plus rapide qu'un DNS
bien connu devant une ferme de caches HTTP. Et c'est triste.

#### Safer

Le web assure sa sécurité par un système de certificats. 
Ce système s'est un peu ouvert dernièrement avec Let's Encrypt
mais est toujours soumis à une pyramide d'autorités établies
arbitrairement. Ca reste une machine à ca$h et 
un système de trust en des entreprises privées. C'est pas
 hippie. 
Les certificats protègent de 2 choses :
- Ils garantissent l'authenticité du contenu fourni
aux clients. "Si tu vois un cadenas vert, ça veut dire
que cette page est bien émise par le serveur à qui tu 
la demande"
- Ils permettent de communiquer confidentiellement. Un sniffer sur
le réseau sait qu'il y a communication, mais est incapable
d'en connaître la nature. "T'inquiète pas, tu peux saisir
ton numéro de CB, ya que moi qui le verra"

IPFS adresse les fichiers par leur contenu. Quand on crée
un fichier sur le réseau ou quand on veut le télécharger,
on ne demande pas son nom, on demande son contenu. L'adresse
d'un fichier est un hash de son contenu. Si le contenu 
change, l'adresse change, et c'est infalsifiable.
Un marseillais malicieux qui déciderait de refourguer des
recettes de bouillabaisse au lieu de coq au vin se ferait
capter direct car une fois la recette téléchargée, il suffit
de calculer son hash pour vérifier qu'elle correspond bien
à son adresse. L'authenticité est indissociable d'IPFS.

Toutes les connexions IPFS utilisent une couche de transport
sécurisée appelée [SECIO](https://github.com/libp2p/specs/blob/master/secio/README.md).
 Cela garantit un échange confidentiel entre les noeuds.
Il reste cependant possible de désactiver les connexions
sécurisées avec l'option `--disable-transport-encryption`.
Ce n'est pas un prérequis au fonctionnement d'IPFS qui 
est indépendant de la couche de transport. Vous faites
un coq au vin, ça va se savoir.

Chaque noeud met à dispo une gateway HTTP vers et depuis
le réseau IPFS. Si vous utilisez celle de quelqu'un d'autre,
là vous risquez de vous retrouver avec une bouillabaisse 
dans la marmite. N'utilisez les gateways publiques qu'à des
fins de test.

#### Open

Il n'y a aucun droit d'entrée à IPFS. Pas d'inscription,
pas de CB, pas de pub, pas d'incentive à la participation,
pas de ratio de partage, pas de cryptothune.
C'est open source, documenté.

Il n'y a aucune restriction sur le type de contenu diffusé.
Certains utilisateurs partagent des archives de centaines de
gigas, d'autres de simples fichiers texte. Concernant la 
moralité et la légalité des contenus, tant qu'on reste 
loin de ces choses,  

La gateway local permet de construire des pages HTML
riches (avec JS et CSS), qui lie d'autres pages. C'est une
reconstruction du web. Installez l'extension firefox et
récompensez les contenu de qualité en les conservant 
définitivement dans votre cache (pin content).


### Conclusion

IPFS est un joli soft, bien abouti. Les outils fonctionnent
et la communauté est bouillonnante. 
Je trouve que les curseurs liberté, facilité et anonymat 
sont bien dosés. Je vais continuer
à jouer avec ce petit bijou technologique.


###

produit abouti (desktop, cli, mobile, )
incentive à faire tourner un noeud (pinning service)
rich app
services
gateway
bonne documentation
piratage
small node inside the web page (this is already possible with js-ipfs) and your browser can help serve the content to others thanks to it

https://blog.cloudflare.com/e2e-integrity/