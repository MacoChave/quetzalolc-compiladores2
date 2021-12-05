import { AST } from '../ast/ast';
import { Scope } from '../ast/scope';
import { Type } from '../ast/type';

export interface Expression {
	line: number;
	column: number;
	getType(scope: Scope, tree: AST): Type;
	getValue(scope: Scope, tree: AST): any;
}
