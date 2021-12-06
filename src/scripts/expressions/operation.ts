import { AST } from '../ast/ast';
import { Scope } from '../ast/scope';
import { Type } from '../ast/type';
import { Expression } from '../interfaces/expresion';
import { setConsole } from '../shared';

export enum Operador {
	SUMA,
	RESTA,
	MULTIPLICACION,
	DIVISION,
	MODULO,
	NEGATIVO,
	REPETIR,
	CONCAT,
	MAYOR,
	MENOR,
	MAYOR_IGUAL,
	MENOR_IGUAL,
	IGUAL,
	DIFERENTE,
	OR,
	AND,
	NOT,
	DESCONOCIDO,
}

export class Operacion implements Expression {
	line: number;
	column: number;
	op_izq: Expression;
	op_der: Expression;
	operador: Operador;

	constructor(
		op_izq: Expression,
		op_der: Expression,
		operador: Operador,
		line: number,
		column: number
	) {
		this.op_izq = op_izq;
		this.op_der = op_der;
		this.operador = operador;
		this.line = line;
		this.column = column;
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
		if (
			this.operador !== Operador.NEGATIVO &&
			this.operador !== Operador.NOT
		) {
			let op1 = this.op_izq.getValue(scope, tree);
			let op2 = this.op_der.getValue(scope, tree);

			if (this.operador === Operador.SUMA) {
				if (typeof op1 === 'number' && typeof op2 === 'number')
					return op1 + op2;
				else if (op1 === 'string' || op2 === 'string') {
					if (op1 === null) op1 = 'null';
					if (op2 === null) op2 = 'null';
					return op1.toString() + op2.toString();
				} else {
					setConsole(
						`Error semántico (${this.line},${this.column}): Se esperaba un int o double`
					);
					return null;
				}
			} else if (this.operador === Operador.RESTA) {
				if (typeof op1 === 'number' && typeof op2 === 'number')
					return op1 - op2;
				else {
					setConsole(
						`Error semántico (${this.line},${this.column}): Se esperaba un int o double`
					);
					return null;
				}
			} else if (this.operador === Operador.MULTIPLICACION) {
				if (typeof op1 === 'number' && typeof op2 === 'number')
					return op1 * op2;
				else {
					setConsole(
						`Error semántico (${this.line},${this.column}): Se esperaba un int o double`
					);
					return null;
				}
			} else if (this.operador === Operador.DIVISION) {
				if (typeof op1 === 'number' && typeof op2 === 'number') {
					if (op2 === 0) {
						setConsole(
							`Error semántico (${this.line},${this.column}): ${op1} no es divisible entre 0`
						);
						return null;
					}
					return op1 / op2;
				} else {
					setConsole(
						`Error semántico (${this.line},${this.column}): Se esperaba un int o double`
					);
					return null;
				}
			} else if (this.operador === Operador.MODULO) {
				if (typeof op1 === 'number' && typeof op2 === 'number') {
					if (op2 === 0) {
						setConsole(
							`Error semántico (${this.line},${this.column}): ${op1} no es divisible entre 0`
						);
						return null;
					}
					return op1 % op2;
				} else {
					setConsole(
						`Error semántico (${this.line},${this.column}): Se esperaba un int o double`
					);
					return null;
				}
			} else if (this.operador === Operador.REPETIR) {
				if (typeof op1 === 'string' && typeof op2 === 'number') {
					return op1.repeat(op2);
				} else {
					setConsole(
						`Error semántico (${this.line},${this.column}): Se esperaba (string, int)`
					);
					return null;
				}
			} else if (this.operador === Operador.CONCAT) {
				return `${op1}${op2}`;
			}
		} else {
			let op1 = this.op_izq.getValue(scope, tree);
			if (this.operador == Operador.NEGATIVO) {
				if (typeof (op1 === 'number')) return op1 * -1;
				else {
					setConsole(
						`Error semántico (${this.line},${this.column}): Se esperaba que ${op1} sea tipo int o double`
					);
					return null;
				}
			} else if (this.operador == Operador.NOT) {
				if (typeof (op1 === 'boolean')) return op1 * -1;
				else {
					setConsole(
						`Error semántico (${this.line},${this.column}): Se esperaba que ${op1} sea tipo boolean`
					);
					return null;
				}
			}
		}
		return null;
	}

	isInt(n: number): boolean {
		return Number(n) === n && n % 1 === 0;
	}
}
