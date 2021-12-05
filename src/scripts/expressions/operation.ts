import { AST } from '../ast/ast';
import { Scope } from '../ast/scope';
import { Type } from '../ast/type';
import { Expression } from '../interfaces/expresion';

export enum Operador {
	SUMA,
	RESTA,
	MULTIPLICACION,
	DIVISION,
	MODULO,
	MENOS_UNARIO,
	MAYOR_QUE,
	MENOR_QUE,
	IGAL_IGUAL,
	DIFERENTE_QUE,
	OR,
	AND,
	NOT,
	MAYOR_IGUAL_QUE,
	MENOR_IGUAL_QUE,
	DESCONOCIDO,
}

export class Operacion implements Expression {
	line: number;
	column: number;
	op_izq: Expression;
	op_der: Expression;
	operador: Operador;

	constructor(
		line: number,
		column: number,
		op_izq: Expression,
		op_der: Expression,
		operador: Operador
	) {
		this.line = line;
		this.column = column;
		this.op_izq = op_izq;
		this.op_der = op_der;
		this.operador = operador;
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
			this.operador !== Operador.MENOS_UNARIO &&
			this.operador !== Operador.NOT
		) {
			let op1 = this.op_izq.getValue(scope, tree);
			let op2 = this.op_izq.getValue(scope, tree);

			if (this.operador === Operador.SUMA) {
				if (typeof op1 === 'number' && typeof op2 === 'number')
					return op1 + op2;
				else if (op1 === 'string' || op2 === 'string') {
					if (op1 === null) op1 = 'null';
					if (op2 === null) op2 = 'null';
					return op1.toString() + op2.toString();
				} else {
					console.error(
						`Error semántico ${op1} y ${op2} tiene un formato no permitido`
					);
					return null;
				}
			} else if (this.operador === Operador.RESTA) {
				if (typeof op1 === 'number' && typeof op2 === 'number')
					return op1 - op2;
				else {
					console.error(
						`Error semántico: ${op1} y ${op2} tiene tipo de dato no permitido`
					);
					return null;
				}
			} else if (this.operador === Operador.MULTIPLICACION) {
				if (typeof op1 === 'number' && typeof op2 === 'number')
					return op1 * op2;
				else {
					console.error(
						`Error semántico: ${op1} y ${op2} tiene tipo no permitido`
					);
					return null;
				}
			} else if (this.operador === Operador.DIVISION) {
				if (typeof op1 === 'number' && typeof op2 === 'number') {
					if (op2 === 0) {
						console.error(`Error semántico: ${op2} no debe ser 0`);
						return null;
					}
					return op1 / op2;
				} else {
					console.error(
						`Error semántico: ${op1} y ${op2} tiene tipo de dato no permitido`
					);
					return null;
				}
			} else if (this.operador === Operador.MODULO) {
				if (typeof op1 === 'number' && typeof op2 === 'number') {
					if (op2 === 0) {
						console.error(`Error semántico: ${op2} no debe ser 0`);
						return null;
					}
					return op1 % op2;
				} else {
					console.error(
						`Error semántico: ${op1} y ${op2} tiene tipo no permitido`
					);
					return null;
				}
			}
		} else {
			let op1 = this.op_izq.getValue(scope, tree);
			if (this.operador == Operador.MENOS_UNARIO) {
				if (typeof (op1 === 'number')) return op1 * -1;
				else {
					console.error(
						`Error semántico, ${op1} no es tipo numerico`
					);
					return null;
				}
			} else if (this.operador == Operador.NOT) {
				if (typeof (op1 === 'boolean')) return op1 * -1;
				else {
					console.error(
						`Error semántico, ${op1} no es tipo numerico`
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
