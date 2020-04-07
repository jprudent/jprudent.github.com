---
layout: default
lang: fr
categories:
- bestiaire
tags:
- metrics
- devops
- monitoring 
- reporting
last_update: 2020-04-06
---

# Prometeus

## [Vocabulaire][prometheus-glossary](https://prometheus.io/docs/introduction/glossary/)

- time series database (TSDB) : base de stockage des métriques
- scraper : collecte des métriques
- label : métadonnée associée à une métrique
- PromQL : langage de requête de la base de donnée
- instrumentation : intégration de la collecte des métriques 
  au sein des applications

## Généralités

En une phrase : [Prometheus][prometheus-official-website] 
collecte et enregistre des métriques dans le temps.

Traduction : [Prométhée][prometheus-etymologie]

Prometheus est [open source][prometheus-source-code] (Apache 2.0),
principalement écrit en Go,
 développé [communautairement][prometheus-community].

Le projet est membre du 
[Cloud Native Computing Foundation][cncf-official-website]
depuis 2016.

Prometheus est populaire.

Prometheus est une suite complète d'outils comprenant :
une base de donnée _time series_, un moteur
de requête, des _scrapers_, un système d'alerting, 
une interface utilisateur.

Prometheus s'interface généralement avec [Grafana][grafana-official-website] 
pour afficher les métriques.

Prometheus est concurrent à des produits comme
[Graphite][graphite-official-website],
[InfluxDb][influxdb-official-website], 
[Nagios][nagios-official-website]

Prometheus est utilisé comme un outil de monitoring et 
de reporting, et ne sait travailler qu'avec des métriques 
(des floats de 64 bits).

## Architecture

Prometheus n'est pas distribué.

Les métriques sont _pullées_ depuis des endpoints http. 
Le _push_ n'est pas impossible.

https://prometheus.io/assets/architecture.png

## Collecte (scrapping) des métriques

Une métrique a un nom et des labels. Par exemple
`api_http_requests_total{method="POST", handler="/messages"}`

Une métrique a un type : compteur (ex: nombre de visites), 
jauge (ex: nombre de sessions ouvertes actuellement),
ou histogrammes (ex: temps d'activité des sessions)
 
Les applications sont instrumentées afin d'incorporer
les métriques dans le code. Il existe des librairies
pour de nombreux langages. Les métriques sont généralement
exposées via une route HTTP `/metrics` dans un format textuel plat.

Prometheus collecte les métriques depuis les routes HTTP 
enregistrées.

[JMX Exporter][prometheus-jmx-exporter] peut exporter les
infos de la JVM sans modification du code.

## Requêtage de la base de donnée

## Alertes

[prometheus-official-website]: https://prometheus.io
[prometheus-etymologie]: https://fr.wikipedia.org/wiki/Prométhée
[grafana-official-website]: https://grafana.com/
[graphite-official-website]: https://graphite.readthedocs.org/en/latest/
[nagios-official-website]: https://www.nagios.org/
[influxdb-official-website]: https://influxdata.com/
[prometheus-source-code]: https://github.com/prometheus
[prometheus-community]: https://prometheus.io/community/
[JMX Exporter]: https://github.com/prometheus/jmx_exporter
[cncf-official-website]: https://cncf.io/
[prometheus-glossary]: https://prometheus.io/docs/introduction/glossary/