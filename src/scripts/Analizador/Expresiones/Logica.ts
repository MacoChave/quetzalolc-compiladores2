//relacionales
import { Codigo3d } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class Logica extends Instruccion {
	private cond1: Instruccion | undefined;
	private cond2: Instruccion | undefined;
	private condExcep: Instruccion | undefined;
	private loogica: Logicas;
	constructor(
		relacion: Logicas,
		fila: number,
		columna: number,
		cond1: Instruccion,
		cond2?: Instruccion
	) {
		super(new Tipo(tipoDato.ENTERO), fila, columna);
		this.loogica = relacion;
		if (!cond2) this.condExcep = cond1;
		else {
			this.cond1 = cond1;
			this.cond2 = cond2;
		}
	}

	public getNodo(): nodoAST {
		let nodo = new nodoAST('LOGICO');
		if (this.condExcep != null) {
			nodo.agregarHijo(this.loogica + '', 'log', this.loogica);
			nodo.agregarHijoAST(this.condExcep.getNodo());
		} else {
			nodo.agregarHijoAST(this.cond1?.getNodo());
			nodo.agregarHijo(this.loogica + '', 'log', this.loogica);
			nodo.agregarHijoAST(this.cond2?.getNodo());
		}
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		let izq, der, unico;
		izq = der = unico = null;
		if (this.condExcep != null) {
			unico = this.condExcep.interpretar(arbol, tabla);
			if (unico instanceof Errores) return unico;
		} else {
			izq = this.cond1?.interpretar(arbol, tabla);
			if (izq instanceof Errores) return izq;
			der = this.cond2?.interpretar(arbol, tabla);
			if (der instanceof Errores) return der;
		}
		//inicio comparacion
		switch (this.loogica) {
			case Logicas.AND:
				this.tipoDato.setTipo(tipoDato.BOOLEANO);
				return izq && der ? true : false;
			case Logicas.OR:
				this.tipoDato.setTipo(tipoDato.BOOLEANO);
				return izq || der ? true : false;
			case Logicas.NOT:
				this.tipoDato.setTipo(tipoDato.BOOLEANO);
				return !unico;
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
		let izq = this.cond1?.traducir(arbol, tabla);
		let der = this.cond2?.traducir(arbol, tabla);

		if (izq.tipo === -1 || der.tipo === -1) return res;

		let c3d: string = `${izq.codigo3d}\n`;
		switch (this.loogica) {
			case Logicas.AND:
				izq.etq_verdaderas.forEach((etiqueta, index) => {
					c3d += `L${etiqueta}:\n`;
				});
				res.etq_verdaderas = der?.etq_verdaderas;

				izq?.etq_falsas.forEach((falsa) => res.etq_falsas.push(falsa));
				der?.etq_falsas.forEach((falsa) => res.etq_falsas.push(falsa));

				break;
			case Logicas.OR:
				izq.etq_falsas.forEach((etiqueta, index) => {
					c3d += `L${etiqueta}:\n`;
				});
				izq?.etq_verdaderas.forEach((verdadera) =>
					res.etq_verdaderas.push(verdadera)
				);
				der?.etq_verdaderas.forEach((verdadera) =>
					res.etq_verdaderas.push(verdadera)
				);

				res.etq_falsas = der?.etq_falsas;
				break;
			case Logicas.NOT:
				izq?.etq_falsas.forEach((verdadera) =>
					res.etq_verdaderas.push(verdadera)
				);
				der?.etq_falsas.forEach((verdadera) =>
					res.etq_verdaderas.push(verdadera)
				);

				izq?.etq_verdaderas.forEach((falsa) =>
					res.etq_falsas.push(falsa)
				);
				der?.etq_verdaderas.forEach((falsa) =>
					res.etq_falsas.push(falsa)
				);
				break;
		}
		c3d += `${der.codigo3d}\n`;
		res.codigo3d = c3d;
		res.tipo = tipoDato.BOOLEANO;

		return res;
	}
}

export enum Logicas {
	OR,
	AND,
	NOT,
}
