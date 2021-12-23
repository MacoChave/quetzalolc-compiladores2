import obtenerValor from '../../Reportes/cambiarTipo';
import { Codigo3d } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo from '../TS/Tipo';
import Return from './Return';

export default class Funciones extends Instruccion {
	public identificador: String;
	public parametros: any;
	private instrucciones: Instruccion[];
	constructor(
		tipo: Tipo,
		fila: number,
		columna: number,
		identificador: String,
		parametros: any,
		instrucciones: Instruccion[]
	) {
		super(tipo, fila, columna);
		this.identificador = identificador.toLowerCase();
		this.parametros = parametros;
		this.instrucciones = instrucciones;
	}
	public getNodo(): nodoAST {
		let nodo = new nodoAST('FUNCION');
		nodo.agregarHijo(obtenerValor(this.tipoDato.getTipo()) + '');
		nodo.agregarHijo(this.identificador + '');
		nodo.agregarHijo('(');
		let nuevo = null;
		if (this.parametros.length > 0) {
			nuevo = new nodoAST('PARAMETROS');
		}
		for (let param = 0; param < this.parametros.length; param++) {
			if (nuevo == null) break;
			let vari = obtenerValor(this.parametros[param].tipato.getTipo());
			let ide = this.parametros[param].identificador;
			if (vari != null) nuevo.agregarHijo(vari);
			if (ide != null) nuevo.agregarHijo(ide);
			if (param != this.parametros.length - 1) nuevo.agregarHijo(',');
		}
		if (nuevo != null) nodo.agregarHijoAST(nuevo);
		nodo.agregarHijo(')');
		nodo.agregarHijo('{');
		this.instrucciones.forEach((element) => {
			nodo.agregarHijoAST(element.getNodo());
		});
		nodo.agregarHijo('}');
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
		this.instrucciones.forEach((instruccion) => {
			res.codigo3d += instruccion.traducir(arbol, tabla).codigo3d;
		});
		return res;
	}
}
