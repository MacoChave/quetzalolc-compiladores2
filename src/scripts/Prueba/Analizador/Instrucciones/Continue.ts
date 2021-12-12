import { Instruccion } from '../Abastracto/Instruccion';
import nodoAST from '../Abastracto/nodoAST';
import Arbol from '../Simbolos/Arbol';
import tablaSimbolos from '../Simbolos/tablaSimbolos';
import Tipo, { tipoDato } from '../Simbolos/Tipo';

export default class Continue extends Instruccion {
  constructor(fila: number, columna: number) {
    super(new Tipo(tipoDato.ENTERO), fila, columna);
  }
  public getNodo(): nodoAST {
    let nodo = new nodoAST('CONTINUE');
    nodo.agregarHijo('continue');
    nodo.agregarHijo(';');
    return nodo;
  }
  public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
    return 'ByLyContinue';
  }
}
