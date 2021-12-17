import { Codigo3d } from '../../Abstracto/Codigo3d';
import { Instruccion } from '../../Abstracto/Instruccion';
import nodoAST from '../../Abstracto/nodoAST';
import Errores from '../../Excepciones/Errores';
import Arbol from '../../TS/Arbol';
import tablaSimbolos from '../../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../../TS/Tipo';

export default class condIfTernario extends Instruccion {
	private condicion: Instruccion;
	private condIf: Instruccion;
	private condElse: Instruccion;
	constructor(
		cond: Instruccion,
		conIf: Instruccion,
		conElse: Instruccion,
		fila: number,
		columna: number
	) {
		super(new Tipo(tipoDato.ENTERO), fila, columna);
		this.condicion = cond;
		this.condIf = conIf;
		this.condElse = conElse;
	}
	public getNodo(): nodoAST {
		let nodo = new nodoAST('TERNARIO');
		nodo.agregarHijoAST(this.condicion.getNodo());
		nodo.agregarHijo('?');
		nodo.agregarHijoAST(this.condIf.getNodo());
		nodo.agregarHijo(':');
		nodo.agregarHijoAST(this.condElse.getNodo());
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		let val = this.condicion.interpretar(arbol, tabla);
		if (val instanceof Errores) return val;
		if (this.condicion.tipoDato.getTipo() != tipoDato.BOOLEANO) {
			return new Errores(
				'SEMANTICO',
				'DATO DEBE SER BOOLEANO',
				this.fila,
				this.columna
			);
		}
		if (Boolean(val)) {
			let ifc = this.condIf.interpretar(arbol, tabla);
			if (ifc instanceof Errores) return ifc;
			this.tipoDato.setTipo(this.condIf.tipoDato.getTipo());
			return ifc;
		} else {
			let elsec = this.condElse.interpretar(arbol, tabla);
			if (elsec instanceof Errores) return elsec;
			this.tipoDato.setTipo(this.condElse.tipoDato.getTipo());
			return elsec;
		}
	}

	traducir(arbol: Arbol, tabla: tablaSimbolos): Codigo3d {
		throw new Error('Method not implemented.');
	}
}
