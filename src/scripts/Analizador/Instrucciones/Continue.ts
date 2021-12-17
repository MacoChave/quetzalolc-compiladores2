import { Codigo3d } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class Continue extends Instruccion {
	constructor(fila: number, columna: number) {
		super(new Tipo(tipoDato.ENTERO), fila, columna);
	}
	public getNodo(): nodoAST {
		let nodo = new nodoAST('CONTINUE');
		nodo.agregarHijo('continue');
		nodo.agregarHijo(';');
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		return 'ByLyContinue';
	}

	traducir(arbol: Arbol, tabla: tablaSimbolos): Codigo3d {
		throw new Error('Method not implemented.');
	}
}
