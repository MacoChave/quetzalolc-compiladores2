import obtenerValor from '../../Reportes/cambiarTipo';
import { reporteTabla } from '../../Reportes/reporteTabla';
import { Codigo3d, new_etiqueta, new_temporal } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import Simbolo from '../TS/Simbolo';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class declaracionVectores extends Instruccion {
	private tipo: Tipo;
	private identificador: string;
	private tipoDeclaracion: boolean; //true tipo 1 false tipo 2
	private cantidad?: Instruccion;
	private tipoVector?: Tipo;
	private listaValores?: Instruccion[];

	constructor(
		tipo: Tipo,
		identificador: string,
		tipoDeclaracion: boolean,
		fila: number,
		columna: number,
		cantidad?: Instruccion,
		tipoVector?: Tipo,
		listaValores?: Instruccion[]
	) {
		super(tipo, fila, columna);
		this.tipo = tipo;
		this.identificador = identificador;
		this.tipoDeclaracion = tipoDeclaracion;
		this.cantidad = cantidad;
		this.tipoVector = tipoVector;
		this.listaValores = listaValores;
	}
	public getNodo() {
		let nodo = new nodoAST('VECTORES');
		nodo.agregarHijo(obtenerValor(this.tipo.getTipo()) + '');
		nodo.agregarHijo('[');
		nodo.agregarHijo(']');
		nodo.agregarHijo(this.identificador);
		nodo.agregarHijo('=');
		if (this.tipoDeclaracion) {
			nodo.agregarHijo('[');
			nodo.agregarHijoAST(this.cantidad?.getNodo());
			nodo.agregarHijo(']');
		} else {
			nodo.agregarHijo('{');
			this.listaValores?.forEach((res) => {
				nodo.agregarHijoAST(res.getNodo());
				nodo.agregarHijo(',');
			});
			nodo.agregarHijo('}');
		}
		nodo.agregarHijo(';');
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		if (this.tipoDeclaracion) {
			if (this.tipoVector == null)
				return new Errores(
					'SINTACTICO',
					'NO EXISTE TIPO DE DATO DE VECTOR',
					this.fila,
					this.columna
				);
			if (this.tipo.getTipo() != this.tipoVector?.getTipo())
				return new Errores(
					'SEMANTICO',
					'TIPOS DE DATOS DIFERENTES EN DECLARACION',
					this.fila,
					this.columna
				);
			else {
				let numero = this.cantidad?.interpretar(arbol, tabla);
				if (numero instanceof Errores) return numero;
				if (this.cantidad?.tipoDato.getTipo() != tipoDato.ENTERO)
					return new Errores(
						'SEMANTICO',
						'VARIABLE NO ES TIPO ENTERO',
						this.fila,
						this.columna
					);
				let num = parseInt(numero);
				let arreglo: any = [];
				for (let i = 0; i < num; i++) {
					arreglo[i] = [];
				}
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
							arreglo,
							this.fila.toString(),
							tabla.getNombre().toString(),
							this.columna.toString()
						)
					) {
						let nuevoSimbolo = new reporteTabla(
							this.identificador,
							arreglo,
							'vector',
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
			let arreglo: any = [];
			if (this.listaValores == null) this.listaValores = [];
			for (let i = 0; i < this.listaValores.length; i++) {
				let valor = this.listaValores[i].interpretar(arbol, tabla);
				if (valor instanceof Errores) return valor;
				if (
					this.tipo.getTipo() !=
					this.listaValores[i].tipoDato.getTipo()
				)
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO DIFERENTE',
						this.fila,
						this.columna
					);
				arreglo[i] = valor;
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
						arreglo,
						this.fila.toString(),
						tabla.getNombre().toString(),
						this.columna.toString()
					)
				) {
					let nuevoSimbolo = new reporteTabla(
						this.identificador,
						arreglo,
						'vector',
						obtenerValor(this.tipo.getTipo()) + '',
						tabla.getNombre(),
						this.fila.toString(),
						this.columna.toString()
					);
					arbol.listaSimbolos.push(nuevoSimbolo);
				}
			}
			//declaracion tipo 2
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
		let c3d = '\t// ==========> DECLARACION VECTOR\n';

		if (this.tipoDeclaracion) return res;
		else {
			let valores: Codigo3d[] = [];
			// Traducir valores
			this.listaValores?.forEach((valor) => {
				let resValor = valor.traducir(arbol, tabla);
				if (resValor.tipo !== -1) valores.push(resValor);
			});

			// TODO: Guardar en stack al final
			// Guardar en stack
			let simbolo = new Simbolo(this.tipo, this.identificador);
			simbolo.length = this.listaValores?.length
				? this.listaValores.length
				: 0;
			let posAbsoluta = tabla.setVariable3d(simbolo);
			if (posAbsoluta < 0) return res;

			// Obtener tamaño y valores por defecto
			let arrLenght = this.listaValores?.length
				? this.listaValores?.length
				: 10;
			let defaultValueItem = getDefaultValueByDataType(
				this.tipo.getTipo()
			);

			// Agregar c3d de valores
			valores.forEach((valor) => {
				c3d += `${valor.codigo3d}\n`;
			});

			let t_pivote: string = new_temporal(); // Pivote de arreglo
			let t_item: string = new_temporal(); // Pivote de items
			c3d += `\t${t_pivote} = H;\n`;
			c3d += `\theap[(int) H] = ${arrLenght};\n`;
			c3d += `\tH = H + ${arrLenght + 1};\n`;
			c3d += `\t${t_item} = ${t_pivote} + 1;\n`;
			valores.forEach((valor) => {
				if (this.tipo.getTipo() === tipoDato.CADENA) {
					let label: string = new_etiqueta();
					let t_index: string = new_temporal();
					let t_char: string = new_temporal();
					c3d += `\t${t_index} = H;\n`;
					c3d += `${label}:\n`;
					c3d += `\t${t_char} = heap[(int) ${valor.temporal}];\n`;
					c3d += `\theap[(int) H] = ${t_char};\n`;
					c3d += `\tH = H + 1;\n`;
					c3d += `\t${valor.temporal} = ${valor.temporal} + 1;\n`;
					c3d += `\t${t_char} = heap[(int) ${valor.temporal}];\n`;
					c3d += `\tif (${t_char} != -1) goto ${label};\n`;
					c3d += `\theap[(int) H] = -1;\n`;
					c3d += `\tH = H + 1;\n`;
					c3d += `\theap[(int) ${t_item}] = ${t_index};\n`;
					c3d += `\t${t_item} = ${t_item} + 1;\n`;
				} else {
					let t_index: string = new_temporal();
					let t_char: string = new_temporal();
					c3d += `\t${t_index} = H;\n`;
					c3d += `\t${t_char} = ${valor.temporal};\n`;
					c3d += `\theap[(int) H] = ${t_char};\n`;
					c3d += `\tH = H + 1;\n`;
					c3d += `\theap[(int) ${t_item}] = ${t_index};\n`;
					c3d += `\t${t_item} = ${t_item} + 1;\n`;
				}
			});
			c3d += `\tstack[(int) ${posAbsoluta}] = ${t_pivote};\n`;
		}

		c3d += '\t// ==========> END DECLARACION VECTOR\n';
		res.codigo3d = c3d;
		return res;
	}
}

const getDefaultValueByDataType = (tipo: tipoDato): string => {
	switch (tipo) {
		case tipoDato.BOOLEANO:
			return '0';
		case tipoDato.CADENA:
			return '-1';
		case tipoDato.CARACTER:
			return '';
		case tipoDato.DECIMAL:
			return '0.0';
		case tipoDato.ENTERO:
			return '0';
		default:
			return '0.0';
	}
};
