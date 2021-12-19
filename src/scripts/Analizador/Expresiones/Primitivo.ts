import { Codigo3d, new_temporal } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

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
}
