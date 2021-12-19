export interface Codigo3d {
	codigo3d: string;
	temporal: string;
	etq_verdaderas: string[];
	etq_falsas: string[];
	etq_salida: string[];
	tipo: number;
	pos: number;
}

let cont_temporales: number = 0;
let temporales: string[] = [];
let cont_etiquetas: number = 0;
let c3d_nativa: string = '';

export const new_temporal = (): string => {
	let temp_number: number = cont_temporales;
	cont_temporales++;
	let temp = `t${temp_number}`;
	temporales.push(temp);
	return temp;
};

export const new_etiqueta = (): string => {
	let etiqueta: number = cont_etiquetas;
	cont_etiquetas++;
	return `L${etiqueta}`;
};

export const agregarCabecera = (): string => {
	let header = '#include <stdio.h>\n';
	header += '#include <math.h>\n';
	header += 'double heap[30101999];\n';
	header += 'double stack[30101999];\n';
	header += 'double P;\n';
	header += 'double H;\n';

	temporales.forEach((temp) => {
		header += `float ${temp};\n`;
	});

	return header;
};

export const crearConcatenarStr = () => {};

export const crearDuplicarStr = () => {};

export const crearCompararStr = () => {};

export const crearImprimirStr = () => {};
