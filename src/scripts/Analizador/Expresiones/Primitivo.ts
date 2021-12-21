import { Codigo3d, new_etiqueta, new_temporal } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';
import Identificador from './Identificador';

export default class Primitivo extends Instruccion {
	valor: any;
	constructor(tipo: Tipo, valor: any, fila: number, columna: number) {
		super(tipo, fila, columna);
		this.valor = valor;
		if (tipo.getTipo() == tipoDato.CADENA) {
			let val = this.valor.toString();
			this.valor = val
				.replace('\\n', '\n')
				.replace('\\t', '\t')
				.replace('\\r', '\r')
				.replace('\\\\', '\\')
				.replace("\\'", "'")
				.replace('\\"', '"');
		}
	}

	public getNodo(): nodoAST {
		let nodo = new nodoAST('PRIMITIVO');
		nodo.agregarHijo(this.valor + '');
		return nodo;
	}
	interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		if (this.tipoDato.getTipo() == tipoDato.BOOLEANO) {
			return this.valor == 'true' ? true : false;
		}
		if (this.tipoDato.getTipo() == tipoDato.NULO) {
			return null;
		}
		return this.valor;
	}

	traducir(arbol: Arbol, tabla: tablaSimbolos): Codigo3d {
		let res: Codigo3d = {
			codigo3d: '',
			temporal: '',
			tipo: -1,
			etq_falsas: [],
			etq_verdaderas: [],
			etq_salida: [],
			pos: 0,
		};
		res.tipo = this.tipoDato.getTipo();
		if (this.tipoDato.getTipo() === tipoDato.BOOLEANO) {
			res.temporal = this.valor === 'true' ? '1' : '0';
		} else if (
			this.tipoDato.getTipo() === tipoDato.ENTERO ||
			this.tipoDato.getTipo() === tipoDato.DECIMAL
		) {
			res.temporal = `${this.valor}`;
		} else if (this.tipoDato.getTipo() === tipoDato.CARACTER) {
			res.temporal = `${this.valor}`;
		} else if (this.tipoDato.getTipo() === tipoDato.CADENA) {
			/* *********************
			 * VALIDAR SI VIENE $
			 ************************/
			if (this.valor.includes('$')) {
				this.concatStringWithId(arbol, tabla);
			}

			let temp: string = new_temporal();
			let c3d: string = `\t${temp} = H;\n`;
			for (let index = 0; index < this.valor.length; index++) {
				const caracter: string = this.valor.charCodeAt(index);
				c3d += `\theap[(int) H] = ${caracter};\n`;
				c3d += '\tH = H + 1;\n';
			}
			c3d += '\theap[(int) H] = -1;\n';
			c3d += '\tH = H + 1;\n';

			res.temporal = temp;
			res.codigo3d = c3d;
		}
		return res;
	}

	concatStringWithId(arbol: Arbol, tabla: tablaSimbolos) {
		let res: Codigo3d = {
			codigo3d: '',
			etq_falsas: [],
			etq_salida: [],
			etq_verdaderas: [],
			pos: 0,
			temporal: '',
			tipo: -1,
		};
		let resList = [];
		let valorSplitted = this.valor.split('$');
		let c3dAux: string = '';
		let str = valorSplitted[0];
		// TODO: Push str a resList
		for (let index = 1; index < valorSplitted.length; index++) {
			const element = valorSplitted[index];
			if (element.includes(' ')) {
				let i = element.indexOf(' ');
				let id = new Identificador(
					element.slice(0, i),
					this.fila,
					this.columna
				);
				let result = id.traducir(arbol, tabla);

				if (result.tipo === tipoDato.BOOLEANO) {
					let c3dAux: string = '';
					let t_inicio = new_temporal();
					let t_data = new_temporal();
					let l_true = new_etiqueta();
					let l_false = new_etiqueta();
					let l_exit = new_etiqueta();
					c3dAux += result.codigo3d;
					c3dAux += `\t${t_inicio} = H;\n`;
					c3dAux += `\t${t_data} = ${result.temporal};\n`;
					c3dAux += `\tif (${t_data}) goto ${l_true};\n`;
					c3dAux += `\tgoto ${l_false};\n`;
					c3dAux += `${l_true}:\n`;
					c3dAux += `\theap[(int) H] = 116;\n`; // t
					c3dAux += `\tH = H + 1;\n`;
					c3dAux += `\theap[(int) H] = 114;\n`; // r
					c3dAux += `\tH = H + 1;\n`;
					c3dAux += `\theap[(int) H] = 117;\n`; // u
					c3dAux += `\tH = H + 1;\n`;
					c3dAux += `\theap[(int) H] = 101;\n`; // e
					c3dAux += `\tH = H + 1;\n`;
					c3dAux += `\tgoto ${l_exit};\n`;
					c3dAux += `${l_false}:\n`;
					c3dAux += `\theap[(int) H] = 102;\n`; // f
					c3dAux += `\tH = H + 1;\n`;
					c3dAux += `\theap[(int) H] = 97;\n`; // a
					c3dAux += `\tH = H + 1;\n`;
					c3dAux += `\theap[(int) H] = 108;\n`; // l
					c3dAux += `\tH = H + 1;\n`;
					c3dAux += `\theap[(int) H] = 115;\n`; // s
					c3dAux += `\tH = H + 1;\n`;
					c3dAux += `\theap[(int) H] = 101;\n`; // e
					c3dAux += `\tH = H + 1;\n`;
					c3dAux += `${l_exit}:\n`;

					resList.push({ c3d: c3dAux, temp: t_inicio });
				} else if (result.tipo === tipoDato.CADENA) {
					let c3dAux: string = '';
					let t_inicio = new_temporal();

					resList.push({ c3d: c3dAux, temp: t_inicio });
				} else if (result.tipo === tipoDato.CARACTER) {
					let c3dAux: string = '';
					let t_inicio = new_temporal();
					let t_data = new_temporal();

					c3dAux += `${t_data} = ${result.temporal};\n`;

					resList.push({ c3d: c3dAux, temp: t_data });
				} else if (result.tipo === tipoDato.DECIMAL) {
					let c3dAux: string = '';
					let t_inicio = new_temporal();

					resList.push({ c3d: c3dAux, temp: t_inicio });
				} else if (result.tipo === tipoDato.ENTERO) {
					let c3dAux: string = '';
					let t_inicio = new_temporal();

					resList.push({ c3d: c3dAux, temp: t_inicio });
				}

				let str = element.slice(i, element.length);
				// TODO: Push str a resList
			} else {
				let id = new Identificador(element, this.fila, this.columna);
				let result = id.traducir(arbol, tabla);

				if (result.tipo === tipoDato.BOOLEANO) {
					c3dAux += result.codigo3d;
					c3dAux += `\theap[(int) H] = ${result.temporal};\n`;
				} else if (result.tipo === tipoDato.CADENA) {
				} else if (result.tipo === tipoDato.CARACTER) {
				} else if (result.tipo === tipoDato.DECIMAL) {
				} else if (result.tipo === tipoDato.ENTERO) {
				}
			}
		}
		let c3d: string = '';
		// CONCATENAR STRING
		// let temp = new_temporal();
		// c3d += `\t${temp} = H;\n`;
	}

	concatStringWithIdFromInterprete(arbol: Arbol, tabla: tablaSimbolos) {
		let res = '';
		let valorSplitted = this.valor.split('$');
		let str = valorSplitted[0];
		res += str;
		for (let index = 1; index < valorSplitted.length; index++) {
			const element = valorSplitted[index];
			if (element.includes(' ')) {
				let i = element.indexOf(' ');
				let id = new Identificador(
					element.slice(0, i),
					this.fila,
					this.columna
				);
				let result = id.interpretar(arbol, tabla);
				res += String(result);
			} else {
				let id = new Identificador(element, this.fila, this.columna);
				let result = id.traducir(arbol, tabla);

				res += String(result);
			}
		}
		return res;
	}
}
