import { Codigo3d, new_temporal } from '../Abstracto/Codigo3d';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class Aritmetica extends Instruccion {
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
		if (this.valorUnario != null) {
			uno = this.valorUnario.interpretar(arbol, tabla);
			if (uno instanceof Errores) return uno;
		} else {
			izq = this.valor1?.interpretar(arbol, tabla);
			if (izq instanceof Errores) return izq;
			der = this.valor2?.interpretar(arbol, tabla);
			if (der instanceof Errores) return der;
		}
		switch (this.operacion) {
			case Operadores.SUMA:
				return this.operador1Suma(izq, der);
			case Operadores.RESTA:
				return this.operador1Resta(izq, der);
			case Operadores.MULTIPLICACION:
				return this.operador1Multi(izq, der);
			case Operadores.DIVISION:
				return this.operador1Division(izq, der);
			case Operadores.MODULADOR:
				return this.operador1Mod(izq, der);
			case Operadores.MENOSNUM:
				return this.opMenosUnario(uno);
			default:
				return new Errores(
					'ERROR SEMANTICO',
					'OPERADOR INVALIDO',
					this.fila,
					this.columna
				);
		}
	}

	/*----------------------------------------------------------MENOSUNARIO------------------------------------------------- */
	private opMenosUnario(izq: any) {
		let opUn = this.valorUnario?.tipoDato.getTipo();
		switch (opUn) {
			case tipoDato.ENTERO:
				this.tipoDato = new Tipo(tipoDato.ENTERO);
				return parseInt(izq) * -1;
			case tipoDato.DECIMAL:
				this.tipoDato = new Tipo(tipoDato.DECIMAL);
				return parseFloat(izq) * -1.0;
		}
	}
	/*----------------------------------------------------------SUMA------------------------------------------------- */
	private operador1Suma(izq: any, der: any) {
		let op1 = this.valor1?.tipoDato.getTipo();
		let op2 = this.valor2?.tipoDato.getTipo();
		switch (
			op1 //operador 1
		) {
			case tipoDato.ENTERO:
				return this.op2Suma(1, op2, izq, der);
			case tipoDato.DECIMAL:
				return this.op2Suma(2, op2, izq, der);
			case tipoDato.CARACTER:
				return this.op2Suma(3, op2, izq, der);
		}
	}
	private op2Suma(numero: number, op2: any, izq: any, der: any) {
		if (numero == 1) {
			//entero
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.ENTERO: //(Entero + Entero)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					return parseInt(izq) + parseInt(der);
				case tipoDato.DECIMAL: //(Entero + Double)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return parseFloat(izq) + parseFloat(der);
				case tipoDato.CARACTER: //(entero + caracter)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					var da = der + '';
					var res = da.charCodeAt(0);
					return parseInt(izq) + res;
				default:
					//OPERACION ENTRE BOOLEANOS O STRING
					//error
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO NO SE PUEDE OPERAR EN UNA SUMA',
						this.fila,
						this.columna
					);
			}
		} else if (numero == 2) {
			//decimal
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.ENTERO: //(double + entero)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return parseFloat(izq) + parseFloat(der);
				case tipoDato.DECIMAL: //(double + double)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return parseFloat(izq) + parseFloat(der);
				case tipoDato.CARACTER: //(double + caracter)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					var da = der + '';
					var res = da.charCodeAt(0);
					return parseInt(izq) + res;
				default:
					//OPERACION ENTRE BOOLEANOS O STRING
					//error
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO NO SE PUEDE OPERAR EN UNA SUMA',
						this.fila,
						this.columna
					);
			}
		} else if (numero == 3) {
			//caracter
			switch (
				op2 //2DO OPERADOR
			) {
				case tipoDato.ENTERO: //(caracter + entero)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					var da = izq + '';
					var res = da.charCodeAt(0);
					return res + parseInt(der);
				case tipoDato.DECIMAL: //(caracter + double)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					var da = izq + '';
					var res = da.charCodeAt(0);
					return res + parseFloat(der);
				case tipoDato.CARACTER: // (caracter + caracter)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					var da = der + '';
					var res = da.charCodeAt(0);
					var da1 = izq + '';
					var res1 = da1.charCodeAt(0);
					return res1 + res;
				default:
					//OPERACION ENTRE BOOLEANOS O STRING
					//error
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO NO SE PUEDE OPERAR EN UNA SUMA',
						this.fila,
						this.columna
					);
			}
		}
	}
	/*----------------------------------------------------------RESTA------------------------------------------------- */
	private operador1Resta(izq: any, der: any) {
		let op1 = this.valor1?.tipoDato.getTipo();
		let op2 = this.valor2?.tipoDato.getTipo();
		switch (
			op1 //operador 1
		) {
			case tipoDato.ENTERO:
				return this.op2Resta(1, op2, izq, der);
			case tipoDato.DECIMAL:
				return this.op2Resta(2, op2, izq, der);
			case tipoDato.CARACTER:
				return this.op2Resta(3, op2, izq, der);
		}
	}
	private op2Resta(numero: number, op2: any, izq: any, der: any) {
		if (numero == 1) {
			//entero
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.ENTERO: //(Entero - Entero)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					return parseInt(izq) - parseInt(der);
				case tipoDato.DECIMAL: //(Entero - Double)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return parseFloat(izq) - parseFloat(der);
				case tipoDato.CARACTER: //(entero - caracter)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					var da = der + '';
					var res = da.charCodeAt(0);
					return parseInt(izq) - res;
				default:
					//OPERACION ENTRE BOOLEANOS O STRING
					//error
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO NO SE PUEDE OPERAR EN UNA RESTA',
						this.fila,
						this.columna
					);
			}
		} else if (numero == 2) {
			//decimal
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.ENTERO: //(double - entero)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return parseFloat(izq) - parseFloat(der);
				case tipoDato.DECIMAL: //(double - double)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return parseFloat(izq) - parseFloat(der);
				case tipoDato.CARACTER: //(double - caracter)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					var da = der + '';
					var res = da.charCodeAt(0);
					return parseInt(izq) - res;
				default:
					//OPERACION ENTRE BOOLEANOS O STRING
					//error
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO NO SE PUEDE OPERAR EN UNA SUMA',
						this.fila,
						this.columna
					);
			}
		} else if (numero == 3) {
			//caracter
			switch (
				op2 //2DO OPERADOR
			) {
				case tipoDato.ENTERO: //(caracter - entero)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					var da = izq + '';
					var res = da.charCodeAt(0);
					return res - parseInt(der);
				case tipoDato.DECIMAL: //(caracter - double)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					var da = izq + '';
					var res = da.charCodeAt(0);
					return res - parseFloat(der);
				case tipoDato.CARACTER: // (caracter - caracter)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					var da = der + '';
					var res = da.charCodeAt(0);
					var da1 = izq + '';
					var res1 = da1.charCodeAt(0);
					return res1 - res;
				default:
					//OPERACION ENTRE BOOLEANOS O STRING
					//error
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO NO SE PUEDE OPERAR EN UNA SUMA',
						this.fila,
						this.columna
					);
			}
		}
	}
	/*----------------------------------------------------------MULTIPLICACION------------------------------------------------- */
	private operador1Multi(izq: any, der: any) {
		let op1 = this.valor1?.tipoDato.getTipo();
		let op2 = this.valor2?.tipoDato.getTipo();
		switch (
			op1 //operador 1
		) {
			case tipoDato.ENTERO:
				return this.op2Multi(1, op2, izq, der);
			case tipoDato.DECIMAL:
				return this.op2Multi(2, op2, izq, der);
			case tipoDato.CARACTER:
				return this.op2Multi(3, op2, izq, der);
		}
	}
	private op2Multi(numero: number, op2: any, izq: any, der: any) {
		if (numero == 1) {
			//entero
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.ENTERO: //(entero * entero)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					return parseInt(izq) * parseInt(der);
				case tipoDato.DECIMAL: //(entero * double)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return parseFloat(izq) * parseFloat(der);
				case tipoDato.CARACTER: //(entero * caracter)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					var da = der + '';
					var res = da.charCodeAt(0);
					return parseInt(izq) * res;
				default:
					//error
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO NO SE PUEDE OPERAR EN UNA MULTIPLICACION',
						this.fila,
						this.columna
					);
			}
		} else if (numero == 2) {
			//decimal
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.ENTERO: //(double * entero)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return parseFloat(izq) * parseFloat(der);
				case tipoDato.DECIMAL: //(double * double)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return parseFloat(izq) * parseFloat(der);
				case tipoDato.CARACTER: //(double * caracter)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					var da = der + '';
					var res = da.charCodeAt(0);
					return parseFloat(izq) * res;
				default:
					//error
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO NO SE PUEDE OPERAR EN UNA MULTIPLICACION',
						this.fila,
						this.columna
					);
			}
		} else if (numero == 3) {
			//caracter
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.ENTERO: //(caracter * entero)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					var da1 = izq + '';
					var res1 = da1.charCodeAt(0);
					return res1 * parseInt(der);
				case tipoDato.DECIMAL: //(caracter * double)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					var da1 = izq + '';
					var res1 = da1.charCodeAt(0);
					return res1 * parseFloat(der);
				case tipoDato.CARACTER: // (caracter * caracter)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					var da = der + '';
					var res = da.charCodeAt(0);
					var da1 = izq + '';
					var res1 = da1.charCodeAt(0);
					return res1 * res;
				default:
					//error semantico
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO NO SE PUEDE OPERAR EN UNA MULTIPLICACION',
						this.fila,
						this.columna
					);
			}
		}
	}
	/*----------------------------------------------------------DIVISION------------------------------------------------- */
	private operador1Division(izq: any, der: any) {
		let op1 = this.valor1?.tipoDato.getTipo();
		let op2 = this.valor2?.tipoDato.getTipo();
		switch (
			op1 //operador 1
		) {
			case tipoDato.ENTERO:
				return this.op2Division(1, op2, izq, der);
			case tipoDato.DECIMAL:
				return this.op2Division(2, op2, izq, der);
			case tipoDato.CARACTER:
				return this.op2Division(3, op2, izq, der);
		}
	}
	private op2Division(numero: number, op2: any, izq: any, der: any) {
		if (numero == 1) {
			//entero
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.ENTERO: //(entero / entero)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return der != 0
						? parseInt(izq) / parseInt(der)
						: 'NO SE PUEDE DIVIDIR SOBRE CERO';
				case tipoDato.DECIMAL: //(entero / double)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return der != 0
						? parseFloat(izq) / parseFloat(der)
						: 'NO SE PUEDE DIVIDIR SOBRE CERO';
				case tipoDato.CARACTER: //(entero / caracter)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					var da = der + '';
					var res = da.charCodeAt(0);
					return res != 0
						? parseInt(izq) / res
						: 'NO SE PUEDE DIVIDIR SOBRE CERO';
				default:
					//error
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO NO SE PUEDE OPERAR EN UNA DIVISION',
						this.fila,
						this.columna
					);
			}
		} else if (numero == 2) {
			//decimal
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.ENTERO: //(double / entero)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return der != 0
						? parseFloat(izq) / parseFloat(der)
						: 'NO SE PUEDE DIVIDIR SOBRE CERO';
				case tipoDato.DECIMAL: //(double / double)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return der != 0
						? parseFloat(izq) / parseFloat(der)
						: 'NO SE PUEDE DIVIDIR SOBRE CERO';
				case tipoDato.CARACTER: // (double / caracter)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					var da = der + '';
					var res = da.charCodeAt(0);
					return der != 0
						? parseFloat(izq) / res
						: 'NO SE PUEDE DIVIDIR SOBRE CERO';
				default:
					//error
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO NO PERMITIDO',
						this.fila,
						this.columna
					);
			}
		} else if (numero == 3) {
			//caracter
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.ENTERO: //(caracter / entero)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					var da1 = izq + '';
					var res1 = da1.charCodeAt(0);
					return der != 0
						? res1 / parseInt(der)
						: 'NO SE PUEDE DIVIDIR SOBRE CERO';
				case tipoDato.DECIMAL: //(caracter / double)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					var da1 = izq + '';
					var res1 = da1.charCodeAt(0);
					return der != 0
						? res1 / parseFloat(der)
						: 'NO SE PUEDE DIVIDIR SOBRE CERO';
				case tipoDato.CARACTER: // (caracter / caracter)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					var da = der + '';
					var res = da.charCodeAt(0);
					var da1 = izq + '';
					var res1 = da1.charCodeAt(0);
					return res != 0
						? res1 / res
						: 'NO SE PUEDE DIVIDIR SOBRE 0';
				default:
					//error semantico
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO NO SE PUEDE OPERAR EN UNA MULTIPLICACION',
						this.fila,
						this.columna
					);
			}
		}
	}
	/*----------------------------------------------------------MODULACION------------------------------------------------- */
	private operador1Mod(izq: any, der: any) {
		let op1 = this.valor1?.tipoDato.getTipo();
		let op2 = this.valor2?.tipoDato.getTipo();
		switch (
			op1 //operador 1
		) {
			case tipoDato.ENTERO:
				return this.op2Mod(1, op2, izq, der);
			case tipoDato.DECIMAL:
				return this.op2Mod(2, op2, izq, der);
			case tipoDato.CARACTER:
				return this.op2Mod(3, op2, izq, der);
		}
	}
	private op2Mod(numero: number, op2: any, izq: any, der: any) {
		if (numero == 1) {
			//entero
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.ENTERO: //(entero % entero)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					return parseInt(izq) % parseInt(der);
				case tipoDato.DECIMAL: //(entero % double)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return parseFloat(izq) % parseFloat(der);
				case tipoDato.CARACTER: //(entero % caracter)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					var da = der + '';
					var res = da.charCodeAt(0);
					return parseInt(izq) * res;
				default:
					//error
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO NO SE PUEDE OBTENER EL MODULO',
						this.fila,
						this.columna
					);
			}
		} else if (numero == 2) {
			//decimal
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.ENTERO: //retorna decimal
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return parseFloat(izq) % parseFloat(der);
				case tipoDato.DECIMAL: //retorna decimal
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					return parseFloat(izq) % parseFloat(der);
				case tipoDato.CARACTER: //(entero % caracter)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					var da = der + '';
					var res = da.charCodeAt(0);
					return parseInt(izq) * res;
				default:
					//error
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO NO SE PUEDE OBTENER EL MODULO',
						this.fila,
						this.columna
					);
			}
		} else if (numero == 3) {
			//caracter
			switch (
				op2 //OPERADOR 2
			) {
				case tipoDato.ENTERO: //(caracter / entero)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					var da1 = izq + '';
					var res1 = da1.charCodeAt(0);
					return res1 % parseInt(der);
				case tipoDato.DECIMAL: //(caracter / double)
					this.tipoDato = new Tipo(tipoDato.DECIMAL);
					var da1 = izq + '';
					var res1 = da1.charCodeAt(0);
					return res1 % parseInt(der);
				case tipoDato.CARACTER: // (caracter / caracter)
					this.tipoDato = new Tipo(tipoDato.ENTERO);
					var da = der + '';
					var res = da.charCodeAt(0);
					var da1 = izq + '';
					var res1 = da1.charCodeAt(0);
					return res1 % res;
				default:
					//error semantico
					return new Errores(
						'SEMANTICO',
						'TIPO DE DATO NO SE PUEDE OBTENER EL MODULO',
						this.fila,
						this.columna
					);
			}
		}
	}

	traducir(arbol: Arbol, tabla: tablaSimbolos): Codigo3d {
		let izq, der;
		let c3d: Codigo3d = {
			codigo3d: '',
			etq_falsas: [],
			etq_salida: [],
			etq_verdaderas: [],
			pos: 0,
			temporal: '',
			tipo: -1,
		};

		if (this.valorUnario != null) {
			izq = this.valorUnario?.traducir(arbol, tabla);
			if (izq?.tipo === tipoDato.NULO || izq?.tipo === -1) return c3d;
		} else {
			izq = this.valor1?.traducir(arbol, tabla);
			der = this.valor2?.traducir(arbol, tabla);
			if (
				izq?.tipo === tipoDato.NULO ||
				der?.tipo === tipoDato.NULO ||
				izq?.tipo === -1 ||
				der?.tipo === -1
			)
				return c3d;
		}

		switch (this.operacion) {
			case Operadores.SUMA:
				return this.traducirBinario(izq, der, '+');
			case Operadores.RESTA:
				return this.traducirBinario(izq, der, '-');
			case Operadores.MULTIPLICACION:
				return this.traducirBinario(izq, der, '*');
			case Operadores.DIVISION:
				return this.traducirBinario(izq, der, '/');
			case Operadores.MODULADOR:
				return this.traducirBinario(izq, der, '%');
			case Operadores.MENOSNUM:
				return this.traducirNegativo(izq);
		}
	}

	traducirBinario(izq: Codigo3d, der: Codigo3d, op: string): Codigo3d {
		let res: Codigo3d = {
			codigo3d: '',
			etq_falsas: [],
			etq_salida: [],
			etq_verdaderas: [],
			pos: 0,
			temporal: '',
			tipo: -1,
		};
		let temp: string = new_temporal();
		let c3d: string = `${izq.codigo3d}\n${der.codigo3d}\n`;
		if (op === '%')
			c3d += `\t${temp} = fmod(${izq.temporal}, ${der.temporal});\n`;
		else c3d += `\t${temp} = ${izq.temporal} ${op} ${der.temporal};\n`;

		if (izq.tipo === tipoDato.DECIMAL || der.tipo === tipoDato.DECIMAL) {
			res.tipo = tipoDato.DECIMAL;
		} else if (
			izq.tipo === tipoDato.ENTERO ||
			izq.tipo === tipoDato.CARACTER
		) {
			res.tipo = tipoDato.ENTERO;
		} else return res;

		if (op === '/') res.tipo = tipoDato.DECIMAL;

		res.codigo3d = c3d;
		res.temporal = temp;
		return res;
	}

	traducirNegativo(izq: Codigo3d): Codigo3d {
		let res: Codigo3d = {
			codigo3d: '',
			etq_falsas: [],
			etq_salida: [],
			etq_verdaderas: [],
			pos: 0,
			temporal: '',
			tipo: -1,
		};
		let temp: string = new_temporal();
		let c3d: string = `${izq.codigo3d}\n`;
		c3d += `\t${temp} = ${izq.temporal} * -1;\n`;
		if (izq.tipo === tipoDato.DECIMAL) res.tipo = tipoDato.DECIMAL;
		else if (izq.tipo === tipoDato.ENTERO || izq.tipo === tipoDato.CARACTER)
			res.tipo = tipoDato.ENTERO;
		else return res;

		res.codigo3d = c3d;
		res.temporal = temp;
		return res;
	}
}
export enum Operadores {
	SUMA,
	RESTA,
	MULTIPLICACION,
	DIVISION,
	MODULADOR,
	MENOSNUM,
}
