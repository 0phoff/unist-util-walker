/*
 * Custom tree traversal function that mimics estree-walker, but works with unist types
 * Note that not all functionality from estree-walker is implemented !
 */
import type { Node, Parent } from 'unist';


export interface WalkerContext {
	skip(): void;
	break():  void;
	remove(): void;
	replace<N extends Node>(node: N): void;
}

export type VisitorFunction = (this: WalkerContext, node: Node, parent?: Parent, index?: number) => void;


export function walk<N extends Node> (
	node: N,
	{enter, leave} : {enter?: VisitorFunction, leave?: VisitorFunction},
): Node {
	const instance = new Walker(enter, leave);
	return instance.visit(true, node) as Node;
}


class Walker {
	private readonly enter?: VisitorFunction;
	private readonly leave?: VisitorFunction;
	private readonly context: WalkerContext;
	private should_skip: boolean;
	private should_break: boolean;
	private should_remove: boolean;
	private should_replace: Node | null;
	
	constructor(enter?: VisitorFunction, leave?: VisitorFunction) {
		this.enter = enter
		this.leave = leave
		this.context = {
			skip: () => {this.should_skip = true},
			break: () => {this.should_break = true},
			remove: () => {this.should_remove = true},
			replace: (node) => {this.should_replace = node},
		};

		this.should_skip = false;
		this.should_break = false;
		this.should_remove = false;
		this.should_replace = null;
	}

	visit(root: boolean, node: Node, parent?: Parent, index?: number): Node | null {
		// Enter function
		let should_skip: boolean = false;

		if (this.enter) {
			const savedContext = {
				skip: this.should_skip,
				break: this.should_break,
				remove: this.should_remove,
				replace: this.should_replace
			};

			this.enter.call(this.context, node, parent, index);

			if (this.should_replace) {
				if (root) {
					for (const key of [...Object.keys(node), ...Object.keys(this.should_replace)]) {
						if (key in this.should_replace) {
							(node as any)[key] = (this.should_replace as any)[key];
						} else if (key in node) {
							delete (node as any)[key];
						}
					}
				} else {
					node = this.should_replace;
				}
			}

			if (this.should_remove && !root) {
				this.should_skip = savedContext.skip;
				this.should_break = savedContext.break;
				this.should_remove = savedContext.remove;
				this.should_replace = savedContext.replace;
				return null;
			}

			if (this.should_break) {
				this.should_skip = savedContext.skip;
				this.should_break = savedContext.break;
				this.should_remove = savedContext.remove;
				this.should_replace = savedContext.replace;
				return node;
			}

			should_skip = this.should_skip;
			this.should_skip = savedContext.skip;
			this.should_break = savedContext.break;
			this.should_remove = savedContext.remove;
			this.should_replace = savedContext.replace;
		}

		// Recurse over children
		if (!should_skip && this.nodeIsParent(node)) {
			for (let i=0 ; i < node.children.length ; i++) {
				const returnNode = this.visit(false, node.children[i], node, i);
				if (returnNode) {
					node.children[i] = returnNode;
				} else {
					node.children.splice(i, 1);
					i--;
				}
			}
		}

		// Leave function
		if (this.leave) {
			const savedContext = {
				remove: this.should_remove,
				replace: this.should_replace
			};
			
			this.leave.call(this.context, node, parent, index);

			if (this.should_replace) {
				if (root) {
					for (const key of [...Object.keys(node), ...Object.keys(this.should_replace)]) {
						if (key in this.should_replace) {
							(node as any)[key] = (this.should_replace as any)[key];
						} else if (key in node) {
							delete (node as any)[key];
						}
					}
				} else {
					node = this.should_replace;
				}
			}

			if (this.should_remove && !root) {
				this.should_remove = savedContext.remove;
				this.should_replace = savedContext.replace;
				return null;
			}

			this.should_remove = savedContext.remove;
			this.should_replace = savedContext.replace;
		}

		return node;
	}

	nodeIsParent(node: Node): node is Parent {
		return 'children' in node;
	}
}
