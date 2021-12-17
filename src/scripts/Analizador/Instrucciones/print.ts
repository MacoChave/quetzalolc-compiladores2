import { setValueConsole } from '../../shared';
import { Codigo3d } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class Print extends Instruccion {
	private expresion: Instruccion[];
	private isSalto: boolean;

	constructor(
		expresion: Instruccion[],
		isSalto: boolean,
		fila: number,
		columna: number
	) {
		super(new Tipo(tipoDato.CADENA), fila, columna);
		this.expresion = expresion;
		this.isSalto = isSalto;
	}

	public getNodo(): nodoAST {
		let nodo = new nodoAST('IMPRESION');
		nodo.agregarHijo('print');
		nodo.agregarHijo('(');
		nodo.agregarHijoAST(this.expresion[0].getNodo());
		nodo.agregarHijo(')');
		nodo.agregarHijo(';');
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		this.expresion.forEach((expr) => {
			let valor = expr.interpretar(arbol, tabla);
			if (valor instanceof Errores) return valor;
			setValueConsole(valor);
			console.log(valor);
			arbol.actualizaConsola(valor + '');
		});

		if (this.isSalto) setValueConsole('\n');
	}

	traducir(arbol: Arbol, tabla: tablaSimbolos): Codigo3d {
		throw new Error('Method not implemented.');
	}
}
