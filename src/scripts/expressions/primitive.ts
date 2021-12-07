import { AST } from '../ast/ast';
import { Scope } from '../ast/scope';
import { Type } from '../ast/type';
import { Expression } from '../interfaces/expresion';

export class Primitive implements Expression {
	line: number;
	column: number;
	value: any;
	type: Type;

	constructor(value: any, type: Type, line: number, column: number) {
		this.line = line;
		this.type = type;
		this.column = column;
		this.value = value;
	}

	getType(scope: Scope, tree: AST): Type {
		// TODO: Return this.type & match to Operation class
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
