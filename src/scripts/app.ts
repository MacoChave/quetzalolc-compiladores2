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
import LlamadaFuncMetd from './Analizador/Instrucciones/LlamadaFuncMetd';
import { Listado_Errores } from './Analizador/Excepciones/Listado_Errores';

let listaErrores = new Listado_Errores();

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
const copy_c3d = document.querySelector('#copy_c3d');

const my_source = <HTMLInputElement>document.querySelector('#my_source');

const my_result = <HTMLInputElement>document.querySelector('#my_result');

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
	listaErrores.ast = ast;
	listaErrores.interpretar();
});

compile?.addEventListener('click', () => {
	clearValueResult();
	clear_data();
	setValueConsole('Compilando la entrada...\n\n');
	sourceEditor.save();
	let source = my_source.value;
	// TODO: Pasar traductor a clase
	let ast: Arbol = analize_source(source);
	listaErrores.ast = ast;
	listaErrores.traducir();
	// traducir(ast);
});

reports?.addEventListener('click', () => {
	hideSubmenu('.submenu', 1);
});

symbols_table?.addEventListener('click', () => {});

errors_table?.addEventListener('click', () => {});

grammar_table?.addEventListener('click', () => {});

show_ast?.addEventListener('click', () => {});

copy_c3d?.addEventListener('click', () => {
	consoleEditor.save();
	navigator.clipboard
		.writeText(my_result.value)
		.then(() => console.info('Code copied succesfully...'))
		.catch((err) => console.error('Something went wrong ', err));
});

const analize_source = (source: string): Arbol => {
	console.log('ANALIZANDO...');
	return new Arbol(parser.parse(source));
};

const traducir = (ast: Arbol): void => {
	var tabla = new tablaSimbolos();
	ast.settablaGlobal(tabla);
	let instrucciones = ast.getinstrucciones();

	let funciones = instrucciones.filter((value, index, arr) => {
		return value instanceof Funciones;
	});
	let metodos = instrucciones.filter((value, index, arr) => {
		return value instanceof Metodos;
	});
	let ejecutar = instrucciones.filter((value, index, arr) => {
		return value instanceof Exec;
	});
	let declara = instrucciones.filter((value, index, arr) => {
		return value instanceof Declaracion;
	});
	let declaraVector = instrucciones.filter((value, index, arr) => {
		return value instanceof declaracionVectores;
	});
	let declaraLista = instrucciones.filter((value, index, arr) => {
		return value instanceof declaracionListas;
	});
	let asignaVector = instrucciones.filter((value, index, arr) => {
		return value instanceof asignacionVector;
	});
	let asignaLista = instrucciones.filter((value, index, arr) => {
		return value instanceof asignacionLista;
	});
	let agregaLista = instrucciones.filter((value, index, arr) => {
		return value instanceof agregarLista;
	});
	let metodoMain = instrucciones.filter((value, index, arr) => {
		return value instanceof Main;
	});
	let imprimir = instrucciones.filter((value, index, arr) => {
		return value instanceof Print;
	});
	metodoMain = metodos.filter((value) => {
		return value.identificador === 'main';
	});
	if (metodoMain.length !== 1) {
		if (metodoMain.length > 1)
			setValueConsole('Hay más de 1 método principal');
		else setValueConsole('No se encontró un método principal');
		return;
	}

	console.log({
		funciones,
		metodos,
		metodoMain,
	});

	setValueResult(`int main() {
	H = 0;
	P = 0;
`);
	escribirDeclara(declara, ast, tabla);
	escribirDeclaraVector(declaraVector, ast, tabla);
	escribirDeclaraLista(declaraLista, ast, tabla);
	escribirAsignaVector(asignaVector, ast, tabla);
	escribirAsignaLista(asignaLista, ast, tabla);
	escribirImprimir(imprimir, ast, tabla);
	escribirMain(metodoMain, ast, tabla);
	setValueResult('}\n\n');
	escribirFunciones(funciones, ast, tabla);
	escribirMetodos(metodos, ast, tabla);

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
	let c3d = '';
	declaracion.forEach((instruccion) => {
		c3d += instruccion.traducir(ast, tabla).codigo3d;
	});
	setValueResult(c3d);
};

const escribirDeclaraLista = (
	declaracion: Instruccion[],
	ast: Arbol,
	tabla: tablaSimbolos
): void => {
	let c3d = '';
	declaracion.forEach((instruccion) => {});
	setValueResult(c3d);
};

const escribirAsignaVector = (
	asignacion: Instruccion[],
	ast: Arbol,
	tabla: tablaSimbolos
): void => {
	let c3d = '';
	asignacion.forEach((instruccion) => {
		// c3d += instruccion.traducir(ast, tabla).codigo3d
	});
	setValueResult(c3d);
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
	let c3d = '';
	metodoMain.forEach((instruccion) => {
		c3d += instruccion.traducir(ast, tabla).codigo3d;
	});
	setValueResult(c3d);
};

const escribirFunciones = (
	funciones: Instruccion[],
	ast: Arbol,
	tabla: tablaSimbolos
) => {
	let c3d = '';
	funciones.forEach((instruccion) => {
		c3d += instruccion.traducir(ast, tabla).codigo3d;
	});
	setValueResult(c3d);
};

const escribirMetodos = (
	metodos: Instruccion[],
	ast: Arbol,
	tabla: tablaSimbolos
) => {
	let c3d = '';
	metodos.forEach((instruccion) => {
		if (instruccion.identificador !== 'main')
			c3d += instruccion.traducir(ast, tabla).codigo3d;
	});
	setValueResult(c3d);
};
const escribirImprimir = (
	imprimir: Instruccion[],
	ast: Arbol,
	tabla: tablaSimbolos
) => {
	let c3d = '';
	imprimir.forEach((instruccion) => {
		c3d += instruccion.traducir(ast, tabla).codigo3d;
	});
	setValueResult(c3d);
};
