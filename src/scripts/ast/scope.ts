import { Symbol } from './symbol';

export class Scope {
	private preview: Scope;
	private table: { [id: string]: Symbol };

	constructor(preview: any) {
		this.table = {};
		this.preview = preview;
	}

	addScope(id: string, symbol: Symbol): void {}

	deleteScope(id: string): boolean {
		return false;
	}

	exist(id: string): boolean {
		return false;
	}

	existInCurrent(id: string): any {}

	getSymbol(id: string): any {}

	replace(id: string, newSymbol: Symbol): void {}
}
