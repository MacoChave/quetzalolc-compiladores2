export const setValueResult = (res: string) => {
	let textarea = <HTMLInputElement>document.querySelector('#my_result');
	let value = textarea.value;
	value += res;
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
