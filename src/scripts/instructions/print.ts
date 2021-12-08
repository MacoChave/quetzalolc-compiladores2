import { forEach } from '@angular-devkit/schematics';
import { AST } from '../ast/ast';
import { Scope } from '../ast/scope';
import { Expression } from '../interfaces/expresion';
import { Instruction } from '../interfaces/instruction';
import { setConsole } from '../shared';

export class Print implements Instruction {
	line: number;
	column: number;
	public expressions: Expression[];
	newLine: boolean;
	constructor(
		expressions: Expression[],
		line: number,
		column: number,
		newLine: boolean = false
	) {
		this.expressions = expressions;
		this.line = line;
		this.column = column;
		this.newLine = newLine;
	}

	exec(scope: Scope, tree: AST) {
		this.expressions.forEach((expr) => {
			const value = expr.getValue(scope, tree);
			if (value !== null) {
				setConsole(value);
			} else
				setConsole(
					`Error semántico (${this.line}, ${this.column}): No se pueden imprimir valores nulos`
				);
		});
		if (this.newLine) setConsole('\n');
	}

	translate(scope: Scope, tree: AST) {
		throw new Error('Method not implemented.');
	}
}
