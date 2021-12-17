import { Codigo3d } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class agregarLista extends Instruccion {
	private identificador: string;
	private expresion: Instruccion;

	constructor(
		identificador: string,
		expresion: Instruccion,
		fila: number,
		columna: number
	) {
		super(new Tipo(tipoDato.ENTERO), fila, columna);
		this.identificador = identificador.toLowerCase();
		this.expresion = expresion;
	}
	public getNodo() {
		let nodo = new nodoAST('ADD-LISTA');
		nodo.agregarHijo(this.identificador);
		nodo.agregarHijo('.');
		nodo.agregarHijo('add');
		nodo.agregarHijo('(');
		nodo.agregarHijoAST(this.expresion.getNodo());
		nodo.agregarHijo(')');
		nodo.agregarHijo(';');
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		let ide = tabla.getVariable(this.identificador);
		if (ide != null) {
			let arreglo = ide.getvalor();
			let exp = this.expresion.interpretar(arbol, tabla);
			if (exp instanceof Errores) return exp;
			if (ide.gettipo().getTipo() != this.expresion.tipoDato.getTipo())
				return new Errores(
					'SEMANTICO',
					'VARIABLE ' +
						this.identificador +
						' TIPOS DE DATOS DIFERENTES',
					this.fila,
					this.columna
				);
			arreglo.push(exp);
			ide.setvalor(arreglo);
			arbol.actualizarTabla(
				this.identificador,
				arreglo,
				this.fila.toString(),
				tabla.getNombre().toString(),
				this.columna.toString()
			);
		} else
			return new Errores(
				'SEMANTICO',
				`VARIABLE ${this.identificador} NO EXISTE`,
				this.fila,
				this.columna
			);
	}

	traducir(arbol: Arbol, tabla: tablaSimbolos): Codigo3d {
		throw new Error('Method not implemented.');
	}
}
