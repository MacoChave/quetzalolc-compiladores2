import { setValueConsole, setValueResult } from '../../shared';
import { Codigo3d, new_etiqueta, new_temporal } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class Print extends Instruccion {
	private expresion: Instruccion[];
	private isSalto: boolean;

	constructor(
		expresion: Instruccion[],
		isSalto: boolean,
		fila: number,
		columna: number
	) {
		super(new Tipo(tipoDato.CADENA), fila, columna);
		this.expresion = expresion;
		this.isSalto = isSalto;
	}

	public getNodo(): nodoAST {
		let nodo = new nodoAST('IMPRESION');
		nodo.agregarHijo('print');
		nodo.agregarHijo('(');
		nodo.agregarHijoAST(this.expresion[0].getNodo());
		nodo.agregarHijo(')');
		nodo.agregarHijo(';');
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		this.expresion.forEach((expr) => {
			let valor = expr.interpretar(arbol, tabla);
			if (valor instanceof Errores) return valor;
			setValueConsole(valor);
			console.log(valor);
			arbol.actualizaConsola(valor + '');
		});

		if (this.isSalto) setValueConsole('\n');
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
		let c3d: string = '\t// ==========> PRINTN\n';
		this.expresion.forEach((expr) => {
			let valor = expr.traducir(arbol, tabla);
			if (valor.tipo === -1) return;
			c3d += `${valor.codigo3d}\n`;
			c3d += this.getTexto(valor);
		});

		if (this.isSalto) c3d += `\tprintf("%c", (char) 10);\n`;
		c3d += '\t// ==========> END PRINTN\n';
		setValueResult(c3d);

		return res;
	}

	getTexto(valor: Codigo3d): string {
		let c3d: string = '';

		if (valor.tipo === tipoDato.BOOLEANO) {
			c3d += `\tprintf("%i", (int) ${valor.temporal});\n`;
		} else if (valor.tipo === tipoDato.CARACTER) {
			c3d += `\tprintf("%c", (char) ${valor.temporal});\n`;
		} else if (valor.tipo === tipoDato.CADENA) {
			let temp: string = new_temporal();
			let label_inicio: string = new_etiqueta();
			let label_exit: string = new_etiqueta();
			c3d += `${label_inicio}:\n`;
			c3d += `\t${temp} = heap[(int) ${valor.temporal}];\n`;
			c3d += `\tprintf("%c", (char) ${temp});\n`;
			c3d += `\t${valor.temporal} = ${valor.temporal} + 1;\n`;
			c3d += `\t${temp} = heap[(int) ${valor.temporal}];\n`;
			c3d += `\tif (${temp} != -1) goto ${label_inicio};\n`;
			c3d += `\tgoto ${label_exit};\n`;
			c3d += `${label_exit}:\n`;
		} else if (valor.tipo === tipoDato.DECIMAL) {
			c3d += `\tprintf("%f", (float) ${valor.temporal});\n`;
		} else if (valor.tipo === tipoDato.ENTERO) {
			c3d += `\tprintf("%i", (int) ${valor.temporal});\n`;
		}
		return c3d;
	}
}
