export class Attribute {
	id: string;
	value: string;
	line: number;
	column: number;

	constructor(id: string, value: string, line: number, column: number) {
		this.id = id;
		this.value = value;
		this.line = line;
		this.column = column;
	}
}
