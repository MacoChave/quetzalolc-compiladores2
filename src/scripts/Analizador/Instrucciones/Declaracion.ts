import { reporteTabla } from '../../Reportes/reporteTabla';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import Simbolo from '../TS/Simbolo';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';
import obtenerValor from '../../Reportes/cambiarTipo';
import { Codigo3d, new_stackPos } from '../Abstracto/Codigo3d';
export default class Declaracion extends Instruccion {
	private tipo: Tipo;
	private identificador: string;
	private valor: Instruccion | undefined;
	constructor(
		tipo: Tipo,
		fila: number,
		columna: number,
		id: string,
		valor?: Instruccion
	) {
		super(tipo, fila, columna);
		this.tipo = tipo;
		this.identificador = id;
		this.valor = valor;
	}
	public getNodo(): nodoAST {
		let nodo = new nodoAST('DECLARACION');
		nodo.agregarHijo(obtenerValor(this.tipo.getTipo()) + '');
		nodo.agregarHijo(this.identificador);
		if (this.valor != undefined) {
			nodo.agregarHijo('=');
			nodo.agregarHijoAST(this.valor.getNodo());
		}
		nodo.agregarHijo(';');
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		if (this.valor === undefined) {
			switch (this.tipo.getTipo()) {
				case tipoDato.ENTERO:
					if (
						tabla.setVariable(
							new Simbolo(this.tipo, this.identificador, 0)
						) == 'La variable existe actualmente'
					) {
						return new Errores(
							'SEMANTICO',
							'LA VARIABLE ' +
								this.identificador +
								' EXISTE ACTUALMENTE',
							this.fila,
							this.columna
						);
					} else {
						if (
							!arbol.actualizarTabla(
								this.identificador,
								'0',
								this.fila.toString(),
								tabla.getNombre().toString(),
								this.columna.toString()
							)
						) {
							let nuevoSimbolo = new reporteTabla(
								this.identificador,
								'0',
								'Variable',
								obtenerValor(this.tipo.getTipo()) + '',
								tabla.getNombre(),
								this.fila.toString(),
								this.columna.toString()
							);
							arbol.listaSimbolos.push(nuevoSimbolo);
						}
					}
					break;
				case tipoDato.DECIMAL:
					if (
						tabla.setVariable(
							new Simbolo(this.tipo, this.identificador, 0.0)
						) == 'La variable existe actualmente'
					) {
						return new Errores(
							'SEMANTICO',
							'LA VARIABLE ' +
								this.identificador +
								' EXISTE ACTUALMENTE',
							this.fila,
							this.columna
						);
					} else {
						if (
							!arbol.actualizarTabla(
								this.identificador,
								'0.0',
								this.fila.toString(),
								tabla.getNombre().toString(),
								this.columna.toString()
							)
						) {
							let nuevoSimbolo = new reporteTabla(
								this.identificador,
								'0.0',
								'Variable',
								obtenerValor(this.tipo.getTipo()) + '',
								tabla.getNombre(),
								this.fila.toString(),
								this.columna.toString()
							);
							arbol.listaSimbolos.push(nuevoSimbolo);
						}
					}
					break;
				case tipoDato.CARACTER:
					if (
						tabla.setVariable(
							new Simbolo(this.tipo, this.identificador, '\u0000')
						) == 'La variable existe actualmente'
					) {
						return new Errores(
							'SEMANTICO',
							'LA VARIABLE ' +
								this.identificador +
								' EXISTE ACTUALMENTE',
							this.fila,
							this.columna
						);
					} else {
						if (
							!arbol.actualizarTabla(
								this.identificador,
								'\u0000',
								this.fila.toString(),
								tabla.getNombre().toString(),
								this.columna.toString()
							)
						) {
							let nuevoSimbolo = new reporteTabla(
								this.identificador,
								'\u0000',
								'Variable',
								obtenerValor(this.tipo.getTipo()) + '',
								tabla.getNombre(),
								this.fila.toString(),
								this.columna.toString()
							);
							arbol.listaSimbolos.push(nuevoSimbolo);
						}
					}
					break;
				case tipoDato.CADENA:
					if (
						tabla.setVariable(
							new Simbolo(this.tipo, this.identificador, '')
						) == 'La variable existe actualmente'
					) {
						return new Errores(
							'SEMANTICO',
							'LA VARIABLE ' +
								this.identificador +
								' EXISTE ACTUALMENTE',
							this.fila,
							this.columna
						);
					} else {
						if (
							!arbol.actualizarTabla(
								this.identificador,
								'',
								this.fila.toString(),
								tabla.getNombre().toString(),
								this.columna.toString()
							)
						) {
							let nuevoSimbolo = new reporteTabla(
								this.identificador,
								'',
								'Variable',
								obtenerValor(this.tipo.getTipo()) + '',
								tabla.getNombre(),
								this.fila.toString(),
								this.columna.toString()
							);
							arbol.listaSimbolos.push(nuevoSimbolo);
						}
					}
					break;
				case tipoDato.BOOLEANO:
					if (
						tabla.setVariable(
							new Simbolo(this.tipo, this.identificador, true)
						) == 'La variable existe actualmente'
					) {
						return new Errores(
							'SEMANTICO',
							'LA VARIABLE ' +
								this.identificador +
								' EXISTE ACTUALMENTE',
							this.fila,
							this.columna
						);
					} else {
						if (
							!arbol.actualizarTabla(
								this.identificador,
								'true',
								this.fila.toString(),
								tabla.getNombre().toString(),
								this.columna.toString()
							)
						) {
							let nuevoSimbolo = new reporteTabla(
								this.identificador,
								'true',
								'Variable',
								obtenerValor(this.tipo.getTipo()) + '',
								tabla.getNombre(),
								this.fila.toString(),
								this.columna.toString()
							);
							arbol.listaSimbolos.push(nuevoSimbolo);
						}
					}
					break;
			}
		} else {
			let val = this.valor.interpretar(arbol, tabla);
			if (this.tipo.getTipo() != this.valor.tipoDato.getTipo()) {
				return new Errores(
					'SEMANTICO',
					'TIPO DE VALOR DIFERENTE',
					this.fila,
					this.columna
				);
			} else {
				if (
					tabla.setVariable(
						new Simbolo(this.tipo, this.identificador, val)
					) == 'La variable existe actualmente'
				) {
					return new Errores(
						'SEMANTICO',
						'LA VARIABLE ' +
							this.identificador +
							' EXISTE ACTUALMENTE',
						this.fila,
						this.columna
					);
				} else {
					if (
						!arbol.actualizarTabla(
							this.identificador,
							val,
							this.fila.toString(),
							tabla.getNombre().toString(),
							this.columna.toString()
						)
					) {
						let nuevoSimbolo = new reporteTabla(
							this.identificador,
							val,
							'Variable',
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
		let c3d: string = '\t// ==========> DECLARACION\n';
		if (this.valor === undefined) {
			// SIN INICIALIZAR
			if (this.tipo.getTipo() === tipoDato.ENTERO) {
				let simbolo = new Simbolo(
					new Tipo(tipoDato.ENTERO),
					this.identificador
				);
				let posRelativa = tabla.setVariable3d(simbolo);
				if (posRelativa < 0) return res;

				c3d = `\tstack[(int) ${posRelativa}] = 0;\n`;
			} else if (this.tipo.getTipo() === tipoDato.DECIMAL) {
				let simbolo = new Simbolo(
					new Tipo(tipoDato.DECIMAL),
					this.identificador
				);
				let posRelativa = tabla.setVariable3d(simbolo);
				if (posRelativa < 0) return res;

				c3d = `\tstack[(int) ${posRelativa}] = 0.0;\n`;
			} else if (this.tipo.getTipo() === tipoDato.CARACTER) {
				let simbolo = new Simbolo(
					new Tipo(tipoDato.CARACTER),
					this.identificador
				);
				let posRelativa = tabla.setVariable3d(simbolo);
				if (posRelativa < 0) return res;

				c3d = `\tstack[(int) ${posRelativa}] = '';\n`;
			} else if (this.tipo.getTipo() === tipoDato.CADENA) {
				let simbolo = new Simbolo(
					new Tipo(tipoDato.CADENA),
					this.identificador
				);
				let posRelativa = tabla.setVariable3d(simbolo);
				if (posRelativa < 0) return res;

				c3d = `\tstack[(int) ${posRelativa}] = -1;\n`;
			} else if (this.tipo.getTipo() === tipoDato.BOOLEANO) {
				let simbolo = new Simbolo(
					new Tipo(tipoDato.BOOLEANO),
					this.identificador
				);
				let posRelativa = tabla.setVariable3d(simbolo);
				if (posRelativa < 0) return res;

				c3d = `\tstack[(int) ${posRelativa}] = 0;\n`;
			}
		} else {
			// INICIALIZADO
			let valor: Codigo3d = this.valor.traducir(arbol, tabla);
			if (valor.tipo === -1) return res;

			c3d += `${valor.codigo3d}\n`;
			let simbolo = new Simbolo(
				new Tipo(valor.tipo),
				this.identificador,
				''
			);
			let posRelativa = tabla.setVariable3d(simbolo);

			if (posRelativa < 0) return res;

			c3d += `\tstack[(int) ${posRelativa}] = ${valor.temporal};\n`;
		}
		c3d += '\t// ==========> END DECLARACION\n';
		res.codigo3d = c3d;
		return res;
	}
}
