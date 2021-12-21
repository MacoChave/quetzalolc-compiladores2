import { Codigo3d, new_etiqueta, new_temporal } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class Cadena extends Instruccion {
	private valor1: Instruccion | undefined;
	private valor2: Instruccion | undefined;
	private valorUnario: Instruccion | undefined;
	private operacion: Operadores;

	constructor(
		operador: Operadores,
		fila: number,
		columna: number,
		op1: Instruccion,
		op2?: Instruccion
	) {
		super(new Tipo(tipoDato.ENTERO), fila, columna);
		this.operacion = operador;
		if (!op2) this.valorUnario = op1;
		else {
			this.valor1 = op1;
			this.valor2 = op2;
		}
	}
	public getNodo(): nodoAST {
		let nodo = new nodoAST('ARITMETICA');
		if (this.valorUnario != null) {
			nodo.agregarHijo(this.operacion + '');
			nodo.agregarHijoAST(this.valorUnario.getNodo());
		} else {
			nodo.agregarHijoAST(this.valor1?.getNodo());
			nodo.agregarHijo(this.operacion + '', 'ar', this.operacion);
			nodo.agregarHijoAST(this.valor2?.getNodo());
		}
		return nodo;
	}
	public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
		let izq, der, uno;
		izq = der = uno = null;
		izq = this.valor1?.interpretar(arbol, tabla);
		if (izq instanceof Errores) return izq;
		der = this.valor2?.interpretar(arbol, tabla);
		if (der instanceof Errores) return der;
		switch (this.operacion) {
			case Operadores.CONCATENACION:
				return this.concatenacionCadenas(izq, der);
			case Operadores.DUPLICIDAD:
				return this.duplicarCadenas(izq, der);
			default:
				return new Errores(
					'ERROR SEMANTICO',
					'OPERADOR INVALIDO',
					this.fila,
					this.columna
				);
		}
	}

	/*----------------------------------------------------------CONCATENACION------------------------------------------------- */
	private concatenacionCadenas(izq: any, der: any) {
		let op1 = this.valor1?.tipoDato.getTipo();
		let op2 = this.valor2?.tipoDato.getTipo();
		switch (
			op1 //operador 1
		) {
			case tipoDato.CADENA:
				return this.op2Concatenacion(1, op2, izq, der);
			case tipoDato.CARACTER:
				return this.op2Concatenacion(2, op2, izq, der);
		}
	}

	private op2Concatenacion(numero: number, op2: any, izq: any, der: any) {
		if (numero == 1) {
			//cadena
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.CADENA: //(Cadena & Cadena)
					this.tipoDato = new Tipo(tipoDato.CADENA);
					return izq + '' + der;
				case tipoDato.CARACTER: //(Cadena & caracter)
					this.tipoDato = new Tipo(tipoDato.CADENA);
					return izq + '' + der;
				default:
					//OTROS TIPOS DE DATOS
					//error
					return new Errores(
						'SEMANTICO',
						'ESTA OPERACION NO PUEDE EJECUTARSE CON OTRO TIPO DE DATO QUE NO SEA CADENA',
						this.fila,
						this.columna
					);
			}
		} else if (numero == 2) {
			//caracter
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.CADENA: //(Caracter & Cadena)
					this.tipoDato = new Tipo(tipoDato.CADENA);
					return izq + '' + der;
				case tipoDato.CARACTER: //(Caracter & caracter)
					this.tipoDato = new Tipo(tipoDato.CADENA);
					return izq + '' + der;
				default:
					//OTROS TIPOS DE DATOS
					//error
					return new Errores(
						'SEMANTICO',
						'ESTA OPERACION NO PUEDE EJECUTARSE CON OTRO TIPO DE DATO QUE NO SEA CADENA',
						this.fila,
						this.columna
					);
			}
		}
	}

	/*----------------------------------------------------------DUPLICIDAD------------------------------------------------- */
	private duplicarCadenas(izq: any, der: any) {
		let op1 = this.valor1?.tipoDato.getTipo();
		let op2 = this.valor2?.tipoDato.getTipo();
		switch (
			op1 //operador 1
		) {
			case tipoDato.CADENA:
				return this.op2Duplicar(1, op2, izq, der);
			case tipoDato.CARACTER:
				return this.op2Duplicar(2, op2, izq, der);
		}
	}

	private op2Duplicar(numero: number, op2: any, izq: any, der: any) {
		if (numero == 1) {
			//cadena
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.ENTERO: //(Cadena^Numero)
					this.tipoDato = new Tipo(tipoDato.CADENA);
					var palabra = izq + '';
					return palabra.repeat(parseInt(der));
				default:
					//OTROS TIPOS DE DATOS
					//error
					return new Errores(
						'SEMANTICO',
						'NO SE PUEDE UTILIZAR OTRO TIPO DE DATO DIFERENTE A ENTERO',
						this.fila,
						this.columna
					);
			}
		} else if (numero == 2) {
			//caracter
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.ENTERO: //(Caracter^Numero)
					this.tipoDato = new Tipo(tipoDato.CADENA);
					var palabra = izq + '';
					return palabra.repeat(parseInt(der));
				default:
					//OTROS TIPOS DE DATOS
					//error
					return new Errores(
						'SEMANTICO',
						'NO SE PUEDE UTILIZAR OTRO TIPO DE DATO DIFERENTE A ENTERO',
						this.fila,
						this.columna
					);
			}
		}
	}

	traducir(arbol: Arbol, tabla: tablaSimbolos): Codigo3d {
		let izq = this.valor1?.traducir(arbol, tabla);
		let der = this.valor2?.traducir(arbol, tabla);

		let res: Codigo3d = {
			codigo3d: '',
			etq_falsas: [],
			etq_salida: [],
			etq_verdaderas: [],
			temporal: '',
			tipo: -1,
			pos: 0,
		};

		if (
			izq?.tipo === tipoDato.NULO ||
			izq?.tipo === tipoDato.NULO ||
			der?.tipo === -1 ||
			der?.tipo === -1 ||
			izq === undefined ||
			der === undefined
		)
			return res;
		else {
			switch (this.operacion) {
				case Operadores.CONCATENACION:
					return this.traducirConcatenacion(izq, der);
				case Operadores.DUPLICIDAD:
					return this.traducirDuplicado(izq, der);
			}
		}
	}

	traducirConcatenacion(izq: Codigo3d, der: Codigo3d): Codigo3d {
		let res: Codigo3d = {
			codigo3d: '',
			etq_falsas: [],
			etq_salida: [],
			etq_verdaderas: [],
			temporal: '',
			tipo: tipoDato.CADENA,
			pos: 0,
		};

		if (
			((izq.tipo === tipoDato.CADENA || izq.tipo === tipoDato.CARACTER) &&
				der.tipo === tipoDato.CADENA) ||
			der.tipo === tipoDato.CARACTER
		) {
			let temp = new_temporal();
			let t_valor = new_temporal();
			let label1 = new_etiqueta();
			let label2 = new_etiqueta();
			let label3 = new_etiqueta();
			let c3d = `${izq.codigo3d}\n${der.codigo3d}\n`;
			c3d += `${temp} = H;\n`;
			if (izq.tipo === tipoDato.CADENA) {
				c3d += `${label1}:\n`;
				c3d += `\t${t_valor} = heap[(int) ${izq.temporal}];\n`;
				c3d += `\theap[(int) H] = ${t_valor};\n`;
				c3d += '\tH = H + 1;\n';
				c3d += `\t${izq.temporal} = ${izq.temporal} + 1;\n`;
				c3d += `\t${t_valor} = heap[(int) ${izq.temporal}];\n`;
				c3d += `\tif (${t_valor} != -1) goto ${label1};\n`;
				c3d += `\tgoto ${label2};\n`;
			} else {
				c3d += `\theap[(int) H] = ${izq.temporal};\n`;
				c3d += '\tH = H + 1;\n';
			}
			if (der.tipo === tipoDato.CADENA) {
				c3d += `${label2}:\n`;
				c3d += `\t${t_valor} = heap[(int) ${der.temporal}];\n`;
				c3d += `\theap[(int) H] = ${t_valor};\n`;
				c3d += '\tH = H + 1;\n';
				c3d += `\t${der.temporal} = ${der.temporal} + 1;\n`;
				c3d += `\t${t_valor} = heap[(int) ${der.temporal}];\n`;
				c3d += `\tif (${t_valor} != -1) goto ${label2};\n`;
				c3d += `\tgoto ${label3};\n`;
			} else {
				c3d += `${label2}:\n`;
				c3d += `\theap[(int) H] = ${der.temporal};\n`;
				c3d += '\tH = H + 1;\n';
				c3d += `\tgoto ${label3};\n`;
			}
			c3d += `${label3}:\n`;
			c3d += `\theap[(int) H] = -1;\n`;
			c3d += '\tH = H + 1;\n';

			res.codigo3d = c3d;
			res.temporal = temp;
			return res;
		} else return res;
	}

	traducirDuplicado(izq: Codigo3d, der: Codigo3d): Codigo3d {
		let res: Codigo3d = {
			codigo3d: '',
			etq_falsas: [],
			etq_salida: [],
			etq_verdaderas: [],
			temporal: '',
			tipo: tipoDato.CADENA,
			pos: 0,
		};
		if (
			(izq.tipo === tipoDato.CADENA || izq.tipo === tipoDato.CARACTER) &&
			der.tipo === tipoDato.ENTERO
		) {
			let temp = new_temporal();
			let temp_izq = new_temporal();
			let t_valor = new_temporal();
			let t_cont = new_temporal();
			let label1 = new_etiqueta();
			let label2 = new_etiqueta();
			let label3 = new_etiqueta();
			let label4 = new_etiqueta();
			let c3d = `${izq.codigo3d}\n${der.codigo3d}\n`;
			c3d += `\t${temp} = H;\n`;
			c3d += `\t${temp_izq} = ${izq.temporal};\n`;
			c3d += `\t${t_cont} = ${der.temporal};\n`;
			c3d += `${label1}:\n`;
			if (izq.tipo === tipoDato.CADENA) {
				c3d += `${label3}:\n`;
				c3d += `\t${t_valor} = heap[(int) ${temp_izq}];\n`;
				c3d += `\theap[(int) H] = ${t_valor};\n`;
				c3d += '\tH = H + 1;\n';
				c3d += `\t${temp_izq} = ${temp_izq} + 1;\n`;
				c3d += `\t${t_valor} = heap[(int) ${temp_izq}];\n`;
				c3d += `\tif (${t_valor} != -1) goto ${label3};\n`;
				c3d += `\tgoto ${label4};\n`;
				c3d += `${label4}:\n`;
				c3d += `\t${temp_izq} = ${izq.temporal};\n`;
				c3d += `\t${t_cont} = ${t_cont} - 1;\n`;
				c3d += `\tif (${t_cont} > 0) goto ${label1};\n`;
				c3d += `\tgoto ${label2};\n`;
				c3d += `${label2}:\n`;
			} else {
				c3d += `\t${t_valor} = stack[(int) ${izq.temporal}];\n`;
				c3d += `\theap[(int) H] = ${t_valor};\n`;
				c3d += '\tH = H + 1;\n';
				c3d += `\t${t_cont} = ${t_cont} - 1;\n`;
				c3d += `\tif (${t_cont} > 0) goto ${label1};\n`;
				c3d += `\tgoto ${label2};\n`;
				c3d += `\t${label2}:\n`;
			}
			c3d += `\theap[(int) H] = -1;\n`;
			c3d += '\tH = H + 1;\n';
			res.codigo3d += c3d;
			res.temporal = temp;
			return res;
		} else return res;
	}
}
export enum Operadores {
	CONCATENACION,
	DUPLICIDAD,
}
