# About

The purpose of this article is to get familiarized with *event sourcing* architecture and to provide an implementation in Clojure programming language.  

The examples are inspired by Snake videogame. One may argue that event sourcing is not designed to implement videogames and he's right. But a vegan snake is a lot more fun than a banking account for a tiny blog post.

# A brief tour of event sourcing

Event sourcing is all about _state_. It's a design that can manage state in a non destructive, data and business oriented way. If you are a DDDer that should ring you a bell and you must think of the _state_ as an _aggregate root_. So for now, I will use the term _aggregate root_ that holds much more concepts than _state_. If you don't know what an _aggregate root_ is, mentally translate it as _state_.

A `Command` is pure data and has no method perse. A command describe a _use case_. In our application, we  have several commands which matches 1 to 1 to our use cases: `StartGame`, `TurnLeft`, `TurnRight`, `GoAhead`.
          
A `Command` data structure is passed to a `CommandHandler`. A `CommandHandler` takes a single `Command` as a parameter. The implementation of `CommandHandler` will read the *current aggregate root*, call methods of the domain logic against it in order to check the validity of the command and ultimately will fire _events_. Those commands are the same commands as in the C of  [CQRS](todo) or queries of the [Bob's EBI](???) architecture. 

An *event* is just a data structure that describes what happened and have no methods.

Deciding which events our application produces is the major design issue of event sourcing. What we have to keep in mind is that *an event is not a shift of state*. *A change of state is the consequence of an event*. Back to our videogame, a `SnakeDied` event is of no use because reading this won't tell you much about what happened. "Did he bite itself or hit a wall ? That poor thing.."
 
What's interesting about an event is the business semantic we can attach to it. Reading a sequence of events should tell you a story about what happened. Events shouldn't be too fine nor too coarse grained, just the perfect size so that the sequence would make sense. I think there is no rule about what events should be. Just try to listen to your business experts and end users.

In our game, events will be `GameStarted`, `TurnedLeft`, `TurnedRight`, `GoneAhead`, `AteApple`, `HitWall` and `AteTail`, `AppleAppeared`.

Once fired, events should be immediately serialized and appended to a persistent mecanism. And we are done for the writing part of the application ! No transactions, lock, complicated joins. Just a sequential log of events that happened.

I just told you that a `CommandHandler` should read the _current state_. To do so, we provide to each event type an `EventHandler` that given a state and an event can produce a new state. Successively applying all the events stored will produce the current state.

# Implementation

Let's model the first commands ! My methodology here is quite disturbing. I use to be a Java developer and one of those wearing "TDD rulez" shirts. But here I have a twisted approach. I will first write code in a DSL fashion, imagining that every function that I use already exists. This way I build a high level api, fitting exactly my needs.

        (ns snake-clj.commands)

I create a new namespace that will hold all the commands logic.

        (defn start-game []
          {:event-type :game-started
           :id (db/next-id)})
           
 This is our first command handler ! Since the command _StartGame_ has no data, there is no need to materialize it in an empty map. So this command handler is a no arg function that returns a single event. Let's talk about events : they are pure data, so I modelized it as a map. Each single events will have 2 mandatory properties : 
 
 - event-type is self-describing
 
 - id is the id of the _aggregate root_ concerned by this command.
 
 With those two properties, we can bind an event handler that will modify the state of a peculiar aggregate root for all events of that kind.
Remember that I'm a java guy, so I'm still a bit shy about manipulating data without indirection. Let's refactor this code. 

        (defn start-game []
          (evt/game-started (db/next-id)))
          
I use a factory, now I'm releaved. `(db/next-id)` is just a way to get a new id.
        
        (defn turn-right [{id :id}]
          (when-let [snake (db/load-aggregate id)]
            (let [turned-right-evt (evt/turned-right id)
                  hit-smthing-evt (cond
                                    (wall? (right-of snake)) (evt/hit-wall id)
                                    (apple? (right-of snake)) (evt/ate-apple id)
                                    (tail? (right-of snake)) (evt/ate-tail id))]
              (if (nil? hit-smthing-evt)
                [turned-right-evt]
                [turned-right-evt hit-smthing-evt]))))

Here's the implementation of _TurnRight_ command handler.  The command parameter take has a single data: the `id` of the aggregate-root we want to apply the command against. The direction, right or left, is hold by the API itself.
Then we load the aggregate in a `when-let` macro, meaning that if the aggregate can't be loaded, the command handler will return `nil`. If there is something on snake's right we fire the _TurnedRight_ event and either _HitWall_, _AteApple_ and _AteTail_ events. I like the dsl style of domain logic `(wall? (right-of snake))`. If there is nothing on snake's right, we fire the single _TurnedRight_ event.

The _TurnLeft_ command handler is copy pasting of _TurnRight_, replacing 'right' by 'left'. So we can refactor to satisfy the DRY principle. But, I'm still wondering if this is a hint or not to change the API. Here is the refactored code for _TurnRight_ and _TurnLeft_ :
        
        (defn- turn [direction-of event-factory id]
          (when-let [snake (db/load-aggregate id)]
              (let [turned-evt (event-factory id)
                    hit-smthing-evt (cond
                                      (wall? (direction-of snake)) (evt/hit-wall id)
                                      (apple? (direction-of snake)) (evt/ate-apple id)
                                      (tail? (direction-of snake)) (evt/ate-tail id))]
                (if (nil? hit-smthing-evt)
                  [turned-evt]
                  [turned-evt hit-smthing-evt]))))
        
        (defn turn-right [{id :id}]
          (turn right-of evt/turned-right id))
        
        (defn turn-left [{id :id}]
          (turn left-of evt/turned-left id))

I won't brague any longer on the goodness of higher order functions ...

Next is the _GoAhead_ command that will probably be fired by a _timer_. Once again, I figured that the implementation is the same as the other commands.
Let's see the whole code for commands :

        (ns snake-clj.commands
          (:require
            [snake-clj.core :refer :all]
            [snake-clj.events :as evt]
            [snake-clj.db :as db]))
        
        (defn start-game []
          (evt/game-started (db/next-id)))
        
        (defn- move [direction-of event-factory id]
          (when-let [snake (db/load-aggregate id)]
            (let [turned-evt (event-factory id)
                  hit-smthing-evt (cond
                                    (wall? (direction-of snake)) (evt/hit-wall id)
                                    (apple? (direction-of snake)) (evt/ate-apple id)
                                    (tail? (direction-of snake)) (evt/ate-tail id))]
              (if (nil? hit-smthing-evt)
                [turned-evt]
                [turned-evt hit-smthing-evt]))))
        
        (defn turn-right [{id :id}]
          (move right-of evt/turned-right id))
        
        (defn turn-left [{id :id}]
          (move left-of evt/turned-left id))
        
        (defn go-ahead [{id :id}]
          (move ahead-of evt/gone-ahead id))
          
 This code still use unimplemented functions. Let's start with event factories.
 
         (ns snake-clj.events)
        
        (defn- event [type id]
          {:event-type type
           :id         id})
        
        (defn game-started [id]
          (event :game-started id))
        
        (defn hit-wall [id]
          (event :hit-wall id))
        
        (defn ate-tail [id]
          (event :ate-tail id))
        
        (defn ate-apple [id]
          (event :ate-apple id))
        
        (defn turned-right [id]
          (event :turned-right id))
        
        (defn turned-left [id]
          (event :turned-left id))
        
        (defn gone-ahead [id]
          (event :gone-ahead id))
          
 Pretty dumb ! We can figure that our domain is not a complex one for now.
 
 Now we have to data model our core domain logic `snake-clj`. What is snake game is term of data ? A snake is just a list of contiguous cells in a matrix. Apples and walls are just properties attached to each cell of that matrix. Each cell has coordinates.
 
 I switch to TDD for developping our core domain. Let's see if data is emerging by itself...

Red :

        (deftest test-right-of
          (is (= nil (right-of {:world nil :snake [[0 1]]}))
              "When the world doesn't exist there is nothing right-of snake")))

