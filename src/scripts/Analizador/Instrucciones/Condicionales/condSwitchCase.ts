import { Instruccion } from '../../Abstracto/Instruccion';
import nodoAST from '../../Abstracto/nodoAST';
import Errores from '../../Excepciones/Errores';
import { listaErrores } from '../../Excepciones/Listado_Errores';
import Arbol from '../../TS/Arbol';
import tablaSimbolos from '../../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../../TS/Tipo';
import Return from '../Return';

export default class condSwitchCase extends Instruccion {
	private expresion: Instruccion;
	public expresionCase?: Instruccion;
	private instrucciones: Instruccion[];
	constructor(
		fila: number,
		columna: number,
		expresion: Instruccion,
		instrucciones: Instruccion[]
	) {
		super(new Tipo(tipoDato.ENTERO), fila, columna);
		this.expresion = expresion;
		this.instrucciones = instrucciones;
	}
	public getNodo(): nodoAST {
		let nodo = new nodoAST('CASE');
		nodo.agregarHijo('case');
		nodo.agregarHijoAST(this.expresion.getNodo());
		nodo.agregarHijo(':');
		this.instrucciones.forEach((element) => {
			nodo.agregarHijoAST(element.getNodo());
		});
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		let val = this.expresion.interpretar(arbol, tabla);
		let valExpresion = this.expresionCase?.interpretar(arbol, tabla);
		if (
			this.expresion.tipoDato.getTipo() ==
			this.expresionCase?.tipoDato.getTipo()
		) {
			if (val == valExpresion) {
				let nuevaTabla = new tablaSimbolos(tabla);
				nuevaTabla.setNombre('Case');
				for (let i = 0; i < this.instrucciones.length; i++) {
					let a = this.instrucciones[i].interpretar(
						arbol,
						nuevaTabla
					);
					if (a instanceof Errores) {
						listaErrores.push(a);
						arbol.actualizaConsola((<Errores>a).returnError());
					}
					if (a instanceof Return) return a;
					if (a == 'ByLyContinue') return a;
					if (a == 'ByLy23') return a;
				}
			}
		} else {
			return new Errores(
				'SEMANTICO',
				'VARIABLE  TIPOS DE DATOS DIFERENTES',
				this.fila,
				this.columna
			);
		}
	}
}
