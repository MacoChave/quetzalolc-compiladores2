import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class Return extends Instruccion {
  private expresionReturn?: Instruccion;
  public valor = null;
  constructor(fila: number, columna: number, expresion?: Instruccion) {
    super(new Tipo(tipoDato.ENTERO), fila, columna);
    this.expresionReturn = expresion;
  }

  public getNodo(): nodoAST {
    let nodo = new nodoAST('RETURN');
    nodo.agregarHijo('return');
    if (this.expresionReturn != undefined) {
      nodo.agregarHijoAST(this.expresionReturn.getNodo());
    }
    nodo.agregarHijo(';');
    return nodo;
  }
  public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
    if (this.expresionReturn) {
      this.valor = this.expresionReturn?.interpretar(arbol, tabla);
      this.tipoDato = this.expresionReturn.tipoDato;
    }
    return this;
  }
}
