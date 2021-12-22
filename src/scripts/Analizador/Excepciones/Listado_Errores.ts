import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Asignacion from '../Instrucciones/Asignacion';
import Declaracion from '../Instrucciones/Declaracion';
import declaracionVectores from '../Instrucciones/declaracionVectores';
import declaracionListas from '../Instrucciones/declaracionListas';
import Exec from '../Instrucciones/Exec';
import Funciones from '../Instrucciones/Funciones';
import Metodos from '../Instrucciones/Metodos';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import graficarArbol from '../../Reportes/graficar';
import asignacionVector from '../Instrucciones/asignacionVector';
import asignacionLista from '../Instrucciones/asignacionLista';
import agregarLista from '../Instrucciones/agregarLista';
import {
	addHeaderResult,
	clearValueResult,
	setValueConsole,
	setValueResult,
} from '../../shared';

export let listaErrores: Array<Errores>;
let arbolNuevo: Arbol;
//tablas arboles y excepcciones

export class Listado_Errores {
	private _ast: Arbol;
	private tabla: tablaSimbolos;

	constructor() {
		this.ast = new Arbol([]);
		this.tabla = new tablaSimbolos();
	}

	public get ast(): Arbol {
		return this._ast;
	}
	public set ast(value: Arbol) {
		this._ast = value;
		this._ast.settablaGlobal(this.tabla);
	}

	public interpretar() {
		listaErrores = new Array<Errores>();
		// let parser = require('../analizador');

		try {
			// let ast = new Arbol(parser.parse(entrada));

			var tabla = new tablaSimbolos();
			ast.settablaGlobal(tabla);
			for (let i of ast.getinstrucciones()) {
				if (i instanceof Metodos || i instanceof Funciones) {
					ast.getfunciones().push(i);
				}
			}

			for (let i of ast.getinstrucciones()) {
				if (i instanceof Errores) {
					listaErrores.push(i);
					ast.actualizaConsola((<Errores>i).returnError());
				}
				if (
					i instanceof Metodos ||
					i instanceof Funciones ||
					i instanceof Exec
				)
					continue;
				if (
					i instanceof Declaracion ||
					i instanceof Asignacion ||
					i instanceof declaracionVectores ||
					i instanceof declaracionListas ||
					i instanceof asignacionVector ||
					i instanceof asignacionLista ||
					i instanceof agregarLista
				) {
					var resultador = i.interpretar(ast, tabla);
					if (resultador instanceof Errores) {
						listaErrores.push(resultador);
						ast.actualizaConsola(
							(<Errores>resultador).returnError()
						);
					}
				} else {
					let error = new Errores(
						'SEMANTICO',
						'SENTENCIA FUERA DE METODO',
						i.fila,
						i.columna
					);
					listaErrores.push(error);
					ast.actualizaConsola((<Errores>error).returnError());
				}
			}
			for (let i of ast.getinstrucciones()) {
				if (i instanceof Exec) {
					var resultador = i.interpretar(ast, tabla);
					if (resultador instanceof Errores) {
						listaErrores.push(resultador);
						ast.actualizaConsola(
							(<Errores>resultador).returnError()
						);
					}
				}
			}
			arbolNuevo = ast;
			/*res.send({
          resultado: ast.getconsola(),
          errores: listaErrores,
          tabla: ast.getSimbolos(),
        });*/
		} catch (err) {
			/*res.json({ error: err, errores: listaErrores });*/
		}
	}

	public traducir() {
		let globales: string = this.traducirGlobales();
		this.traducirFunciones();
		this.traducirMetodos();
		this.traducirPrincipal(globales);
		addHeaderResult();
	}

	traducirFunciones() {
		let instrucciones = this._ast
			.getinstrucciones()
			.filter((instruccion) => instruccion instanceof Funciones);
		instrucciones.forEach((instruccion) => {
			setValueResult(`\nvoid ${instruccion.identificador} () {\n`);
			let result = instruccion.traducir(this._ast, this.tabla).codigo3d;
			setValueResult(result);
			setValueResult('}\n');
		});
	}
	traducirMetodos() {
		let instrucciones = this._ast
			.getinstrucciones()
			.filter(
				(instruccion) =>
					instruccion instanceof Metodos &&
					instruccion.identificador !== 'main'
			);
		instrucciones.forEach((instruccion) => {
			setValueResult(`\nvoid ${instruccion.identificador} () {\n`);
			let result = instruccion.traducir(this._ast, this.tabla).codigo3d;
			setValueResult(result);
			setValueResult('}\n');
		});
	}
	traducirGlobales(): string {
		let result: string = '';
		let instrucciones = this._ast
			.getinstrucciones()
			.filter(
				(instruccion) =>
					instruccion instanceof Declaracion ||
					instruccion instanceof Asignacion ||
					instruccion instanceof declaracionVectores ||
					instruccion instanceof declaracionListas
			);
		instrucciones.forEach((instruccion) => {
			if (instruccion instanceof Declaracion) {
				result += instruccion.traducir(this.ast, this.tabla).codigo3d;
			} else if (instruccion instanceof Asignacion) {
				result += instruccion.traducir(this.ast, this.tabla).codigo3d;
			} else if (instruccion instanceof declaracionVectores) {
				result += instruccion.traducir(this.ast, this.tabla).codigo3d;
			} else if (instruccion instanceof declaracionListas) {
				result += instruccion.traducir(this.ast, this.tabla).codigo3d;
			}
		});
		return result;
	}
	traducirPrincipal(globales: string) {
		let result: string = 'void main () {\n';
		result += '\tH = 0; P = 0;\n\n';
		result += globales;
		let instrucciones = this._ast
			.getinstrucciones()
			.filter(
				(instruccion) =>
					instruccion instanceof Metodos &&
					instruccion.identificador === 'main'
			);
		if (instrucciones.length !== 1) {
			if (instrucciones.length === 0) {
				setValueConsole('No se encontró un método principal\n');
			} else {
				setValueConsole('Se encontró más de un método principal\n');
				clearValueResult();
			}
			return;
		}
		result += instrucciones[0].traducir(this._ast, this.tabla).codigo3d;
		result += '\treturn;\n';
		result += '}\n';
		setValueResult(result);
	}

	public graficar() {
		let otro = arbolNuevo;
		if (otro == null) return /*res.json({ msg: false })*/;
		let arbolAst = new nodoAST('RAIZ');
		let nodoINS = new nodoAST('INSTRUCCIONES');
		otro.getinstrucciones().forEach((element) => {
			nodoINS.agregarHijoAST(element.getNodo());
		});
		arbolAst.agregarHijoAST(nodoINS);
		graficarArbol(<nodoAST>arbolAst);
		return /*res.json({ msg: true })*/;
	}
}
