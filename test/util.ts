import * as assert from 'uvu/assert';
import { Node } from 'unist';
import { u } from 'unist-builder';


export class Logger {
	private messages: string[];

	constructor() {
		this.messages = [];
	}

	log(message: string) {
		this.messages.push(message);
	}

	clear() {
		this.messages = [];
	}

	assert(target: string[]) {
		assert.equal(this.messages, target);
	}
}


export function createBasicAST(extra: any = {}): Node {
	return u('root', extra, [
		u('subtree', {id: 1}),
		u('subtree', {id: 2}, [
			u('node', [u('leaf', {id: 1}), u('leaf', {id: 2})]),
			u('leaf', {id: 3}),
		    u('void'),
		]),
	]);
}
