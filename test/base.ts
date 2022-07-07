import { test } from 'uvu';
import { Logger, createBasicAST } from './util';
import { walk } from '../src/index';


// Enter
test('enter should visit all nodes', () => {
	const logger = new Logger();
	const tree = createBasicAST();

	walk(tree, {
		enter(node) {
			if ('id' in node) {
				logger.log(`${node.type} ${(node as any).id}`);
			} else {
				logger.log(`${node.type}`);
			}
		},
	});

	logger.assert(['root', 'subtree 1', 'subtree 2', 'node', 'leaf 1', 'leaf 2', 'leaf 3', 'void']);
});


// Leave
test('leave should visit all nodes', () => {
	const logger = new Logger();
	const tree = createBasicAST();

	walk(tree, {
		leave(node) {
			if ('id' in node) {
				logger.log(`${node.type} ${(node as any).id}`);
			} else {
				logger.log(`${node.type}`);
			}
		},
	});

	logger.assert(['subtree 1', 'leaf 1', 'leaf 2', 'node', 'leaf 3', 'void', 'subtree 2', 'root']);
});


// Enter & Leave
test('enter should fire before leave', () => {
	const logger = new Logger();
	const tree = createBasicAST();

	walk(tree, {
		enter(node) {
			if ('id' in node) {
				logger.log(`enter ${node.type} ${(node as any).id}`);
			} else {
				logger.log(`enter ${node.type}`);
			}
		},

		leave(node) {
			if ('id' in node) {
				logger.log(`leave ${node.type} ${(node as any).id}`);
			} else {
				logger.log(`leave ${node.type}`);
			}
		},
	});

	logger.assert([
		'enter root',
		'enter subtree 1',
		'leave subtree 1',
		'enter subtree 2',
		'enter node',
		'enter leaf 1',
		'leave leaf 1',
		'enter leaf 2',
		'leave leaf 2',
		'leave node',
		'enter leaf 3',
		'leave leaf 3',
		'enter void',
		'leave void',
		'leave subtree 2',
		'leave root',
	]);
});


test.run();
