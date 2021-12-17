//aritmeticas
import { Codigo3d } from '../Abstracto/Codigo3d';
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
		throw new Error('Method not implemented.');
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
