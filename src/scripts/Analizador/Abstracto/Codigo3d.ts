export interface Codigo3d {
	codigo3d: string;
	temporal: number;
	etq_verdaderas: number[];
	etq_falsas: number[];
	etq_salida: number[];
	tipo: number;
	pos: number;
}

let cont_temporales: number = 0;
let cont_etiquetas: number = 0;

export const new_temporal = (): number => {
	let temp: number = cont_temporales;
	cont_temporales++;
	return temp;
};
export const new_etiqueta = (): number => {
	let etiqueta: number = cont_etiquetas;
	cont_etiquetas++;
	return etiqueta;
};
