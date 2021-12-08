export const setResult = (res: string) => {
	let textarea = <HTMLInputElement>document.querySelector('#my_result');
	let value = textarea.value;
	value += res;
	textarea.value = value;
};

export const setConsole = (res: string) => {
	let textarea = <HTMLInputElement>document.querySelector('#my_console');
	let value = textarea.value;
	value += res;
	textarea.value = value;
};
