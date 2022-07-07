<div align="center">

# UNIST UTIL WALKER
_Talk the Talk - Walk the Tree_  
[![npm version](https://badge.fury.io/js/unist-util-walker.svg)](https://badge.fury.io/js/unist-util-walker)
[![main](https://github.com/0phoff/unist-util-walker/actions/workflows/main.yml/badge.svg)](https://github.com/0phoff/unist-util-walker/actions/workflows/main.yml)
[![codecov](https://codecov.io/gh/0phoff/unist-util-walker/branch/master/graph/badge.svg?token=JWVVNRI6IK)](https://codecov.io/gh/0phoff/unist-util-walker)

</div>

Inspired by [estree-walker](https://github.com/Rich-Harris/estree-walker), this package provides a method to walk unist trees, by providing an `enter` and `leave` function.
The main advantage over [unist-util-visit](https://github.com/syntax-tree/unist-util-visit) is that we can enter all child nodes and accumulate data,
which we can then use in the leave function of the parent.

## Installation
This package is ESM only: Node 12+ is needed to use it and it must be imported instead of required.

### NPM
```bash
npm install unist-util-walker
```

### YARN
```bash
yarn add unist-util-walker
```

### PNPM
```bash
pnpm add unist-util-walker
```

## Usage
```typescript
import type { Node, Parent } from 'unist';
import { walk } from 'unist-util-walker';
import { u } from 'unist-builder';

const tree: Node = u('root', [
  u('subtree', {id: 1}),
  u('subtree', {id: 2}, [
    u('node', [u('leaf', {id: 1}), u('leaf', {id: 2})]),
    u('leaf', {id: 3}),
    u('void'),
  ]),
]);

walk(tree, {
  enter(node: Node, parent?: Parent, index?: number) {
    // some code happens
  },
  leave(node: Node, parent?: Parent, index?: number) {
    // some code happens
  }
});
```

Inside of the `enter` and `leave` functions, you can call the following functions:

- `this.break()`  
  Skips children and the leave function of the current node (only useful in enter).
- `this.skip()`  
  Skips children, but still runs the leave function of the current node (only useful in enter).
- `this.remove()`  
  Removes the node from the tree.
- `this.replace(node: Node)`  
  Replaces the node with a new one.
