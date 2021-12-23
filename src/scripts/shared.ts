import { agregarCabecera } from './Analizador/Abstracto/Codigo3d';

export const setValueResult = (res: string) => {
	let textarea = <HTMLInputElement>document.querySelector('#my_result');
	let value = textarea.value;
	value += res;
	resultEditor.setValue(value);
	resultEditor.save();
};

export const clearValueConsole = () => {
	consoleEditor.setValue('');
	consoleEditor.save();
};

export const clearValueResult = () => {
	resultEditor.setValue('');
	resultEditor.save();
};

export const addHeaderResult = () => {
	let res = agregarCabecera();
	let textarea = <HTMLInputElement>document.querySelector('#my_result');
	let value = res;
	value += textarea.value;
	resultEditor.setValue(value);
	resultEditor.save();
};

export const setValueConsole = (texto: string) => {
	let textarea = <HTMLInputElement>document.querySelector('#my_console');
	let value = textarea.value;
	value += texto;
	consoleEditor.setValue(value);
	consoleEditor.save();
};
