---
layout: default
lang: fr
title: Faut-il documenter ?
category: articles_prog
categories:
- articles_prog
tags:
- documentation
last_update: 2020-04-15
---

# Faut-il documenter ?

La documentation que personne ne la lit, que personne ne maintient,
 et qui est fausse. 
Du wiki moribond au `README` sur Gitlab,
 en passant par les Google Docs stockés sur 
le Drive labyrinthique, du `.docx` 
qu'on ne trouve que sur la partition `NFS` que personne ne 
monte au Mindmap conçu avec un outil dont la boîte a coulé,
mais dont il existe une version `PDF` disponible pour les
spéléologues de la boite mail.
C'est de cette documentation dont je vais parler.

J'ai toujours eu une approche minimaliste vis à vis de
la documentation, préférant la véracité à la prose. 
En écrivant le code à l'aide d'outils conceptuels [^conceptual-tools], on 
arrive à peu près à se relire.  
En adoptant des techniques de _[living documentation][living-documentation]_
et de _code as data_ on peut générer de
la doc à partir du code, ou d'utiliser de la 
doc pour générer du code ou des tests.

Malgré ses qualités, cette approche a deux défauts :

- Ce genre d'outillage a besoin de compétences. 
Finalement, c'est assez rare dans la jungle.
A part un dev, qui peut générer de la documentation ?

- Il faut une volonté d'entreprise. On peut avoir beaucoup
de bonne volonté individuelle, mais c'est pas en 1 pause 
sandwich qu'on met correctement en place Swagger. Il faut 
que la hiérarchie pousse ces ambitions.

- Le résultat est très artificiel. La documentation ou le 
code documentaire est utile, mais insipide, ça ne sent 
plus l'humain. D'ailleurs elle n'est parfois utilisables que 
par des techniciens (cf Swagger).

J'ai cité Swagger mais les formes sont diverses : 
spreadsheets, diagrammes, scénarios de test, javadoc,  ...



[^conceptual-tools]: Test first, Design Patterns, Clean Code, Architecture, ... 
[living-documentation]: 
