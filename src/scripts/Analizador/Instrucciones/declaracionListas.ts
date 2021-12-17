import obtenerValor from '../../Reportes/cambiarTipo';
import { reporteTabla } from '../../Reportes/reporteTabla';
import { Codigo3d } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import Simbolo from '../TS/Simbolo';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class declaracionListas extends Instruccion {
	private tipo: Tipo;
	private identificador: string;
	private tipoVector: Tipo | undefined;
	private expresion: Instruccion | undefined;
	constructor(
		tipo: Tipo,
		identificador: string,
		fila: number,
		columna: number,
		tipoVector: Tipo | undefined,
		expresion: Instruccion | undefined
	) {
		super(tipo, fila, columna);
		this.tipo = tipo;
		this.identificador = identificador.toLowerCase();
		this.tipoVector = tipoVector;
		this.expresion = expresion;
	}
	public getNodo() {
		let nodo = new nodoAST('LISTAS');
		nodo.agregarHijo('list');
		nodo.agregarHijo('<');
		nodo.agregarHijo(obtenerValor(this.tipo.getTipo()) + '');
		nodo.agregarHijo('>');
		nodo.agregarHijo(this.identificador);
		nodo.agregarHijo('=');
		nodo.agregarHijo('new');
		nodo.agregarHijo('list');
		nodo.agregarHijo('<');
		nodo.agregarHijo(obtenerValor(this.tipoVector?.getTipo()) + '');
		nodo.agregarHijo('>');
		nodo.agregarHijo(';');
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		if (this.tipoVector != null) {
			if (this.tipo.getTipo() != this.tipoVector.getTipo())
				return new Errores(
					'SEMANTICO',
					'TIPOS DE DATOS DIFERENTES EN DECLARACION',
					this.fila,
					this.columna
				);
			else {
				let arreglo = new Array();
				if (
					tabla.setVariable(
						new Simbolo(this.tipo, this.identificador, arreglo)
					) == 'La variable existe actualmente'
				)
					return new Errores(
						'SEMANTICO',
						'LA VARIABLE ' +
							this.identificador +
							' EXISTE ACTUALMENTE',
						this.fila,
						this.columna
					);
				else {
					if (
						!arbol.actualizarTabla(
							this.identificador,
							arreglo.toString(),
							this.fila.toString(),
							tabla.getNombre().toString(),
							this.columna.toString()
						)
					) {
						let nuevoSimbolo = new reporteTabla(
							this.identificador,
							arreglo.toString(),
							'lista',
							obtenerValor(this.tipo.getTipo()) + '',
							tabla.getNombre(),
							this.fila.toString(),
							this.columna.toString()
						);
						arbol.listaSimbolos.push(nuevoSimbolo);
					}
				}
			}
		} else {
			let exp = this.expresion?.interpretar(arbol, tabla);
			if (exp instanceof Errores) return exp;
			if (this.tipo.getTipo() != this.expresion?.tipoDato.getTipo())
				return new Errores(
					'SEMANTICO',
					'TIPOS DE DATOS DIFERENTES EN DECLARACION',
					this.fila,
					this.columna
				);
			let arreglo = new Array();
			for (let i = 0; i < exp.length; i++) {
				arreglo.push(exp[i]);
			}
			if (
				tabla.setVariable(
					new Simbolo(this.tipo, this.identificador, arreglo)
				) == 'La variable existe actualmente'
			)
				return new Errores(
					'SEMANTICO',
					'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE',
					this.fila,
					this.columna
				);
			else {
				if (
					!arbol.actualizarTabla(
						this.identificador,
						arreglo.toString(),
						this.fila.toString(),
						tabla.getNombre().toString(),
						this.columna.toString()
					)
				) {
					let nuevoSimbolo = new reporteTabla(
						this.identificador,
						arreglo.toString(),
						'lista',
						obtenerValor(this.tipo.getTipo()) + '',
						tabla.getNombre(),
						this.fila.toString(),
						this.columna.toString()
					);
					arbol.listaSimbolos.push(nuevoSimbolo);
				}
			}
		}
	}

	traducir(arbol: Arbol, tabla: tablaSimbolos): Codigo3d {
		throw new Error('Method not implemented.');
	}
}
