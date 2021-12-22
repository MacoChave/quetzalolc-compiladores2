import { Codigo3d, new_etiqueta, new_temporal } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class accesoVector extends Instruccion {
	private identificador: string;
	private expresion: Instruccion;
	constructor(
		identificador: string,
		expresion: Instruccion,
		fila: number,
		columna: number
	) {
		super(new Tipo(tipoDato.ENTERO), fila, columna);
		this.identificador = identificador.toLowerCase();
		this.expresion = expresion;
	}
	public getNodo() {
		let nodo = new nodoAST('ACCESO-VECTOR');
		nodo.agregarHijo(this.identificador);
		nodo.agregarHijo('[');
		nodo.agregarHijoAST(this.expresion.getNodo());
		nodo.agregarHijo(']');
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		let exp = this.expresion.interpretar(arbol, tabla);
		if (exp instanceof Errores) return exp;
		if (this.expresion.tipoDato.getTipo() != tipoDato.ENTERO)
			return new Errores(
				'SEMANTICO',
				'TIPO DE DATO DIFERENTE',
				this.fila,
				this.columna
			);
		let ide = tabla.getVariable(this.identificador);

		if (ide != null) {
			this.tipoDato = new Tipo(ide.gettipo().getTipo());
			return ide.getvalor()[exp];
		}
		return null;
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
		let index = this.expresion.traducir(arbol, tabla);
		if (index.tipo !== tipoDato.ENTERO) return res;

		let variable = tabla.getVariable(this.identificador);
		if (variable === null) return res;

		let c3d = '\t// ==========> ACCESO VECTOR\n';
		c3d += `${index.codigo3d}`;
		let t_pivote = new_temporal();
		let t_size = new_temporal();
		let t_ptr = new_temporal();
		let l_exit = new_etiqueta();

		c3d += `\t${t_pivote} = stack[(int) ${variable.posAbsoluta}];\n`;
		c3d += `\t${t_size} = heap[(int) ${t_pivote}];\n`;
		c3d += `\tif (${index.temporal} > ${t_size}) goto ${l_exit};\n`;
		c3d += `\t${t_pivote} = ${t_pivote} + 1;\n`;
		c3d += `\t${t_pivote} = ${t_pivote} + ${index.temporal};\n`;
		c3d += `\t${t_ptr} = heap[(int) ${t_pivote}];\n`;
		if (variable.gettipo().getTipo() !== tipoDato.CADENA) {
			let t_valor = new_temporal();
			c3d += `\t${t_valor} = heap[(int) ${t_ptr}];\n`;
			res.temporal = t_valor;
		} else {
			res.temporal = t_ptr;
		}
		c3d += `${l_exit}:\n`;
		c3d += '\t// ==========> END ACCESO VECTOR';

		res.codigo3d = c3d;
		res.tipo = variable.gettipo().getTipo();
		return res;
	}
}
