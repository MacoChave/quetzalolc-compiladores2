import { Expression } from '../interfaces/expresion';
import { AST } from './ast';
import { Scope } from './scope';
import { Type } from './type';

export class Symbol implements Expression {
	line: number;
	column: number;
	public id: string;
	public value: any;
	private type: Type;

	constructor(
		type: Type,
		id: string,
		line: number,
		column: number,
		value: any
	) {
		this.type = type;
		this.id = id;
		this.line = line;
		this.column = column;
		this.value = value;
	}

	getType(scope: any, tree: any) {
		return this.type;
	}
	getValue(scope: any, tree: any) {
		return this.value;
	}

	translate(scope: Scope, tree: AST) {
		throw new Error('Method not implemented.');
	}
}
