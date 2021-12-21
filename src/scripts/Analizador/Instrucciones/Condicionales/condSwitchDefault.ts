import { Codigo3d } from '../../Abstracto/Codigo3d';
import { Instruccion } from '../../Abstracto/Instruccion';
import nodoAST from '../../Abstracto/nodoAST';
import Errores from '../../Excepciones/Errores';
import { listaErrores } from '../../Excepciones/Listado_Errores';
import Arbol from '../../TS/Arbol';
import tablaSimbolos from '../../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../../TS/Tipo';
import Return from '../Return';

export default class condSwitchCase extends Instruccion {
	private instrucciones: Instruccion[];
	constructor(fila: number, columna: number, instrucciones: Instruccion[]) {
		super(new Tipo(tipoDato.ENTERO), fila, columna);
		this.instrucciones = instrucciones;
	}
	public getNodo(): nodoAST {
		let nodo = new nodoAST('DEFAULT');
		nodo.agregarHijo('default');
		nodo.agregarHijo(':');
		this.instrucciones.forEach((element) => {
			nodo.agregarHijoAST(element.getNodo());
		});
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		let nuevaTabla = new tablaSimbolos(tabla);
		nuevaTabla.setNombre('default');
		for (let i = 0; i < this.instrucciones.length; i++) {
			let a = this.instrucciones[i].interpretar(arbol, nuevaTabla);
			if (a instanceof Errores) {
				listaErrores.push(a);
				arbol.actualizaConsola((<Errores>a).returnError());
			}
			if (a instanceof Return) return a;
			if (a == 'ByLyContinue') return a;
			if (a == 'ByLy23') return a;
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
		let c3d = '\t/// ==========> \n';
		c3d = '\t/// ==========> END\n';
		return res;
	}
}
