import { Codigo3d, new_etiqueta } from '../../Abstracto/Codigo3d';
import { Instruccion } from '../../Abstracto/Instruccion';
import nodoAST from '../../Abstracto/nodoAST';
import Errores from '../../Excepciones/Errores';
import { listaErrores } from '../../Excepciones/Listado_Errores';
import Arbol from '../../TS/Arbol';
import tablaSimbolos from '../../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../../TS/Tipo';
import Return from '../Return';

export default class condIf extends Instruccion {
	private cond1: Instruccion;
	private condIf: Instruccion[];
	private condElse: Instruccion[] | undefined;
	private condElseIf: Instruccion | undefined;
	constructor(
		fila: number,
		columna: number,
		cond1: Instruccion,
		condIf: Instruccion[],
		condElse: Instruccion[] | undefined,
		condElseIf: Instruccion | undefined
	) {
		super(new Tipo(tipoDato.ENTERO), fila, columna);
		this.cond1 = cond1;
		this.condIf = condIf;
		this.condElse = condElse;
		this.condElseIf = condElseIf;
	}
	public getNodo(): nodoAST {
		let nodo = new nodoAST('IF');
		nodo.agregarHijo('if');
		nodo.agregarHijo('(');
		nodo.agregarHijoAST(this.cond1.getNodo());
		nodo.agregarHijo(')');
		nodo.agregarHijo('{');
		this.condIf.forEach((element) => {
			nodo.agregarHijoAST(element.getNodo());
		});
		nodo.agregarHijo('}');
		if (this.condElse != undefined) {
			nodo.agregarHijo('else');
			nodo.agregarHijo('{');
			this.condElse.forEach((element) => {
				nodo.agregarHijoAST(element.getNodo());
			});
			nodo.agregarHijo('}');
		}
		if (this.condElseIf != undefined) {
			nodo.agregarHijo('else');
			nodo.agregarHijo('if');
			nodo.agregarHijo('{');
			nodo.agregarHijoAST(this.condElseIf.getNodo());
			nodo.agregarHijo('}');
		}
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		let val = this.cond1.interpretar(arbol, tabla);
		if (this.cond1.tipoDato.getTipo() != tipoDato.BOOLEANO) {
			return new Errores(
				'SEMANTICO',
				'DATO DEBE SER BOOLEANO',
				this.fila,
				this.columna
			);
		}
		if (val) {
			let nuevaTabla = new tablaSimbolos(tabla);
			nuevaTabla.setNombre('If');
			for (let i = 0; i < this.condIf.length; i++) {
				let a = this.condIf[i].interpretar(arbol, nuevaTabla);
				if (a instanceof Errores) {
					listaErrores.push(a);
					arbol.actualizaConsola((<Errores>a).returnError());
				}
				if (a instanceof Return) return a;
				if (a == 'ByLyContinue') return a;
				if (a == 'ByLy23') return a;
			}
		} else {
			if (this.condElse != undefined) {
				let nuevaTabla = new tablaSimbolos(tabla);
				nuevaTabla.setNombre('else');
				for (let i = 0; i < this.condElse.length; i++) {
					let a = this.condElse[i].interpretar(arbol, nuevaTabla);
					if (a instanceof Errores) {
						listaErrores.push(a);
						arbol.actualizaConsola((<Errores>a).returnError());
					}
					if (a instanceof Return) return a;
					if (a == 'ByLyContinue') return a;
					if (a == 'ByLy23') return a;
				}
			} else if (this.condElseIf != undefined) {
				let b = this.condElseIf.interpretar(arbol, tabla);
				if (b instanceof Errores) return b;
				if (b instanceof Return) return b;
				if (b == 'ByLyContinue') return b;
				if (b == 'ByLy23') return b;
			}
		}

		/*if (!this.cond2) {
      if (val == true) {
        this.condIf.forEach((valor) => {
          let a = valor.interpretar(arbol, tabla);
          if (a instanceof Errores) return a;
        });
      }
    } else {
      if (val == true) {
        this.condIf.forEach((valor) => {
          let a = valor.interpretar(arbol, tabla);
          if (a instanceof Errores) return a;
        });
      } else {
        this.condElse?.forEach((valor) => {
          let a = valor.interpretar(arbol, tabla);
          if (a instanceof Errores) return a;
        });
      }
    }*/
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
		let c3d = '\t// ==========> IF\n';
		let l_exit = new_etiqueta();

		let resCondicion = this.cond1.traducir(arbol, tabla);
		if (resCondicion.tipo === -1) return res;

		c3d += resCondicion.codigo3d;
		resCondicion.etq_verdaderas.forEach((etiqueta) => {
			c3d += `${etiqueta}:\n`;
		});

		let nuevaTabla = new tablaSimbolos(tabla);
		nuevaTabla.setNombre('If');

		c3d += `\t // -> IF\n`;
		this.condIf.forEach((cif) => {
			let c3dIf = cif.traducir(arbol, nuevaTabla).codigo3d;
			c3d += c3dIf;
			// TODO: Evaluar return y continue
		});
		c3d += `\tgoto ${l_exit};\n`;

		resCondicion.etq_falsas.forEach((etiqueta) => {
			c3d += `${etiqueta}:\n`;
		});

		if (this.condElse !== undefined) {
			c3d += `\t // -> ELSE\n`;
			let nuevaTabla = new tablaSimbolos(tabla);
			nuevaTabla.setNombre('else');
			this.condElse.forEach((celse) => {
				let sent = celse.traducir(arbol, nuevaTabla).codigo3d;
				c3d += sent;
				// TODO: Evaluar return y continue
			});
			c3d += `\tgoto ${l_exit};\n`;
			c3d += `${l_exit}: // FIN DE ELSE IF\n`;
		}
		if (this.condElseIf !== undefined) {
			c3d += `\t // -> ELSE IF\n`;
			c3d += this.condElseIf.traducir(arbol, tabla).codigo3d;
			// TODO: Evaluar return y continue
			c3d += `\tgoto ${l_exit};\n`;
		}

		if (this.condElse === undefined) c3d += `${l_exit}:\n`;
		c3d += '\t// ==========> END IF\n';
		res.codigo3d = c3d;
		res.tipo = 0;
		return res;
	}
}
