import { AST } from '../ast/ast';
import { Scope } from '../ast/scope';
import { Type } from '../ast/type';
import { Expression } from '../interfaces/expresion';

export class Primitive implements Expression {
	line: number;
	column: number;
	value: any;

	constructor(value: any, line: number, column: number) {
		this.line = line;
		this.column = column;
		this.value = value;
	}

	getType(scope: Scope, tree: AST): Type {
		const value = this.getValue(scope, tree);
		if (typeof value === 'boolean') return Type.BOOL;
		else if (typeof value === 'string') return Type.STRING;
		else if (typeof value === 'number') {
			if (this.isInt(Number(value))) return Type.INT;
			return Type.DOUBLE;
		} else if (value === null) return Type.NULL;

		return Type.VOID;
	}
	getValue(scope: Scope, tree: AST) {
		return this.value;
	}

	isInt(n: number): boolean {
		return Number(n) === n && n % 1 === 0;
	}
}
