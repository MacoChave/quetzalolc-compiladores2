import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class accesoLista extends Instruccion {
  private identificador: string;
  private expresion: Instruccion;
  constructor(
    identificador: string,
    expresion: Instruccion,
    fila: number,
    columna: number
  ) {
    super(new Tipo(tipoDato.ENTERO), fila, columna);
    this.identificador = identificador.toLowerCase();
    this.expresion = expresion;
  }
  public getNodo() {
    let nodo = new nodoAST('ACCESO-LISTA');
    nodo.agregarHijo(this.identificador);
    nodo.agregarHijo('[');
    nodo.agregarHijo('[');
    nodo.agregarHijoAST(this.expresion.getNodo());
    nodo.agregarHijo(']');
    nodo.agregarHijo(']');
    return nodo;
  }
  public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
    let exp = this.expresion.interpretar(arbol, tabla);
    if (exp instanceof Errores) return exp;
    if (this.expresion.tipoDato.getTipo() != tipoDato.ENTERO)
      return new Errores(
        'SEMANTICO',
        'TIPO DE DATO DIFERENTE',
        this.fila,
        this.columna
      );
    let ide = tabla.getVariable(this.identificador);

    if (ide != null) {
      this.tipoDato = new Tipo(ide.gettipo().getTipo());
      return ide.getvalor()[exp];
    }
    return null;
  }
}
