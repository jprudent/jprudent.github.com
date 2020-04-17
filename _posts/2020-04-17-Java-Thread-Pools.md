---
layout: default
lang: fr
category: bestiaire
categories:
- bestiaire
tags:
- java
- concurrency
- pattern
last_update: 2020-04-17
---

# Java Thread Pool

## Vocabulaire

- thread : processus léger géré par l'OS
- executor service : une implémentation de _thread pool_
- future : unité d'exécution dont le résultat n'est peut être pas encore calculé

## Généralités

En une phrase : Une _thread pool_ contrôle un groupe de _threads_

Traduction : Groupe de processus légers partagés

Une _thread pool_ est un _design pattern_ utilisé dans des 
applications concurrentes.
Un _thread_ Java = un _thread_ de l'OS. Trop de _threads_ saturent 
une machine. La _thread pool_ déporte cette complexité 
accidentelle de l'application.


## Architecture

![architecture](/images/bestiaire/threadpool.png)

Le nombre de threads est limité.

L'appelant entasse ses tâche sur une file d'exécution (_task queue_).

Quand un _thread_ est libre, il prend une tâche sur la
file d'exécution et l'exécute.
 
## Taxonomie

Différents paramètres définissent le type de threadpool
- le nombre de threads toujours disponibles
- la capacité à planifier (_schedule_) l'exécution d'une tâche,
  dans un moment ou à intervalle régulier.

Généralement en java, on utilise un [ExecutorService][javadoc-executor-service], 
qui implémente la logique de la _thread pool_. Il propose une 
fonction pour exécuter une tâche[^tasks] retournant un [Future][javadoc-future]

Les _ExecutorService_ [les plus communs][javadoc-executors] sont :

| nom | nb threads | éviction | planification|
|--- | --- | --- | ---|
|Single | nb = 1 | non | non |
|Fixed | nb = $N | non | non |
|Cached | $N < nb < MAX | > 60s d'inactivité | non |
|Single Scheduled | nb = 1 | non | oui|
|Scheduled | $N < nb < MAX | oui | oui|

Il est possible de [personnaliser la _thread pool_][javadoc-threadpoolexecutor][^custom-executor-service].

[^tasks]: [Callable][javadoc-callable] ou [Runnable][javadoc-runnable]
[^custom-executor-service]: [Dirigiste][source-dirigiste] est une implémentation d'_ExecutorService_

[javadoc-executor-service]: https://docs.oracle.com/en/java/javase/12/docs/api/java.base/java/util/concurrent/ExecutorService.html
[javadoc-future]: https://docs.oracle.com/en/java/javase/12/docs/api/java.base/java/util/concurrent/Future.html
[javadoc-callable]: https://docs.oracle.com/en/java/javase/12/docs/api/java.base/java/util/concurrent/Callable.html
[javadoc-runnable]: https://docs.oracle.com/en/java/javase/12/docs/api/java.base/java/lang/Runnable.html
[javadoc-executors]: https://docs.oracle.com/en/java/javase/12/docs/api/java.base/java/util/concurrent/Executors.html
[javadoc-threadpoolexecutor]: https://docs.oracle.com/en/java/javase/12/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html
[source-dirigiste]: https://github.com/ztellman/dirigiste