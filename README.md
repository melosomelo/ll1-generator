# ll1-generator

## What is this?

This is a personal project of mine which is an LL(1) parser visualizer. It's an educatory project
through which people can visualize better how the process of LL(1) parsing works. I built this because
I find the topic very interesting and thought it'd be a good opportunity to practice:

- TypeScript library writing/building/deploying.
- VueJS.

This project is comprised of:

- (Implemented ✅) The `ll1-generator-core` library, which implements core LL(1) parsing functionalities such as
  grammar definition, First/Follow sets generation and also parsing table/tree generation.
- (Not implemented yet ⚠️) A front-end written in VueJS which uses the core library and provides an interface for uses to visualize
  what's really going on.

## Future plans

Currently, the `ll1-generator-core` library does not automatically generate LL(1) parsers. I plant
to implement this on the next major release (if there is one).
