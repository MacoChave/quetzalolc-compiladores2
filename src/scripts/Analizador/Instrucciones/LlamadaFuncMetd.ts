import obtenerValor from '../../Reportes/cambiarTipo';
import { reporteTabla } from '../../Reportes/reporteTabla';
import { Codigo3d } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';
import Declaracion from './Declaracion';
import declaracionListas from './declaracionListas';
import declaracionVectores from './declaracionVectores';
import Funciones from './Funciones';
import Metodos from './Metodos';

export default class LlamadaFuncMetd extends Instruccion {
	private identificador: String;
	private parametros: Instruccion[];
	constructor(
		identificador: String,
		parametros: Instruccion[],
		fila: number,
		columna: number
	) {
		super(new Tipo(tipoDato.ENTERO), fila, columna);
		this.identificador = identificador.toLowerCase();
		this.parametros = parametros;
	}

	public getNodo(): nodoAST {
		let nodo = new nodoAST('LLAMADA');
		nodo.agregarHijo(this.identificador + '');
		nodo.agregarHijo('(');
		this.parametros.forEach((element) => {
			nodo.agregarHijoAST(element.getNodo());
		});
		nodo.agregarHijo(')');
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		let funcion = arbol.getFuncion(this.identificador);
		if (funcion == null)
			return new Errores(
				'SEMANTICO',
				'NO SE ENCONTRO LA FUNCION',
				this.fila,
				this.columna
			);
		if (funcion instanceof Metodos) {
			let metodo = <Metodos>funcion;
			if (metodo.parametros.length == this.parametros?.length) {
				let nuevaTabla = new tablaSimbolos(arbol.gettablaGlobal());
				for (let param = 0; param < this.parametros.length; param++) {
					let newVal = this.parametros[param].interpretar(
						arbol,
						tabla
					);
					if (newVal instanceof Errores) return newVal;

					let dec;
					if (metodo.parametros[param].arreglo) {
						dec = new declaracionVectores(
							metodo.parametros[param].tipato,
							metodo.parametros[param].identificador,
							false,
							metodo.fila,
							metodo.columna
						);
					} else if (metodo.parametros[param].lista) {
						dec = new declaracionListas(
							metodo.parametros[param].tipato,
							metodo.parametros[param].identificador,
							metodo.fila,
							metodo.columna,
							metodo.parametros[param].tipato,
							undefined
						);
					} else {
						dec = new Declaracion(
							metodo.parametros[param].tipato,
							metodo.fila,
							metodo.columna,
							[metodo.parametros[param].identificador]
						);
					}
					let nuevaDec = dec.interpretar(arbol, nuevaTabla);
					if (nuevaDec instanceof Errores) return nuevaDec;

					let variable = nuevaTabla.getVariable(
						metodo.parametros[param].identificador
					);
					if (variable != null) {
						if (
							variable.gettipo().getTipo() !=
							this.parametros[param].tipoDato.getTipo()
						) {
							return new Errores(
								'SEMANTICO',
								'VARIABLE ' +
									metodo.parametros[param].identificador +
									' TIPOS DE DATOS DIFERENTES',
								this.fila,
								this.columna
							);
						} else {
							variable.setvalor(newVal);
							nuevaTabla.setNombre(metodo.identificador);
							if (
								!arbol.actualizarTabla(
									this.identificador.toString(),
									'',
									this.fila.toString(),
									nuevaTabla.getNombre().toString(),
									this.columna.toString()
								)
							) {
								let nuevoSimbolo = new reporteTabla(
									this.identificador,
									'',
									'Metodo',
									'Void',
									nuevaTabla.getNombre(),
									this.fila.toString(),
									this.columna.toString()
								);
								arbol.listaSimbolos.push(nuevoSimbolo);
							}
						}
					} else {
						return new Errores(
							'SEMANTICO',
							'VARIABLE ' +
								metodo.parametros[param].identificador +
								' NO EXISTE',
							this.fila,
							this.columna
						);
					}
				}
				let nuevMet = metodo.interpretar(arbol, nuevaTabla);
				if (nuevMet instanceof Errores) return nuevMet;
			} else {
				return new Errores(
					'SEMANTICO',
					'PARAMETROS NO COINCIDENTES',
					this.fila,
					this.columna
				);
			}
		} else if (funcion instanceof Funciones) {
			let metodo = <Funciones>funcion;
			if (metodo.parametros.length == this.parametros?.length) {
				let nuevaTabla = new tablaSimbolos(arbol.gettablaGlobal());
				for (let param = 0; param < this.parametros.length; param++) {
					let newVal = this.parametros[param].interpretar(
						arbol,
						tabla
					);
					if (newVal instanceof Errores) return newVal;
					let dec = new Declaracion(
						metodo.parametros[param].tipato,
						metodo.fila,
						metodo.columna,
						[metodo.parametros[param].identificador]
					);
					let nuevaDec = dec.interpretar(arbol, nuevaTabla);
					if (nuevaDec instanceof Errores) return nuevaDec;

					let variable = nuevaTabla.getVariable(
						metodo.parametros[param].identificador
					);
					if (variable != null) {
						if (
							variable.gettipo().getTipo() !=
							this.parametros[param].tipoDato.getTipo()
						) {
							return new Errores(
								'SEMANTICO',
								'VARIABLE ' +
									metodo.parametros[param].identificador +
									' TIPOS DE DATOS DIFERENTES',
								this.fila,
								this.columna
							);
						} else {
							variable.setvalor(newVal);
							nuevaTabla.setNombre(metodo.identificador);
							if (
								!arbol.actualizarTabla(
									metodo.identificador.toString(),
									newVal,
									this.fila.toString(),
									tabla.getNombre().toString(),
									this.columna.toString()
								)
							) {
								let nuevoSimbolo = new reporteTabla(
									metodo.identificador,
									newVal,
									'Funcion',
									obtenerValor(this.tipoDato.getTipo()) + '',
									tabla.getNombre(),
									this.fila.toString(),
									this.columna.toString()
								);
								arbol.listaSimbolos.push(nuevoSimbolo);
							}
							//nueva variable
						}
					} else {
						return new Errores(
							'SEMANTICO',
							'VARIABLE ' +
								metodo.parametros[param].identificador +
								' NO EXISTE',
							this.fila,
							this.columna
						);
					}
				}
				let nuevMet = metodo.interpretar(arbol, nuevaTabla);
				if (nuevMet instanceof Errores) return nuevMet;
				this.tipoDato = metodo.tipoDato;
				return nuevMet;
			} else {
				return new Errores(
					'SEMANTICO',
					'PARAMETROS NO COINCIDENTES',
					this.fila,
					this.columna
				);
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
		let c3d = '';

		res.codigo3d = c3d;
		return res;
	}
}
