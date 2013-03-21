---
layout: default
categories:
- articles_prog
---
Agents Java - Partie 1
======================

Mise en situation
-----------------
Vous travaillez pour un client qui exerce une activité en ligne. 
Cette activité est très réglementée et le gouvernement vous impose de lui communiquer certains détails propres à cette activité. 

Concrêtement, on vous fournit un Logger compilé (.class).
Vous devez appeler ce Logger de temps en temps.

La société _SSII Corp_, société à taille humaine, a sous traité le projet de développement du Logger.
Malheureusement, cette classe est buggée : vous ne pouvez pas la déployer sur votre environnement UNIX car le chemin du fichier de log est codé en dur et est de type Windows.

Admettons que toute votre activité se résume à cette simple classe Java:

{% highlight java %}
	
	package fr.arolla;
	
	import java.io.IOException;
	import java.util.HashMap;
	import java.util.Map;
	
	import fr.gouv.france.Logger;
	
	public class Foo {
	
	public static void main(String[] args) throws IOException {
			
			System.out.println("Je fais des affaires sur internet");
			
			System.out.println("Je transmets des informations au gouvernement");
			Map<String, Object> infos = new HashMap<String,Object>();
			infos.put("cafe", 0xCAFE);
			infos.put("babe", 0xBABE);
			new Logger().log(infos);
			System.out.println("Informations transmises au gouvernement");
			
			System.out.println("Fin des affaires");
			
		}
	
	}
	
{% endhighlight %}

Ce programme produit sur la console :


	Je fais des affaires sur internet
	Je transmets des informations au gouvernement
	Exception in thread "main" java.io.FileNotFoundException: C:/Windows/USers/SSIICorp/Mes documenst/pariLogger.log (No such file or directory)
		at java.io.FileOutputStream.open(Native Method)
		at java.io.FileOutputStream.<init>(FileOutputStream.java:212)
		at java.io.FileOutputStream.<init>(FileOutputStream.java:136)
		at java.io.FileWriter.<init>(FileWriter.java:78)
		at fr.gouv.france.Logger.log(Logger.java:13)
		at fr.arolla.Foo.main(Foo.java:19)


C'est embêtant, vous ne pouvez pas terminer votre sprint sans cette fonctionnalité très importante. Vous n'avez pas le code source 
et le traitement fait à l'intérieur est inintelligible après décompilation. De plus, il est imposé d'utiliser ce jar sans l'altérer. Comment faire ?    
Avec un agent java et un peu de manipulation de bytecode.

Avant de commencer, sachez que ce que je propose est un petit bricolage histoire de s'amuser un peu. La solution proposée ici est à base d'agents java et d'instrumentation du bytecode.

Attention, certains bouts de code sont écrits en Scala car Java c'est vintage mais pas très rock n'roll.

