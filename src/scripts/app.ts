let parser = require('./Analizador/analizador');

import {
	addHeaderResult,
	clearValueResult,
	setValueConsole,
	setValueResult,
} from './shared';
import Arbol from './Analizador/TS/Arbol';
import tablaSimbolos from './Analizador/TS/tablaSimbolos';
import Funciones from './Analizador/Instrucciones/Funciones';
import Metodos from './Analizador/Instrucciones/Metodos';
import Exec from './Analizador/Instrucciones/Exec';
import Declaracion from './Analizador/Instrucciones/Declaracion';
import declaracionVectores from './Analizador/Instrucciones/declaracionVectores';
import declaracionListas from './Analizador/Instrucciones/declaracionListas';
import asignacionVector from './Analizador/Instrucciones/asignacionVector';
import asignacionLista from './Analizador/Instrucciones/asignacionLista';
import agregarLista from './Analizador/Instrucciones/agregarLista';
import Main from './Analizador/Instrucciones/Main';
import { Instruccion } from './Analizador/Abstracto/Instruccion';
import { clear_data } from './Analizador/Abstracto/Codigo3d';
import Print from './Analizador/Instrucciones/print';

const file = document.querySelector('#file');
const open_file = document.querySelector('#open_file');
const clear_file = document.querySelector('#clear_file');
const analize = document.querySelector('#analize');
const compile = document.querySelector('#compile');
const reports = document.querySelector('#reports');
const symbols_table = document.querySelector('#symbols_table');
const errors_table = document.querySelector('#errors_table');
const grammar_table = document.querySelector('#grammar_table');
const show_ast = document.querySelector('#show_ast');

const my_source = <HTMLInputElement>document.querySelector('#my_source');

const hideSubmenu = (selector: string, idx: number) => {
	document.querySelectorAll(selector)[idx].classList.toggle('submenu--hide');
};

file?.addEventListener('click', () => {
	hideSubmenu('.submenu', 0);
});

open_file?.addEventListener(
	'change',
	(e: any) => {
		let file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			let target = e.target;
			if (target !== undefined && target !== null) {
				var content = `${target.result}`;
				sourceEditor.setValue(content);
			}
		};
		reader.readAsText(file);

		hideSubmenu('.submenu', 0);
	},
	false
);

clear_file?.addEventListener('click', () => {
	hideSubmenu('.submenu', 0);
});

analize?.addEventListener('click', () => {
	setValueConsole('Interpretando la entrada...\n\n');
	sourceEditor.save();
	let source = my_source.value;
	let ast: Arbol = analize_source(source);
	ast.geterrores().forEach((error) => {
		let str_error = `${error.getTipoError} en [${error.getFila},${error.getcolumna}]: ${error.getDesc}`;
		console.error(str_error);
		setValueConsole(str_error);
	});

	console.log(ast);
});

compile?.addEventListener('click', () => {
	clearValueResult();
	clear_data();
	setValueConsole('Compilando la entrada...\n\n');
	sourceEditor.save();
	let source = my_source.value;
	// TODO: Pasar traductor a clase
	setValueResult('\nint main () {\n');
	let ast: Arbol = analize_source(source);
	traducir(ast);
	// ast.getinstrucciones().forEach((instruccion, index) => {
	// 	let res = instruccion.traducir(ast, tabla);
	// });
});

reports?.addEventListener('click', () => {
	hideSubmenu('.submenu', 1);
});

symbols_table?.addEventListener('click', () => {});

errors_table?.addEventListener('click', () => {});

grammar_table?.addEventListener('click', () => {});

show_ast?.addEventListener('click', () => {});

const analize_source = (source: string): Arbol => {
	console.log('ANALIZANDO...');
	return new Arbol(parser.parse(source));
};

