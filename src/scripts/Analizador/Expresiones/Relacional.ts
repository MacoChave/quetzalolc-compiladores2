//aritmeticas
import { Codigo3d, new_etiqueta, new_temporal } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class Relacional extends Instruccion {
	private cond1: Instruccion;
	private cond2: Instruccion;
	private relacion: Relacionales;
	constructor(
		relacion: Relacionales,
		fila: number,
		columna: number,
		cond1: Instruccion,
		cond2: Instruccion
	) {
		super(new Tipo(tipoDato.ENTERO), fila, columna);
		this.relacion = relacion;
		this.cond1 = cond1;
		this.cond2 = cond2;
	}

	public getNodo(): nodoAST {
		let nodo = new nodoAST('RELACIONAL');
		nodo.agregarHijoAST(this.cond1.getNodo());
		nodo.agregarHijo(this.relacion + '', 'rel', this.relacion);
		nodo.agregarHijoAST(this.cond2.getNodo());
		return nodo;
	}

	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		let izq, der;
		izq = this.obtieneValor(this.cond1, arbol, tabla);
		if (izq instanceof Errores) return izq;
		der = this.obtieneValor(this.cond2, arbol, tabla);
		if (der instanceof Errores) return der;
		if (
			(this.cond1.tipoDato.getTipo() == tipoDato.CADENA &&
				this.cond2.tipoDato.getTipo() != tipoDato.CADENA) ||
			(this.cond2.tipoDato.getTipo() == tipoDato.CADENA &&
				this.cond1.tipoDato.getTipo() != tipoDato.CADENA)
		) {
			return new Errores(
				'ERROR SEMANTICO',
				'SOLO PUEDE COMPARAR CADENAS CON OTRO TIPO DE DATO',
				this.fila,
				this.columna
			);
		} else {
			this.tipoDato.setTipo(tipoDato.BOOLEANO);
			switch (this.relacion) {
				case Relacionales.IGUAL:
					return izq == der;
				case Relacionales.DIFERENTE:
					return izq != der;
				case Relacionales.MENOR:
					return izq < der;
				case Relacionales.MENORIGUAL:
					return izq <= der;
				case Relacionales.MAYOR:
					return izq > der;
				case Relacionales.MAYORIGUAL:
					return izq >= der;
				default:
					return 'TIPO DE COMPARACION RELACIONAL INCORRECTO';
			}
		}
	}

	obtieneValor(
		operando: Instruccion,
		arbol: Arbol,
		tabla: tablaSimbolos
	): any {
		let valor = operando.interpretar(arbol, tabla);
		switch (operando.tipoDato.getTipo()) {
			case tipoDato.ENTERO:
				return parseInt(valor);
			case tipoDato.DECIMAL:
				return parseFloat(valor);
			case tipoDato.CARACTER:
				var da = valor + '';
				var res = da.charCodeAt(0);
				return res;
			case tipoDato.BOOLEANO:
				let dats = valor + '';
				let otr = dats.toLowerCase();
				return parseInt(otr);
			case tipoDato.CADENA:
				return '' + valor;
		}
	}

	traducir(arbol: Arbol, tabla: tablaSimbolos): Codigo3d {
		let res: Codigo3d = {
			codigo3d: '',
			etq_falsas: [],
			etq_salida: [],
			etq_verdaderas: [],
			pos: 0,
			temporal: 0,
			tipo: -1,
		};
		let label_true: number = new_etiqueta();
		let label_false: number = new_etiqueta();

		let izq: Codigo3d = this.cond1.traducir(arbol, tabla);
		let der: Codigo3d = this.cond2.traducir(arbol, tabla);

		let c3d: string = `${izq.codigo3d}\n${der.codigo3d}\n`;

		if (izq.tipo === tipoDato.CADENA && der.tipo === tipoDato.CADENA) {
			let label1: number = new_etiqueta();
			let label2: number = new_etiqueta();
			let label3: number = new_etiqueta();
			let label4: number = new_etiqueta();
			let t_cond: number = new_temporal();
			let t_valorIzq: number = new_temporal();
			let t_valorDer: number = new_temporal();
			c3d += `L${label1}:\n`;
			c3d += `t${t_valorIzq} = heap[(int) t${izq.temporal}];\n`;
			c3d += `t${t_valorDer} = heap[(int) t${der.temporal}];\n`;
			c3d += `if (t${t_valorIzq} ${this.notOperacionToChar()} t${t_valorDer}) goto L${label2};\n`;
			c3d += `if (t${t_valorIzq} != -1) goto L${label3};\n`;
			c3d += `t${izq.temporal} = t${izq.temporal} + 1;\n`;
			c3d += `t${der.temporal} = t${der.temporal} + 1;\n`;
			c3d += `goto L${label1};\n`;
			c3d += `L${label2}:\n`;
			c3d += `t${t_cond} = 1;\n`;
			c3d += `goto L${label4};\n`;
			c3d += `L${label3}:\n`;
			c3d += `t${t_cond} = 0;\n`;
			c3d += `L${label4}:\n`;
			c3d += `if (t${t_cond}) goto L${label_true};\n`;
			c3d += `goto L${label_false};\n`;
		} else if (izq.tipo === tipoDato.CADENA || der.tipo === tipoDato.CADENA)
			return res;
		else if (izq.tipo === -1 || der.tipo === -1) return res;
		else {
			c3d += `if (${izq.temporal} ${this.operacionToChar()} ${
				der.temporal
			}) goto L${label_true};\n`;
			c3d += `goto L${label_false};\n`;
		}

		res.codigo3d = c3d;
		res.etq_verdaderas.push(label_true);
		res.etq_falsas.push(label_false);
		res.tipo = tipoDato.BOOLEANO;
		return res;
	}

	private operacionToChar() {
		let op: string = '';
		switch (this.relacion) {
			case Relacionales.DIFERENTE:
				op = '!=';
				break;
			case Relacionales.IGUAL:
				op = '==';
				break;
			case Relacionales.MAYOR:
				op = '>';
				break;
			case Relacionales.MAYORIGUAL:
				op = '>=';
				break;
			case Relacionales.MENOR:
				op = '<';
				break;
			case Relacionales.MENORIGUAL:
				op = '<=';
				break;
		}
		return op;
	}

	private notOperacionToChar() {
		let op: string = '';
		switch (this.relacion) {
			case Relacionales.DIFERENTE:
				op = '==';
				break;
			case Relacionales.IGUAL:
				op = '!=';
				break;
			case Relacionales.MAYOR:
				op = '<=';
				break;
			case Relacionales.MAYORIGUAL:
				op = '<';
				break;
			case Relacionales.MENOR:
				op = '>=';
				break;
			case Relacionales.MENORIGUAL:
				op = '>';
				break;
		}
		return op;
	}
}

export enum Relacionales {
	IGUAL,
	DIFERENTE,
	MAYOR,
	MENOR,
	MAYORIGUAL,
	MENORIGUAL,
}