Si vous voulez, vous pouvez cloner le code [ici](https://github.com/jprudent/java-agent.git)

Si vous voulez vous lancer dans les travaux pratiques, munissez vous de :
* [SBT](https://github.com/harrah/xsbt) (j'utilise 0.11.3-2)
* [Scala](http://www.scala-lang.org/downloads/) (j'utilise la 2.9.1)
* JRE (j'utilise IcedTea7)


Lancer un agent au démarrage de l'appli
---------------------------------------

# java.lang.instrument
Ce package mal connu existe depuis la version 5 de java. Que nous dit la [dernière javadoc](http://docs.oracle.com/javase/7/docs/api/java/lang/instrument/package-summary.html#package_description "javadoc") ?

> Provides services that allow Java programming language agents to instrument programs running on the JVM. The mechanism for instrumentation is modification of the byte-codes of methods. 

Cool ! C'est pile ce qui fallait.

# Lancement d'un agent au démarrage de la JVM
## Créer un agent en 3 étapes.
### 1. Ecrire l'agent
Tout d'abord, il faut un agent. Un agent est une simple classe qui "implémente" : 

soit `public static void premain(String agentArgs, Instrumentation inst)` 

soit `public static void premain(String agentArgs)`

Concrêtement voici à quoi ressemble un agent simplissime :

{% highlight scala %}
	
	package fr.arolla
	
	object SimpleAgent {
	  def premain(agentArgs: String) {
	    println("Un simple agent appelé avec les arguments " + agentArgs)
	  }
	}
	
{% endhighlight %}

Un agent est une classe normale, sa seule spécificité est d'implémenter la méthode static `premain`. 

D'après la javadoc, cette classe est chargée par le même classloader que les autres classes. Les mêmes contraintes de sécurité (policy) s'y appliquent donc.

TODO : si c'est le même classloader, peut on instrumenter du code que l'on modifie ?

### 2. Packaging
L'agent doit obligatoirement être packagé dans un jar. A ma connaissance, il n'existe aucun moyen d'attacher un agent sous la forme d'un simple .class.

Le manifest du jar doit contenir un attribut `Premain-Class` dont la valeur est le nom qualifié de la classe qui contient la méthode statique `premain`.

{% highlight properties %}

	Premain-Class: fr.arolla.SimplAgent

{% endhighlight %}

Le jar et son `MANIFEST.MF` peuvent être générés à la main comme le faisait ma grand-mère ou via un outil de build. J'utilise logiquement _sbt_ mais c'est aussi possible avec _maven_ (TODO mettre un lien). Voici le contenu de mon _build.sbt_:

{% highlight scala %}

	name := "arollagent"
	
	version := "1"
	
	scalaVersion := "2.9.1"
	
	packageOptions := new Package.ManifestAttributes(
	(new java.util.jar.Attributes.Name("Premain-Class")->"fr.arolla.SimpleAgent")
	)::Nil

{% endhighlight %}

La commande `sbt package` construit le jar dans `target/scala-2.9.1/arollagent_2.9.1-1.jar`

### 3. Lancer la JVM
Il suffit d'ajouter l'option javaagent à la JVM:
    
`-javaagent:jarpath[=options]`
 
_jarpath_ est le chemin du jar contenant l'agent.

_options_ sont les arguments passés à l'agent.

## Tester l'agent:
	
	$ sbt package
	$ export CLASSPATH=target/scala-2.9.1/classes:/home/stup3fait/.sbt/boot/scala-2.9.1/lib/scala-library.jar:lib/logger.jar:/home/stup3fait/.ivy2/cache/org.ow2.asm/asm/jars/asm-4.0.jar
	$ java -javaagent:target/scala-2.9.1/arollagent_2.9.1-1.jar fr.arolla.Foo

	Un simple agent appelé avec les arguments null
	Je fais des affaires sur internet
	Je transmets des informations au gouvernement
	Exception in thread "main" java.io.FileNotFoundException: C:/Windows/USers/SSIICorp/Mes documenst/pariLogger.log (No such file or directory)
	        at java.io.FileOutputStream.open(Native Method)
	        at java.io.FileOutputStream.<init>(FileOutputStream.java:212)
	        at java.io.FileOutputStream.<init>(FileOutputStream.java:136)
	        at java.io.FileWriter.<init>(FileWriter.java:78)
	        at fr.gouv.france.Logger.log(Logger.java:13)
	        at fr.arolla.Foo.main(Foo.java:19)

`sbt package` package l'agent dans le jar avec le Manifest qui va bien

`export CLASSPATH ...` met dans le classpath:
- notre classe Foo à exécuter
- la librairie scala (dont dépend l'agent)
- le jar qui contient le logger buggé  (dont dépend Foo)
- la librairie de manipulation de bytecode (dont dépendra l'agent)

`java -javaagent:...` exécute la classe Foo avec notre agent

## Passer des arguments à l'agent
En fait on ne passe qu'un seul argument à l'agent. Libre à lui de découper au besoin.

	$ java -javaagent:target/scala-2.9.1/arollagent_2.9.1-1.jar=cafe\ babe fr.arolla.Foo

	Un simple agent appelé avec les arguments cafe babe	
	Je fais des affaires sur internet
	Je transmets des informations au gouvernement
	Exception in thread "main" java.io.FileNotFoundException: C:/Windows/USers/SSIICorp/Mes documenst/pariLogger.log (No such file or directory)


## Plusieurs agents à la fois
On peu lancer une compagnie d'agents en chaînant les -javaagent:

	$ java -javaagent:target/scala-2.9.1/arollagent_2.9.1-1.jar=AGENT\ 1 -javaagent:target/scala-2.9.1/arollagent_2.9.1-1.jar=AGENT\ 2 fr.arolla.Foo
	Un simple agent appelé avec les arguments AGENT 1
	Un simple agent appelé avec les arguments AGENT 2
	Je fais des affaires sur internet
	Je transmets des informations au gouvernement
	Exception in thread "main" java.io.FileNotFoundException: C:/Windows/USers/SSIICorp/Mes documenst/pariLogger.log (No such file or directory)


Anatomie du Logger
------------------
Bon, nous avons un peu dégrossit un peu ce qu'était un agent. Attaquons nous maintenant au Logger buggé.

On dézippe le jar et on regarde son bytecode avec javap.

	javap -c -s -p fr/gouv/france/Logger.class

La méthode log commence ainsi:

	public void log(java.util.Map<java.lang.String, java.lang.Object>) throws java.io.IOException;                                                                                                                                                                               
	    Signature: (Ljava/util/Map;)V                                                                                                                                                                                                                                              
	    Code:                                                                                                                                                                                                                                                                      
	       0: aconst_null                                                                                                                                                                                                                                                          
	       1: astore_2                                                                                                                                                                                                                                                             
	       2: new           #21                 // class java/io/FileWriter                                                                                                                                                                                                        
	       5: dup                                                                                                                                                                                                                                                                  
	       6: ldc           #23                 // String C://Windows/USers/SSIICorp/Mes documenst/pariLogger.log     <-- YEAH!
	       8: iconst_1                                                                                                                                                                                                                                                             
	       9: invokespecial #25                 // Method java/io/FileWriter."<init>":(Ljava/lang/String;Z)V   

A la ligne 6, l'instruction ldc charge sur la stack la constante #23 qui contient le chemin du fichier de log. Cette 
constante sert de paramètre au constructeur de la class FileWriter à la ligne 9.

Pour corriger le bug, on peut soit :
- modifier la constante dans le constant pool de la classe. Toutes les constantes qu'utilise une classe sont dans une zone
spéciale de la classe appelée constant pool.
- générer un code qui lit le chemin depuis un fichier, une variable d'environnement ou un paramètre. Mais c'est plus balèze.

Instrumentation et agents
-------------------------

Jusqu'ici on a créé un agent qui ne servait à rien et on a trouvé l'endroit où réside le bug.

L'agent que nous avons écrit ne permet pas d'instrumenter du code. Pour avoir cette capacité, il faut "implémenter"
`public static void premain(String agentArgs, Instrumentation inst);`

Allons y:

{% highlight scala %}

	package fr.arolla
	import java.lang.instrument.Instrumentation
	import java.lang.instrument.ClassFileTransformer
	import java.security.ProtectionDomain
	
	
	object ArollAgent {
	  def premain(agentArgs: String, inst: Instrumentation) {
	    inst.addTransformer(new ArollaTransformer);
	  }
	}
	
	class ArollaTransformer extends ClassFileTransformer() {
	  override def transform(cl: ClassLoader, className: String, clazz: Class[_], protectionDomain: ProtectionDomain, rawClass: Array[Byte]) : Array[Byte] =  {
	    println("Nom de la classe: " + className)
	    null
	  }
	}

{% endhighlight %}

On voit que la clé c'est le paramètre [inst](http://docs.oracle.com/javase/6/docs/api/java/lang/instrument/Instrumentation.html). 
Dans le cadre de cet article, seule la méthode addTransformer nous intéresse:

`void addTransformer(ClassFileTransformer transformer)`

`addTransformer` permet de recenser toutes les instances de `ClassFileTransformer` à appeler lorsqu'un `ClassLoader` définit une nouvelle classe. 
[ClassFileTransformer](http://docs.oracle.com/javase/6/docs/api/java/lang/instrument/ClassFileTransformer.html) est une interface qui n'a qu'une seule
méthode: `transform`. C'est dans cette méthode que l'on va faire notre petite bidouille pour réparer `Logger`. 

Regardons de plus près la signature de la méthode transform:

{% highlight java %}

	byte[] transform(ClassLoader loader,
	                 String className,
	                 Class<?> classBeingRedefined,
	                 ProtectionDomain protectionDomain,
	                 byte[] classfileBuffer)
	                 throws IllegalClassFormatException

{% endhighlight %}
`transform` retourne un tableau de byte correspondant au nouveau bytecode de la classe. C'est ce nouveau bytecode qui sera
enregistré par le class loader. Si aucune transformation n'est à faire, il faut retourner `null`.

Au niveau paramètres seuls deux nous intéressent :
- _className_ est le nom de la classe. Par exemple "java/util/List"
- _classfileBuffer_ le bytecode actuel de la classe

Modifions maintenant le manifest pour utiliser notre nouvel agent:

{% highlight scala %}

	packageOptions := new Package.ManifestAttributes(
	(new java.util.jar.Attributes.Name("Premain-Class")->"fr.arolla.ArollAgent")
	)::Nil

{% endhighlight %}

Et relançons le programme

	$ sbt package

	$ java -javaagent:target/scala-2.9.1/arollagent_2.9.1-1.jar fr.arolla.Foo

	Nom de la classe: sun/launcher/LauncherHelper
	Nom de la classe: fr/arolla/Foo
	Nom de la classe: java/lang/Void
	Je fais des affaires sur internet
	Je transmets des informations au gouvernement
	Nom de la classe: java/lang/Integer$IntegerCache
	Nom de la classe: fr/gouv/france/Logger
	Nom de la classe: java/io/FileWriter
	Nom de la classe: java/io/FileNotFoundException
	Exception in thread "main" Nom de la classe: java/lang/Throwable$WrappedPrintStream
	Nom de la classe: java/lang/Throwable$PrintStreamOrWriter
	Nom de la classe: java/util/IdentityHashMap
	Nom de la classe: java/util/IdentityHashMap$KeySet
	java.io.FileNotFoundException: C:/Windows/USers/SSIICorp/Mes documenst/pariLogger.log (No such file or directory)
	        at java.io.FileOutputStream.open(Native Method)
	        at java.io.FileOutputStream.<init>(FileOutputStream.java:212)
	        at java.io.FileOutputStream.<init>(FileOutputStream.java:136)
	        at java.io.FileWriter.<init>(FileWriter.java:78)
	        at fr.gouv.france.Logger.log(Logger.java:13)
	        at fr.arolla.Foo.main(Foo.java:19)
	Nom de la classe: java/lang/Shutdown
	Nom de la classe: java/lang/Shutdown$Lock

On remarque que le transformer est appelé *avant* d'utiliser une classe pour la première fois.

TODO: cela correcpond au chargement du classloader ou à la première utilisation ?
 
Instrumentation du Logger
-------------------------

Il existe pas mal de librairies permettant d'instrumenter du bytecode. Les plus connues sont [ASM](http://asm.ow2.org/) et [BCEL](https://commons.apache.org/bcel/). Voir [cette page](http://java-source.net/open-source/bytecode-libraries)
pour encore plus de choix !
J'ai opté pour ASM car je la connaissais déjà et la [documentation](http://download.forge.objectweb.org/asm/asm4-guide.pdf) est un vrai bouquin qui vous apprendra plein de choses sur l'anatomie d'une classe.

Et voilà la version finale de l'agent:

{% highlight scala %}

	package fr.arolla
	import java.lang.instrument.Instrumentation
	import java.lang.instrument.ClassFileTransformer
	import java.security.ProtectionDomain
	import org.objectweb.asm.ClassVisitor
	import org.objectweb.asm.Opcodes
	import org.objectweb.asm.MethodVisitor
	import org.objectweb.asm.ClassWriter
	import org.objectweb.asm.ClassReader
	
	object LoggerPatcherAgent {
		def premain(agentArgs: String, inst: Instrumentation) {
			inst.addTransformer(new LoggerPatcherTransformer);
		}
	}
	
	class LoggerPatcherTransformer extends ClassFileTransformer {
	  class PatchLdcLoggerAdapter(mv:MethodVisitor) extends MethodVisitor(Opcodes.ASM4,mv) {
	    override def visitLdcInsn(constante:Any) {
	      constante match {
	      	case string:String if string.startsWith("C://") => mv.visitLdcInsn("/tmp/log") 
	      	case _ => mv.visitLdcInsn(constante)
	      }
	    }
	  }
	  
	  class LoggerClassAdapter(cv:ClassVisitor) extends ClassVisitor(Opcodes.ASM4,cv) {
	    override def visitMethod(access:Int,name:String, desc:String, signature:String, exceptions:Array[String]):MethodVisitor = {
	    	val mv = cv.visitMethod(access,name,desc,signature,exceptions) 
	        if(mv != null && name == "log") new PatchLdcLoggerAdapter(mv)
	        else mv
	    }
	  }
	  
	  override def transform(cl: ClassLoader, className: String, clazz: Class[_], protectionDomain: ProtectionDomain, rawClass: Array[Byte]) : Array[Byte] =  {    
	    //fail fast
	    if(className != "fr/gouv/france/Logger") return null
	    
	    val cw = new ClassWriter(ClassWriter.COMPUTE_MAXS & ClassWriter.COMPUTE_FRAMES)
	    new ClassReader(rawClass).accept(new LoggerClassAdapter(cw), 0)
	    cw.toByteArray()
	  }
	}

{% endhighlight %}

Bon je ne veux pas trop m'attarder sur le code mais en gros ça prend le `ldc #23` qu'on avait repérer et ça le remplace par
un `ldc #XX`, où XX est le numéro de constante qu'ASM nous a créé dans le constant pool et qui contient "/tmp/log".

Si on relance l'appli avec le nouvel agent:

	$java -javaagent:target/scala-2.9.1/arollagent_2.9.1-1.jar fr.arolla.Foo

	Je fais des affaires sur internet
	Je transmets des informations au gouvernement
	Informations transmises au gouvernement
	Fin des affaires

et dans /tmp/log on a un truc du genre:

	$ cat /tmp/log
	Mon Jul 02 22:43:48 CEST 2012
	        cafe:51966
	        babe:47806

Conclusion
----------

- vous avez des beaux logs
- vous avez utilisé la librairie presqu'originale :)
- vous n'avez écrit que 30 lignes de code supplémentaires :)

Pour réaliser cela, il a suffit de décompiler le Logger et créer un agent qui utilise ASM.

Bon, comme je l'ai dit en haut de cet article, c'est vraiment pour se faire plaisir tout ça, juste histoire de se tenir au courant. 

Ca m'a aussi donné des idées non pas pour corriger des bugs mais plutôt pour en créer. En effet, on pourrait facilement simuler des connexions foireuses, des pannes, des problèmes de filesystem sans modifier le code,
sur un environnement iso-prod pour voir comment se débrouille l'appli et sans avoir besoin de relivrer.

Dans un prochain article, il y au moins deux points que j'aimerais approfondir concernant les agents:
* le lien avec les classloader
* l'instrumentation à chaud avec la méthode redefine
 
Ressources autours de ce thème:
-------------------------------

http://www.javalobby.org/java/forums/t19309.html

http://blog.gorillalogic.com/2009/05/15/java-profiling-with-the-java-lang-instrument-package/ 
