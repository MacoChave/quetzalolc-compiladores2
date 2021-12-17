let parser = require('./Analizador/analizador');

import { setValueConsole, setValueResult } from './shared';
import Arbol from './Analizador/TS/Arbol';

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
	const result: Arbol = analize_source(source);

	console.log(result);
});

compile?.addEventListener('click', () => {
	setValueConsole('Compilando la entrada...\n\n');
	setValueResult(`#include <stdio.h>
#include <math.h>

double heap[30101999];
double stack[30101999];
double P;
double H;`);
	sourceEditor.save();
	let source = my_source.value;
	const result: Arbol = analize_source(source);
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
