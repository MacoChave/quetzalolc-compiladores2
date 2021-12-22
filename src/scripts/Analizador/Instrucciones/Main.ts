import obtenerValor from '../../Reportes/cambiarTipo';
import { Codigo3d } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo from '../TS/Tipo';
import Return from './Return';

export default class Main extends Instruccion {
	private instrucciones: Instruccion[];
	constructor(
		tipo: Tipo,
		fila: number,
		columna: number,
		instrucciones: Instruccion[]
	) {
		super(tipo, fila, columna);
		this.instrucciones = instrucciones;
	}
	public getNodo(): nodoAST {
		let nodo = new nodoAST('MAIN');
		let instrucciones = new nodoAST('INSTRUCCIONES');
		this.instrucciones.forEach((element) => {
			nodo.agregarHijoAST(element.getNodo());
		});
		nodo.agregarHijoAST(instrucciones);
		/*nodo.agregarHijo(obtenerValor(this.tipoDato.getTipo()) + '');
		nodo.agregarHijo('(');
		nodo.agregarHijo(')');
		nodo.agregarHijo('{');
		this.instrucciones.forEach((element) => {
			nodo.agregarHijoAST(element.getNodo());
		});
		nodo.agregarHijo('}');*/
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		for (let i = 0; i < this.instrucciones.length; i++) {
			let val = this.instrucciones[i].interpretar(arbol, tabla);
			if (val instanceof Errores) return val;
			if (val instanceof Return) {
				if (val.valor != null) {
					if (this.tipoDato.getTipo() == val.tipoDato.getTipo())
						return val.valor;
					else
						return new Errores(
							'SEMANTICO',
							'TIPOS DE DATOS DIFERENTES',
							this.fila,
							this.columna
						);
				} else {
					return new Errores(
						'SEMANTICO',
						'DEBE DEVOLVER UN VALOR EN LA FUNCION',
						this.fila,
						this.columna
					);
				}
			}
		}
	}

	traducir(arbol: Arbol, tabla: tablaSimbolos): Codigo3d {
		let res: Codigo3d = {
			codigo3d: '',
			etq_falsas: [],
			etq_salida: [],
			etq_verdaderas: [],
			pos: 0,
			temporal: '',
			tipo: -1,
		};
		let c3d: string = '';

		this.instrucciones.forEach((instruccion) => {
			let instValue = instruccion.traducir(arbol, tabla);
			c3d += instValue.codigo3d;
		});
		res.codigo3d = c3d;
		return res;
	}
}
