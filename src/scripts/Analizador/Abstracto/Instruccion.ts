import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo from '../TS/Tipo';
import { Codigo3d } from './Codigo3d';
import nodoAST from './nodoAST';
export abstract class Instruccion {
	public tipoDato: Tipo;
	public fila: number;
	public columna: number;
	constructor(tipo: Tipo, fila: number, columna: number) {
		this.tipoDato = tipo;
		this.fila = fila;
		this.columna = columna;
	}

	abstract interpretar(arbol: Arbol, tabla: tablaSimbolos): any;
	abstract getNodo(): nodoAST;
	abstract traducir(arbol: Arbol, tabla: tablaSimbolos): Codigo3d;
}
