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

errors_table?.addEventListener('click', () => {
	console.log(listaErrores.ast.geterrores());
});

grammar_table?.addEventListener('click', () => {
	console.log(listaErrores.ast.gettablaGlobal());
});

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
