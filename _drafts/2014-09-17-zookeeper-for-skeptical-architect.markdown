ZooKeeper for the Skeptical Architect
====================================

ZK is not highly available

Use cases
---------

Distributed locking : 
- For building consistant system
- Where ordering is important 

Service Management
- Kinda DNS
- Dynamic registering
 
Primitives
----------

Consistency : ability to make sure !
Ephemeral nodes : nodes that are session aware. Go away when session dies.
Watches: no polling

ZK is for
- coordination
- is key/value based but store pointers to data, not the data itself
- NO pub/sub


Links
-----

[http://www.infoq.com/presentations/zookeeper-use-case](The talk)


Functional Examples from Category Theory
========================================

Computation done  at the value level
Programmer can think as type level

Type = lowest level abstraction of a value
Can construct functions between them

Types - Function - Composition

Type + Function + Law = Category

Laws:

- associative : f andThen (g andThen h) == (f andThen g) andThen h
- identity function :

        id[A](x:A):A = x
        f[A,B](x:A):B = ???
        f(id(x)) == f(x)

There is only one id function #thereIsOnlyOne !


Links
-----

[http://www.infoq.com/presentations/functional-category-theory](The talk)