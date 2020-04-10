---
layout: default
lang: en
title: My Clojure starter kit
category: articles_prog
categories:
- articles_prog
tags: 
- clojure
- beginner
---

# Clojure starter kit 

<div id="toc-js">
</div>

Clojure is just a whisper in the busy Java market place. Sometimes you will hear someone mention it and then you go back to your little Spring routine. Taking out of curiosity you may click a few links and wonder about this alien language. Clojure is hard to start with, but this is a price to pay for a land of simplicity, beauty, and productivity. These bytes I'm writing are not meant to convince you. They are meant to help you get started with your journey. It compiles some of my 2 years of professional experience with this language. It's worth my 50 cents.

## Learn the fundamentals

### Read away from computers
I learnt Clojure during a week long car trip. I had a book, a notebook, no computer, no Internet. I wrote my first program with pen and paper. It's actually doable because there is no syntax and I can abstract details behind function names. Learning a technology away from technology is my best learning experience. Clojure is a language that let you think.

### Read Books
[Clojure programming](http://www.clojurebook.com/) has been released in 2012, never has been actualized since but it is still relevant because Clojure is stable. I like it because it teaches the fundamentals before the how. 

I also randomly read [Clojure for the brave](https://www.braveclojure.com/clojure-for-the-brave-and-true) on precise matters. It's a good book too, you can read online, but you may want to skip the Emacs part. 

I had good echoes of the [Joy of Clojure](http://www.joyofclojure.com/). 

[Getting Clojure](https://pragprog.com/book/roclojure/getting-clojure) is more theoric and is still on my must read one day list. 

[Here is a list of free clojure books](https://github.com/EbookFoundation/free-programming-books/blob/master/free-programming-books.md#clojure). 

### Browse documentation
The [Clojure reference documentation](https://clojure.org/reference/reader) is of course a great source of wisdom but I think it's a bit hardcore and misleading for newcomers. Take your time to digest its content. It's often very dense and conceptual. Each concept is justified : why was it added to the language? What problem does it solve ? It’s the only language I know that justifies what it is.

### Watch videos 
There are some Clojure dedicated conference too. The biggest events are Clojure/conj, Clojure/west and EuroClojure (you can find videos on [youtube](https://www.youtube.com/user/ClojureTV/playlists). But there are other. I’m not a big fan of videos myself, but watch Rich Hickey talks. They are always full of insights. This amazing guy made a [transcript](https://github.com/matthiasn/talk-transcripts) of them.

### Trainings
Eric Normand owns the purelyfunctional.tv website. Among free content you can subscribe to more than introductions videos.

## Write code

### Choose an IDE

I use [Intellij](https://www.jetbrains.com/idea/). The community edition is enough. You need the [Cursive plugin](https://cursive-ide.com/). This plugin is of great quality, it offers a [very good support](https://cursive-ide.com/userguide/) of the language (coloration, doc, structural editing, refactoring, formatting, navigation) and has good integration with ecosystem too (testing lib, build tool, repl). It is developed by an independent dude, and it's a [licensed](https://cursive-ide.com/buy.html) piece of software. It's free for open source developer and home hackers, and it's cheap for commercial use. 

Here is the distribution of the IDE among my clojurian colleagues :
- 3 use Intellij with Cursive
- 3 use [Emacs](https://www.gnu.org/software/emacs/) with a custom config 
- 2 use [Spacemacs](http://spacemacs.org/) (a set of carefully selected and configured plugins) 
- 3 use [Vim](https://www.vim.org/) (with a bunch of plugins) 
- 1 uses [Vscode](https://code.visualstudio.com/)
- 1 uses [sublime text](https://www.sublimetext.com/)

If you are an Eclipse user there is also a good plugin called Counterclockwise. 

### Learn structural editing

Clojure is a monotonous language which is composed of imbricated s-expressions. This has the inconvenient of being a fertile land for parenthesis, brackets, and curlies. If you manage them like you would in java, you will spend hours counting and balancing. The advantage of such a syntax is that your code is a tree like structure. And you can navigate and apply transformations of that tree on the the node your cursor is currently at. This may be intimidating, but really it becomes natural after a week.

For navigation, I use nothing fancy and don't take advantage of the structured syntax of Clojure. Mostly :
- When my cursor is on a parenthesis, I jump to the closing or opening one. 
- When my cursor is in an expression I jump to the closest parenthesis. 
- I jump to the definition of symbols (function, Var), jump to specific lines, and navigate back and forth the history like I would in java. 
- I use mouse and keyboard arrow for precise positioning. 

For code edition I benefit the regularity of the syntax using the structural editing proposed by cursive, which is derived from [paredit](http://danmidwood.com/content/2014/11/21/animated-paredit.html). I mostly use :
- Cut/Copy as kill : cut or copy the whole node
- Slurp forward : merging the current node with the next sibling
- Raise : replace the parent node with current node
- Splice : bubble up all children of current node 

There is a dozen of other (barf, splice, …). I never use them. I compose the 4 above, and I'm still happy. The golden rule is to never copy (ctrl+c) or cut a text selection (made with mouse or shift+arrow) because you will unbalance your code. That's an habit difficult to get rid of. Always use kill. Last advice : always use kill. 

The other mode of structural editing is called parinfer. It's a smart algorithm that writes parenthesis for you, provided your code is well formatted. It only works if the code is well formatted. 

And of course there is this category of people that don't use structural editing at all and this makes me sad. 

### Code conventions
You can stick to [this document](https://github.com/bbatsov/clojure-style-guide).

### Use the repl
The [Cognitec repl guide](https://clojure.org/guides/repl/introduction) is a good read.

### Use a build tool
[Leiningen](https://leiningen.org/) has been around for years. Most libs and projects use it. If you know Maven, it's not a tool hard to tackle. It declares repositories, dependencies, project metadata. It can launch a repl, test, run, compile, build a jar, an uberjar, deploy. You can add plugins. It uses [Ivy](https://ant.apache.org/ivy/) but is very Maven. We use it for merely all our Clojure projects, old and new.

[Clojure Deps & CLI](https://clojure.org/guides/deps_and_cli) has been released this year by cognitec and is more or less the official way to run Clojure programs and manage dependencies. It declares dependencies and entry points to build a classpath and run code or a repl. The whole thing is smartly composable. I am not yet very familiar with, but I should.

[Boot](https://boot-clj.com/) is more like Gradle. It has supporters but I don't like it so much. 

There is a [Maven](https://github.com/talios/clojure-maven-plugin) plugin for Clojure too but I’m not sure of the status. 

### Use some libraries
**Those libraries are optionals**. Before writing Clojure code at work, I coded in my kitchen for fun and I never used a single dependency. Clojure core comes with core.test namespace for unit testing, it has everything needed for data manipulation, concurrency, file io and logging. It also can also easily interoperate with any class of the JDK if needed (crypto, nio, encoding,...) Clojure is a language where reinventing the wheel is quite easy and concise. But there are extra libraries around that every clojurian knows about. Here are a few that will enhance your Clojure experience. 

- [spec](https://clojure.org/guides/spec) is a library that helps you write validation schemas for your datastructures. It's super useful at the outbound of your application to ensure you fully understand the data you are reading and that the data you are writing is correct.

- [test.check](https://github.com/clojure/test.check) is a library to write generative tests. It can use a spec as a generator. 

- [core.async](https://github.com/clojure/core.async) is a versatile library that provides something similar to go routines. It's the way to go for asynchronous processing.

- [specter](https://github.com/nathanmarz/specter) helps you query and transform complex data structures. It gives conciseness and readability. 

- [integrants](https://github.com/weavejester/integrant) helps you make dependency injection and manage the life cycle of your application. It works pretty well in the repl.

There is no popular frameworks in Clojure. Everything is function and data so is highly composable. There is no need for a boiler plate abstraction or a special glue. Nonetheless there are big libraries that may be compared to frameworks (mostly to write http Apis). Except they are always hackable and you can follow what's under the hood. 

Generally speaking libraries are rather small, utilitary and replaceable. So last commit on a lib may be 5 years ago, if it does the job, there is no great risk including it in production software (security and performance aside). 

A last warning about libraries. When I work with technologies I am not familiar with I avoid wrappers. For instance if I have to work with Kafka and don't know Kafka, I prefer in a first time interoperate with the native java client rather than using a Clojure wrapper. Wrappers are magic, they hide things, they make choices. Clojure is a symbiotic language. It doesn't come with a runtime so interop is just an ugly normal thing. When you start writing yourself a wrapper, check if there is one that may suit you, and understand the tradeoffs. 

There are [tons of libraries](https://www.clojure-toolbox.com/) out there.

### Debugging 
Your first debugger should be the repl. It's a great place to test things. If something get impossible to test in the repl, maybe your code is not modular enough or depends too heavily on side effects (time to go back to your solid principles). 

`prn` is a cheap tool for debugging. Just `(prn stuff)`, re-evaluate code, run your test again, copy result, paste-quote it on the repl and play with it. Sometimes you may even use `(def stuff)` in the middle of your code to get the value of stuff right in the repl. 

The next step is to use [scope capture](https://github.com/vvvvalvalval/scope-capture). This tools is incredibly useful: it not only capture the expression value, like a def would do, but it also capture the whole context of execution (parameters, let bindings). Then you can play with that in the repl. 

You can also start a repl in debug mode, set a breakpoint and do step by step [debugging in intellij](https://m.youtube.com/watch?v=ql77RwhcCK0). It may help but you will have to inspect the objects the JVM sees. It may be useful for understanding some internals of Clojure though. 

### Get some help
One of the difficulty of the language is to get familiar with its API. The first months, you really can’t avoid the Clojure cheat sheet.

Before asking some help online, be sure to experiment fully yourself in the repl. Repl is quick to fire. There are online REPL too. There is a phone app for that! Repl is cheap to experiment with.

Here are a few places where you can get help :
- [Clojure google group](https://groups.google.com/forum/#!forum/clojure)
- [Clojure slack](https://clojurians.slack.com)
- [Clojureverse](https://clojureverse.org/) 
- [Clojure subreddit](https://www.reddit.com/r/Clojure/)
I don’t really have one to advise. I don’t use those resources that much, I have access to a physical community every day.

### Cheat sheets
At the beginning of the learning process (even after!), cheat sheets are great companions.
The [clojure cheat sheet](https://clojure.org/api/cheatsheet) synthetically exposes all core functions aggregated by theme


### Exercice !
My favorite site for learning is [4clojure](http://www.4clojure.com/). There are small problems to solve. Sometimes you have to reimplement yourself some functions of the core. You can compare your solution with others when you are done.
I also tried the [coding game](https://www.codingame.com/start) platform and did some of the [crypto pals](https://cryptopals.com/) challenge but it’s not clojure specific.

### Change your workflow?
I’m a great fan of TDD when it comes to java, because of the quick feedback loop and the ability to make experiments. For those two advantages, I don’t use TDD with Clojure. If the problem looks simple enough, I experiment directly in the repl without writing a test first. When I’m satisfied with a solution, I just write a nice happy path test and polish my code with more corner cased tests and RGR cycles. I feel more free, less caged by a compilation step, and have all advantages of TDD. When the problem is hard, wide, or blurred I just go test first as usual. I launch [test refresh](https://github.com/jakemcc/lein-test-refresh) in a terminal to test non regressions.


**Welcome :)**


