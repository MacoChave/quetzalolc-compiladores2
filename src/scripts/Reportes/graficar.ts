import nodoAST from '../Analizador/Abstracto/nodoAST';
import { exec } from 'child_process';

var fs = require('fs');
let cuerpo = '';
let contador = 0;
export default function graficarArbol(arbolitos: nodoAST) {
	contador = 1;
	cuerpo = '';
	graphAST('n0', arbolitos);
	let principal = `digraph arbolAST{ 
      n0[label="${arbolitos.getValor().replace('"', '\\"')}"];
      ${cuerpo}
    }`;
	fs.writeFile('arbolAST.dot', principal, () => {});
	exec(
		'dot -Tsvg arbolAST.dot -o ../Frontend/Typesty/src/assets/arbolAST.svg',
		(error, stdout, stderr) => {
			if (error) {
				return;
			}
			if (stderr) {
				return;
			}
		}
	);
}
function graphAST(texto: string, padre: nodoAST) {
	for (let hijo of padre.getHijos()) {
		let nombreHijo = `n${contador}`;
		cuerpo += `${nombreHijo}[label="${hijo
			.getValor()
			.replace('"', '\\"')}"];
      ${texto} -> ${nombreHijo};`;
		contador++;
		graphAST(nombreHijo, hijo);
	}
}
