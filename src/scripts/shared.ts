export const setResult = (res: string) => {
	(<HTMLInputElement>(
		document.querySelector('#my_result')
	)).value += `${res}\n`;
};

export const setConsole = (res: string) => {
	(<HTMLInputElement>(
		document.querySelector('#my_console')
	)).value += `${res}\n`;
};
