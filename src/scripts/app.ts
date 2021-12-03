const grammar = require('../jison/grammar');

const analize = document.querySelector('#analize');

const my_source = <HTMLInputElement>document.querySelector('#my_source');

const setResult = (res: string) => {
	(<HTMLInputElement>document.querySelector('#my_result')).value = res;
};

analize?.addEventListener('click', () => {
	console.info('Get source text...');
	let source = my_source.value;
	console.info({ source: source });
	analize_source(source);
});

const analize_source = (source: string): void => {
	console.log('ANALIZANDO...');
	const result = grammar.parse(source);
	setResult(result);
};
