import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class asignacionVector extends Instruccion {
  private identificador: string;
  private posicion: Instruccion;
  private expresion: Instruccion;

  constructor(
    identificador: string,
    posicion: Instruccion,
    expresion: Instruccion,
    fila: number,
    columna: number
  ) {
    super(new Tipo(tipoDato.ENTERO), fila, columna);
    this.identificador = identificador.toLowerCase();
    this.posicion = posicion;
    this.expresion = expresion;
  }
  public getNodo() {
    let nodo = new nodoAST('ASIGNACION-VECTOR');
    nodo.agregarHijo(this.identificador);
    nodo.agregarHijo('[');
    nodo.agregarHijoAST(this.posicion.getNodo());
    nodo.agregarHijo(']');
    nodo.agregarHijo('=');
    nodo.agregarHijoAST(this.expresion.getNodo());
    nodo.agregarHijo(';');
    return nodo;
  }
  public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
    let ide = tabla.getVariable(this.identificador);
    if (ide != null) {
      let pos = this.posicion.interpretar(arbol, tabla);
      if (pos instanceof Errores) return pos;
      if (this.posicion.tipoDato.getTipo() != tipoDato.ENTERO)
        return new Errores(
          'SEMANTICO',
          'TIPO DE DATO NO NUMERICO',
          this.fila,
          this.columna
        );
      let arreglo = ide.getvalor();
      if (pos > arreglo.length)
        return new Errores(
          'SEMANTICO',
          'RANGO FUERA DE LOS LIMITES',
          this.fila,
          this.columna
        );
      let exp = this.expresion.interpretar(arbol, tabla);
      if (exp instanceof Errores) return exp;
      if (ide.gettipo().getTipo() != this.expresion.tipoDato.getTipo())
        return new Errores(
          'SEMANTICO',
          'VARIABLE ' + this.identificador + ' TIPOS DE DATOS DIFERENTES',
          this.fila,
          this.columna
        );
      arreglo[pos] = exp;
      ide.setvalor(arreglo);
      arbol.actualizarTabla(
        this.identificador,
        arreglo,
        this.fila.toString(),
        tabla.getNombre().toString(),
        this.columna.toString()
      );
    } else
      return new Errores(
        'SEMANTICO',
        `VARIABLE ${this.identificador} NO EXISTE`,
        this.fila,
        this.columna
      );
  }
}
