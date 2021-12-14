import { listaErrores } from '../../Excepciones/Listado_Errores';
import { Instruccion } from '../../Abstracto/Instruccion';
import nodoAST from '../../Abstracto/nodoAST';
import Errores from '../../Excepciones/Errores';
import Arbol from '../../TS/Arbol';
import tablaSimbolos from '../../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../../TS/Tipo';
import Return from '../Return';

export default class condWhile extends Instruccion {
	private condicion: Instruccion;
	private expresion: Instruccion[];
	constructor(
		condicion: Instruccion,
		expresion: Instruccion[],
		fila: number,
		columna: number
	) {
		super(new Tipo(tipoDato.ENTERO), fila, columna);
		this.condicion = condicion;
		this.expresion = expresion;
	}

	public getNodo(): nodoAST {
		let nodo = new nodoAST('DO_WHILE');
		nodo.agregarHijo('do');
		nodo.agregarHijo('{');
		this.expresion.forEach((element) => {
			nodo.agregarHijoAST(element.getNodo());
		});
		nodo.agregarHijo('(');
		nodo.agregarHijoAST(this.condicion.getNodo());
		nodo.agregarHijo(')');
		nodo.agregarHijo('}');
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		let val = this.condicion.interpretar(arbol, tabla);
		if (val instanceof Errores) return val;
		if (this.condicion.tipoDato.getTipo() != tipoDato.BOOLEANO) {
			return new Errores(
				'SEMANTICO',
				'DATO DEBE SER BOOLEANO',
				this.fila,
				this.columna
			);
		}
		do {
			let nuevaTabla = new tablaSimbolos(tabla);
			nuevaTabla.setNombre('Do_While');
			for (let i = 0; i < this.expresion.length; i++) {
				let a = this.expresion[i].interpretar(arbol, nuevaTabla);
				if (a instanceof Errores) {
					listaErrores.push(a);
					arbol.actualizaConsola((<Errores>a).returnError());
				}
				if (a instanceof Return) return a;
				if (a == 'ByLyContinue') break;
				if (a == 'ByLy23') return;
			}
		} while (this.condicion.interpretar(arbol, tabla));
	}
}
