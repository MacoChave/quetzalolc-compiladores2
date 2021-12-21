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
import { Codigo3d } from '../Abstracto/Codigo3d';

export let listaErrores: Array<Errores>;
let arbolNuevo: Arbol;
let contador: number;
let cuerpo: string;
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
		console.log('Traduciendo...');
		this.traducirFunciones();
		this.traducirMetodos();
		setValueResult('int main {\n');
		setValueResult('\tH = 0; P = 0\n');
		this.traducirGlobales();
		this.traducirPrincipal();
		setValueResult('}');
		addHeaderResult();
	}

	traducirFunciones() {
		let instrucciones = this._ast
			.getinstrucciones()
			.filter((instruccion) => instruccion instanceof Funciones);
		instrucciones.forEach((instruccion) => {
			instruccion.traducir(this._ast, this.tabla);
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
			instruccion.traducir(this._ast, this.tabla);
		});
	}
	traducirGlobales() {
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
				let result = instruccion.traducir(
					this.ast,
					this.tabla
				).codigo3d;
				setValueResult(result);
			} else if (instruccion instanceof Asignacion) {
				let result = instruccion.traducir(
					this.ast,
					this.tabla
				).codigo3d;
				setValueResult(result);
			} else if (instruccion instanceof declaracionVectores) {
				let result = instruccion.traducir(
					this.ast,
					this.tabla
				).codigo3d;
				setValueResult(result);
			} else if (instruccion instanceof declaracionListas) {
				let result = instruccion.traducir(
					this.ast,
					this.tabla
				).codigo3d;
				setValueResult(result);
			}
		});
	}
	traducirPrincipal() {
		let instrucciones = this._ast
			.getinstrucciones()
			.filter(
				(instruccion) =>
					instruccion instanceof Metodos &&
					instruccion.identificador === 'main'
			);
		if (instrucciones.length !== 1) {
			setValueConsole('Se encontró más de un método principal\n');
			clearValueResult();
		} else if (instrucciones.length === 0) {
			setValueConsole('No se encontró un método principal\n');
		}
		let result = instrucciones[0].traducir(this._ast, this.tabla).codigo3d;
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
