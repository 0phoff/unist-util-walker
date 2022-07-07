import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { u } from 'unist-builder';
import { Logger, createBasicAST } from './util';
import { walk } from '../src/index';

// Skip
test('using skip should skip child nodes', () => {
	const logger = new Logger();
	const tree = createBasicAST();

	walk(tree, {
		enter(this, node) {
			if (node.type === 'subtree' && (node as any).id === 2) {
				this.skip();
			}
		},

		leave(node) {
			if ('id' in node) {
				logger.log(`${node.type} ${(node as any).id}`);
			} else {
				logger.log(`${node.type}`);
			}
		}
	});

	logger.assert(['subtree 1', 'subtree 2', 'root']);
});

// Break
test('using break should skip child nodes and leave function from current node', () => {
	const logger = new Logger();
	const tree = createBasicAST();

	walk(tree, {
		enter(this, node) {
			if (node.type === 'subtree' && (node as any).id === 2) {
				this.break();
			}
		},

		leave(node) {
			if ('id' in node) {
				logger.log(`${node.type} ${(node as any).id}`);
			} else {
				logger.log(`${node.type}`);
			}
		}
	});

	logger.assert(['subtree 1', 'root']);
});

// Remove
test('using remove should remove a node from the tree', () => {
	const logger = new Logger();
	const tree = createBasicAST();

	walk(tree, {
		enter(this, node) {
			if (node.type === 'node') {
				this.remove();
			}
		},

		leave(node) {
			if ('id' in node) {
				logger.log(`${node.type} ${(node as any).id}`);
			} else {
				logger.log(`${node.type}`);
			}
		}
	});

	logger.assert(['subtree 1', 'leaf 3', 'void', 'subtree 2', 'root']);
	assert.equal(
		tree,
		u('root', [
			u('subtree', {id: 1}),
			u('subtree', {id: 2}, [
				u('leaf', {id: 3}),
			    u('void'),
			]),
		])
	);
});

// Replace
test('using replace should replace a node from the tree', () => {
	const logger = new Logger();
	const tree = createBasicAST();

	walk(tree, {
		enter(this, node) {
			if (node.type === 'node') {
				this.replace(u('newnode', [u('newleaf', {id: 1}, [u('actualleaf')]), u('newleaf', {id: 2})]));
			}
		},

		leave(node) {
			if ('id' in node) {
				logger.log(`${node.type} ${(node as any).id}`);
			} else {
				logger.log(`${node.type}`);
			}
		}
	});

	logger.assert(['subtree 1', 'actualleaf', 'newleaf 1', 'newleaf 2', 'newnode', 'leaf 3', 'void', 'subtree 2', 'root']);
	assert.equal(
		tree,
		u('root', [
			u('subtree', {id: 1}),
			u('subtree', {id: 2}, [
				u('newnode', [u('newleaf', {id: 1}, [u('actualleaf')]), u('newleaf', {id: 2})]),
				u('leaf', {id: 3}),
			    u('void'),
			]),
		])
	);
});

// Remove & Replace in leave
test('using replace and remove in the leave function', () => {
	const tree = createBasicAST();

	walk(tree, {
		leave(node) {
			if (node.type === 'node') {
				this.replace(u('newnode', [u('newleaf', {id: 1}, [u('actualleaf')]), u('newleaf', {id: 2})]));
			} else if (node.type === 'leaf' && (node as any).id === 3) {
				this.remove();
			}
		}
	});

	assert.equal(
		tree,
		u('root', [
			u('subtree', {id: 1}),
			u('subtree', {id: 2}, [
				u('newnode', [u('newleaf', {id: 1}, [u('actualleaf')]), u('newleaf', {id: 2})]),
			    u('void'),
			]),
		])
	);
});


test.run();
