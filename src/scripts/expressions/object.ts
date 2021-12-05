import { Scope } from '../ast/scope';
import { Attribute } from './attribute';

export class Objeto {
	id: string;
	text: string;
	attributes: Array<Attribute>;
	objetos: Array<Objeto>;
	line: number;
	column: number;
	scope: Scope;

	constructor(
		id: string,
		text: string,
		line: number,
		column: number,
		attributes: Array<Attribute>,
		objetos: Array<Objeto>
	) {
		this.id = id;
		this.text = text;
		this.line = line;
		this.column = column;
		this.attributes = attributes;
		this.objetos = objetos;
		this.scope = new Scope(null);
	}
}
