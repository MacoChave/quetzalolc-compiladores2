import { Codigo3d } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class Asignacion extends Instruccion {
	private identificador: string;
	private valor: Instruccion;
	constructor(
		identificador: string,
		valor: Instruccion,
		fila: number,
		columna: number
	) {
		super(new Tipo(tipoDato.ENTERO), fila, columna);
		this.identificador = identificador.toLowerCase();
		this.valor = valor;
	}
	public getNodo(): nodoAST {
		let nodo = new nodoAST('ASIGNACION');
		nodo.agregarHijo(this.identificador);
		nodo.agregarHijo('=');
		nodo.agregarHijoAST(this.valor.getNodo());
		nodo.agregarHijo(';');
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		//tomar el tipoDato de la variable
		let variable = tabla.getVariable(this.identificador);
		if (variable != null) {
			let val = this.valor.interpretar(arbol, tabla);
			if (variable.gettipo().getTipo() != this.valor.tipoDato.getTipo()) {
				return new Errores(
					'SEMANTICO',
					'VARIABLE ' +
						this.identificador +
						' TIPOS DE DATOS DIFERENTES',
					this.fila,
					this.columna
				);
			} else {
				variable.setvalor(val);
				arbol.actualizarTabla(
					this.identificador,
					variable.getvalor(),
					this.fila.toString(),
					tabla.getNombre().toString(),
					this.columna.toString()
				);
				//identificadorm,
				//actualizar valor de la tabla y no crear otra equis des
			}
		} else {
			console.log(this.identificador);
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
			etq_falsas: [],
			etq_salida: [],
			etq_verdaderas: [],
			pos: 0,
			temporal: '',
			tipo: -1,
		};
		let variable = tabla.getVariable(this.identificador);
		if (variable === null) return res;

		let valor = this.valor.traducir(arbol, tabla);
		if (
			variable.gettipo().getTipo() === tipoDato.ENTERO &&
			(valor.tipo === tipoDato.ENTERO || valor.tipo === tipoDato.DECIMAL)
		)
			if (variable.gettipo().getTipo() !== valor.tipo) {
				if (
					!(
						variable.gettipo().getTipo() === tipoDato.ENTERO &&
						(valor.tipo === tipoDato.ENTERO ||
							valor.tipo === tipoDato.DECIMAL)
					)
				)
					return res;
			}

		// let temp = new_temporal()
		let c3d = '\t// ==========> ASIGNACION\n';

		c3d += `${valor.codigo3d}\n`;
		c3d += `\tstack[(int) ${variable.posAbsoluta}] = ${valor.temporal};\n`;
		c3d += '\t// ==========> END ASIGNACION\n';

		res.codigo3d = c3d;
		return res;
	}
}