Green :
              
        (defn right-of [] nil)
        
Red : 

    (is (= :tail (right-of {:world [nil] :snake [[0 0]]}))
          "Right of a 1 cell world is always the tail of a snake")
          
 Green : 
 
    (defn right-of [{world :world}]
        (if world :tail nil))
        
Red :
    
    (is (= :apple (right-of {:world [[nil :apple]] :snake [[0 0]]}))
      "There is an apple right of snake")
      
 Green (slightly more elaborate) :
 
    (defn- arity-y [matrix]
      (count matrix))
    
    (defn- arity-x [matrix]
      (count (nth matrix 0)))
    
    (defn- get-at [matrix [x y]]
      (-> matrix
          (nth y)
          (nth x)))
    
    (defn- head [snake]
      (peek snake))
    
    (defn- move-right [world [x y]]
      (let [y (mod y (arity-y world))
            x (mod (inc x) (arity-x world))]
        [x y]))
    
    (defn- is-tail? [snake p]
      (some #(= p %) snake))
    
    (defn right-of [{world :world snake :snake}]
      (if world
        (let [head-position (head snake)
              new-head-position (move-right world head-position)]
          (prn snake new-head-position world)
          (if (is-tail? snake new-head-position)
            :tail
            (get-at world new-head-position)))
        nil))
        
So, `arity-y` `arity-x` and `get-at` belongs to a matrix generic subdomain. They will probably be moved to their own namespace or replaced by a library.