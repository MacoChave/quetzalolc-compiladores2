import Tipo from './Tipo';

export default class Simbolo {
	private tipo: Tipo;
	private identificador: String;
	private valor: any; //este es el valor que va a recibir
	private _posRelativa: number;
	private _posAbsoluta: number;
	private _length: number;

	constructor(tipo: Tipo, identificador: String, valor?: any) {
		this.tipo = tipo;
		this.identificador = identificador.toLowerCase();
		this.valor = valor;
		this._posRelativa = 0;
		this._posAbsoluta = 0;
		this._length = 0;
	}
	//getters y setters
	public gettipo(): Tipo {
		return this.tipo;
	}
	public settipo(value: Tipo) {
		this.tipo = value;
	}
	public getidentificador(): String {
		return this.identificador;
	}
	public setidentificador(value: String) {
		this.identificador = value;
	}
	public getvalor(): any {
		return this.valor;
	}
	public setvalor(value: any) {
		this.valor = value;
	}
	public get posRelativa(): number {
		return this._posRelativa;
	}
	public set posRelativa(value: number) {
		this._posRelativa = value;
	}
	public get posAbsoluta(): number {
		return this._posAbsoluta;
	}
	public set posAbsoluta(value: number) {
		this._posAbsoluta = value;
	}
	public get length(): number {
		return this._length;
	}
	public set length(value: number) {
		this._length = value;
	}
}
