import { listaErrores } from '../../Excepciones/Listado_Errores';
import { Instruccion } from '../../Abstracto/Instruccion';
import nodoAST from '../../Abstracto/nodoAST';
import Errores from '../../Excepciones/Errores';
import Arbol from '../../TS/Arbol';
import tablaSimbolos from '../../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../../TS/Tipo';
import Return from '../Return';
import { Codigo3d, new_etiqueta } from '../../Abstracto/Codigo3d';

export default class condWhile extends Instruccion {
	private condicion: Instruccion;
	private expresion: Instruccion[];
	constructor(
		condicion: Instruccion,
		expresion: Instruccion[],
		fila: number,
		columna: number
	) {
		super(new Tipo(tipoDato.ENTERO), fila, columna);
		this.condicion = condicion;
		this.expresion = expresion;
	}

	public getNodo(): nodoAST {
		let nodo = new nodoAST('DO_WHILE');
		nodo.agregarHijo('do');
		nodo.agregarHijo('{');
		this.expresion.forEach((element) => {
			nodo.agregarHijoAST(element.getNodo());
		});
		nodo.agregarHijo('(');
		nodo.agregarHijoAST(this.condicion.getNodo());
		nodo.agregarHijo(')');
		nodo.agregarHijo('}');
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
		do {
			let nuevaTabla = new tablaSimbolos(tabla);
			nuevaTabla.setNombre('Do_While');
			for (let i = 0; i < this.expresion.length; i++) {
				let a = this.expresion[i].interpretar(arbol, nuevaTabla);
				if (a instanceof Errores) {
					listaErrores.push(a);
					arbol.actualizaConsola((<Errores>a).returnError());
				}
				if (a instanceof Return) return a;
				if (a == 'ByLyContinue') break;
				if (a == 'ByLy23') return;
			}
		} while (this.condicion.interpretar(arbol, tabla));
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
		let newTabla = new tablaSimbolos(tabla);
		newTabla.setNombre('Do While');
		let condicion: Codigo3d = this.condicion.traducir(arbol, newTabla);
		if (condicion.tipo !== tipoDato.BOOLEANO) return res;

		let l_exit: string = new_etiqueta();
		let localSt: string | null = localStorage.getItem('l_exit');
		let l_exitArr = localSt ? JSON.parse(localSt) : [];
		l_exitArr.push(l_exit);
		localStorage.setItem('l_exit', JSON.stringify(l_exitArr));

		let c3d = '\t// ==========> DO WHILE\n';
		condicion.etq_verdaderas.forEach((element) => {
			c3d += `${element}:\n`;
		});

		this.expresion.forEach((element) => {
			c3d += element.traducir(arbol, newTabla).codigo3d;
		});

		condicion.etq_falsas.forEach((element) => {
			c3d += `${element}:\n`;
		});
		c3d += `${l_exit}:\n`;
		c3d += '\t// ==========> END DO WHILE\n';

		l_exitArr.pop();
		localStorage.setItem('l_exit', JSON.stringify(l_exitArr));
		res.codigo3d = c3d;
		return res;
	}
}
