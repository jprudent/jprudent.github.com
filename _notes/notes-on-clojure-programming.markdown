# Functional programming

immutable datastructures that satisfy simple abstractions, rather than mutable bag of state

mutable objects:
- can't be safely past to functions
- can't be safely used as a key in a map or put in a set
- can't be reliably cached
- can't be easily used in multithreaded environment

# Datatypes and Protocols

The expression problem : 

- having new types to implement old interfaces : interface inheritance, subclassing

- providing implementations of new interfaces to old types : monkey patching (adding method to an existing object) only available in dynamic language (javascript / ruby) 

The first argument to each method in a protocol is said to be priviledged because a particular protocol implementation will be chosen for each call based on it and more specifically on tis type. 

A good protocol is one that is easy to implement. There is nothing wrong with a protocol having a single method.

Convenience functions have no reason to be part of a protocol. They should be build on top of prottocol methods.

Don't need to implement all methods of a protocol. If not implemented and called, an exception is thrown.

A protocol can be extended to nil, so no NPE could happen.

(extend-protocol Matrix
  nil
  (lookup [x i j]))