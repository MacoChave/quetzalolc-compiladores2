import { AST } from '../ast/ast';
import { Scope } from '../ast/scope';
import { Expression } from '../interfaces/expresion';
import { Instruction } from '../interfaces/instruction';
import { setConsole } from '../shared';

export class Print implements Instruction {
	line: number;
	column: number;
	public expression: Expression;
	constructor(expression: Expression, line: number, column: number) {
		this.expression = expression;
		this.line = line;
		this.column = column;
	}

	exec(scope: Scope, tree: AST) {
		const value = this.expression.getValue(scope, tree);
		if (value !== null) setConsole(value);
		else
			setConsole(
				`Error semántico (${this.line}, ${this.column}): No se pueden imprimir valores nulos`
			);
	}
}

export class Println implements Instruction {
	line: number;
	column: number;
	public expression: Expression;
	constructor(expression: Expression, line: number, column: number) {
		this.expression = expression;
		this.line = line;
		this.column = column;
	}

	exec(scope: Scope, tree: AST) {
		const value = this.expression.getValue(scope, tree);
		if (value !== null) setConsole(`${value}\n`);
		else
			setConsole(
				`Error semántico (${this.line}, ${this.column}): No se pueden imprimir valores nulos`
			);
	}
}
