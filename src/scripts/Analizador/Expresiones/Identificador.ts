import { Codigo3d, new_temporal } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class Identificador extends Instruccion {
	public identificador: String;
	constructor(identificador: String, fila: number, columna: number) {
		super(new Tipo(tipoDato.ENTERO), fila, columna);
		this.identificador = identificador.toLowerCase();
	}
	public getNodo(): nodoAST {
		let nodo = new nodoAST('IDENTIFICADOR');
		nodo.agregarHijo(this.identificador + '');
		return nodo;
	}

	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		let variable = tabla.getVariable(this.identificador);
		if (variable != null) {
			this.tipoDato = variable.gettipo();
			return variable.getvalor();
		} else {
			return new Errores(
				'SEMANTICO',
				'VARIABLE ' + this.identificador + ' NO EXISTE',
				this.fila,
				this.columna
			);
		}
	}

	traducir(arbol: Arbol, tabla: tablaSimbolos): Codigo3d {
		let res: Codigo3d = {
			codigo3d: '',
			temporal: '0',
			tipo: -1,
			etq_falsas: [],
			etq_verdaderas: [],
			etq_salida: [],
			pos: 0,
		};
		let variable = tabla.getVariable(this.identificador);
		if (variable == null) return res;

		let temp = new_temporal();
		let stack_pos = variable.posAbsoluta;
		res.codigo3d = `\t${temp} = stack[(int) ${stack_pos}];`;
		res.tipo = variable.gettipo().getTipo();
		res.temporal = temp;

		return res;
	}
}
