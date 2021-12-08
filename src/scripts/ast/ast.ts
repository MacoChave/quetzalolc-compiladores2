import { Instruction } from '../interfaces/instruction';

export class AST {
	public instructions: Array<Instruction>;
	public structs: Array<any>;
	public functions: Array<any>;

	constructor(instructions: Array<Instruction>) {
		this.instructions = instructions;
		this.structs = [];
		this.functions = [];
	}
}
