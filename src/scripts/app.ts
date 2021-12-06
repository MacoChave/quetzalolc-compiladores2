import { AST } from './ast/ast';
import { Scope } from './ast/scope';
import { Instruction } from './interfaces/instruction';

const grammar = require('../jison/grammar');

const analize = document.querySelector('#analize');
const compile = document.querySelector('#compile');
const reports = document.querySelector('#reports');
const symbols_table = document.querySelector('#symbols_table');
const errors_table = document.querySelector('#errors_table');
const grammar_table = document.querySelector('#grammar_table');
const show_ast = document.querySelector('#show_ast');

const my_source = <HTMLInputElement>document.querySelector('#my_source');

// const setResult = (res: string) => {
// 	(<HTMLInputElement>(
// 		document.querySelector('#my_result')
// 	)).value += `${res}\n`;
// };

// const setConsole = (res: string) => {
// 	(<HTMLInputElement>(
// 		document.querySelector('#my_console')
// 	)).value += `${res}\n`;
// };

analize?.addEventListener('click', () => {
	let source = my_source.value;
	const result = analize_source(source);
	console.log(result);
	const globalScope: Scope = new Scope(null);
	const ast: AST = new AST(result);
	result.forEach((res: Instruction) => {
		res.exec(globalScope, ast);
	});
});

compile?.addEventListener('click', () => {});

reports?.addEventListener('click', () => {
	document.querySelector('#submenu')?.classList.toggle('submenu--hide');
});

symbols_table?.addEventListener('click', () => {});

errors_table?.addEventListener('click', () => {});

grammar_table?.addEventListener('click', () => {});

show_ast?.addEventListener('click', () => {});

const analize_source = (source: string): Instruction[] => {
	console.log('ANALIZANDO...');
	return grammar.parse(source);
};