const traducir = (ast: Arbol): void => {
	var tabla = new tablaSimbolos();
	ast.settablaGlobal(tabla);
	console.log(ast.getinstrucciones());
	let funciones = ast.getinstrucciones().filter((value) => {
		return value instanceof Funciones;
	});
	let metodos = ast.getinstrucciones().filter((value) => {
		return value instanceof Metodos;
	});
	let ejecutar = ast.getinstrucciones().filter((value) => {
		return value instanceof Exec;
	});
	let declara = ast.getinstrucciones().filter((value) => {
		return value instanceof Declaracion;
	});
	let declaraVector = ast.getinstrucciones().filter((value) => {
		return value instanceof declaracionVectores;
	});
	let declaraLista = ast.getinstrucciones().filter((value) => {
		return value instanceof declaracionListas;
	});
	let asignaVector = ast.getinstrucciones().filter((value) => {
		return value instanceof asignacionVector;
	});
	let asignaLista = ast.getinstrucciones().filter((value) => {
		return value instanceof asignacionLista;
	});
	let agregaLista = ast.getinstrucciones().filter((value) => {
		return value instanceof agregarLista;
	});
	let metodoMain = ast.getinstrucciones().filter((value) => {
		return value instanceof Main;
	});
	let imprimir = ast.getinstrucciones().filter((value) => {
		return value instanceof Print;
	});

	console.log({
		funciones,
		metodos,
		ejecutar,
		declara,
		declaraVector,
		declaraLista,
		asignaVector,
		asignaLista,
		agregaLista,
		metodoMain,
		imprimir,
	});
	escribirDeclara(declara, ast, tabla);
	escribirDeclaraVector(declaraVector, ast, tabla);
	escribirDeclaraLista(declaraLista, ast, tabla);
	escribirAsignaVector(asignaVector, ast, tabla);
	escribirAsignaLista(asignaLista, ast, tabla);
	escribirMain(metodoMain, ast, tabla);
	setValueResult('}\n\n');
	escribirFunciones(funciones, ast, tabla);
	escribirMetodos(metodos, ast, tabla);
	escribirImprimir(imprimir, ast, tabla);

	addHeaderResult();
};

const escribirDeclara = (
	declaracion: Instruccion[],
	ast: Arbol,
	tabla: tablaSimbolos
): void => {
	let c3d = '';
	declaracion.forEach((instruccion) => {
		c3d += instruccion.traducir(ast, tabla).codigo3d;
	});
	setValueResult(c3d);
};

const escribirDeclaraVector = (
	declaracion: Instruccion[],
	ast: Arbol,
	tabla: tablaSimbolos
): void => {
	declaracion.forEach((instruccion) => {});
};

const escribirDeclaraLista = (
	declaracion: Instruccion[],
	ast: Arbol,
	tabla: tablaSimbolos
): void => {
	let c3d = '';
	declaracion.forEach((instruccion) => {
		c3d += instruccion.traducir(ast, tabla).codigo3d;
	});
	setValueResult(c3d);
};

const escribirAsignaVector = (
	asignacion: Instruccion[],
	ast: Arbol,
	tabla: tablaSimbolos
): void => {
	asignacion.forEach((instruccion) => {});
};

const escribirAsignaLista = (
	asignacion: Instruccion[],
	ast: Arbol,
	tabla: tablaSimbolos
): void => {
	asignacion.forEach((instruccion) => {});
};

const escribirMain = (
	metodoMain: Instruccion[],
	ast: Arbol,
	tabla: tablaSimbolos
) => {
	metodoMain.forEach((instruccion) => {});
};

const escribirFunciones = (
	funciones: Instruccion[],
	ast: Arbol,
	tabla: tablaSimbolos
) => {
	funciones.forEach((instruccion) => {});
};

const escribirMetodos = (
	metodos: Instruccion[],
	ast: Arbol,
	tabla: tablaSimbolos
) => {
	metodos.forEach((instruccion) => {});
};
function escribirImprimir(
	imprimir: Instruccion[],
	ast: Arbol,
	tabla: tablaSimbolos
) {
	let c3d = '';
	imprimir.forEach((instruccion) => {
		c3d += instruccion.traducir(ast, tabla);
	});
	setValueResult(c3d);
}
