## Goal

This project is:
gpu accelerated cad kernel

## Goal (Implementation)

This project is:
a dsl to write expressions in
that is cross platform
the expressions are used to create a shader
to render signed distance fields <- sdf maths
and to interact with the scene graph <- "select" raycast
- how did this point get here with respect to degrees of freedom

## Semantics

### Scene Graph

The scene graph describes
- which operations are done 
- how to determine degrees of freedom
- design intent?
- binds names to values
- Tree view is metadata, order and heirarchy are not part of evaluation

### Feature

Each item in the scene graph describes a feature

- has a "state" view
- has a "tree" view
- has a "type"
- has a "control panel" view
- has a "display" view
- has a 3d selection
- has a 3d widget
- evaluates to a shader
And represents parameters for their parents

Directed cyclic graph - is a solver

### Expression

Story:
Creating an unconstrained circle is the same sequence of operations:
1. Enter 2d context
2. Select center-circle tool
3. Manipulate view with scroll wheel
4. Click center
5. Click edge
6. Place dimension
7. Enter fixed dimension

Implementation:
InputState: CenterCircle
- Step Enum

Scene graph:
CenterCircle01
DecimalConstant01
2dConstant01
XYPlane


Premise:
the expressions have to be /stupid fast/ and /stupid parallel/

Shadertoy notes:
function name()

Parse into AST
render AST into language of choice
compile language of choice

Examples:
A bolt.

Bolt -
  Variants - 1/4" g e
  Wrench Size - 3/4" e
  

Learnings from example:
Scene graph is displayed as a tree


"Most important first"
Criticisms of time based cad:
details end up "most recent"
Solution:
Drive details deeper, start with fundamentals



It can be used to:
compute collisions
trace the scene graph through space
"select" a dimension
drive screen space widgets
describe constraints

Eventually the goal is to
have a standard library of algorithms


semantic checking on intent:
"distance from top"
"distance from bottom"

Whacky implementation idea:
Stack based VM
Describe SDFs
Debugging tool
"Degree of Freedom" widget
Solvers