import { AST } from '../ast/ast';
import { Scope } from '../ast/scope';

export interface Instruction {
	line: number;
	column: number;
	exec(scope: Scope, tree: AST): any;
}
