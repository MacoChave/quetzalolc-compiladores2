import { Instruction } from '../interfaces/instruction';

export class AST {
	public instructions: Array<Instruction>;

	constructor(instructions: Array<Instruction>) {
		this.instructions = instructions;
	}
}
