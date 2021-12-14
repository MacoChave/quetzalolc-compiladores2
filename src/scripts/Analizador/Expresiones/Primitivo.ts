import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class Primitivo extends Instruccion {
  valor: any;
  constructor(tipo: Tipo, valor: any, fila: number, columna: number) {
    super(tipo, fila, columna);
    this.valor = valor;
    if (tipo.getTipo() == tipoDato.CADENA) {
      let val = this.valor.toString();
      this.valor = val
        .replace('\\n', '\n')
        .replace('\\t', '\t')
        .replace('\\r', '\r')
        .replace('\\\\', '\\')
        .replace("\\'", "'")
        .replace('\\"', '"');
    }
  }

  public getNodo(): nodoAST {
    let nodo = new nodoAST('PRIMITIVO');
    nodo.agregarHijo(this.valor + '');
    return nodo;
  }
  interpretar(arbol: Arbol, tabla: tablaSimbolos) {
    if (this.tipoDato.getTipo() == tipoDato.BOOLEANO) {
      return this.valor == 'true' ? true : false;
    }
    if(this.tipoDato.getTipo() == tipoDato.NULO) {
      return null;
    }
    return this.valor;
  }
}
