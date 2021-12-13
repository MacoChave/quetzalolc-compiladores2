import obtenerValor from '../../Reportes/cambiarTipo';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class casteo extends Instruccion {
  private tipo: Tipo;
  private expresion: Instruccion;
  constructor(
    tipo: Tipo,
    expresion: Instruccion,
    fila: number,
    columna: number
  ) {
    super(tipo, fila, columna);
    this.tipo = tipo;
    this.expresion = expresion;
  }
  public getNodo() {
    let nodo = new nodoAST('CASTEO');
    nodo.agregarHijo('(');
    nodo.agregarHijo(obtenerValor(this.tipo.getTipo()) + '');
    nodo.agregarHijo(')');
    nodo.agregarHijoAST(this.expresion.getNodo());
    return nodo;
  }
  public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
    let exp = this.expresion.interpretar(arbol, tabla);
    if (exp instanceof Errores) return exp;
    if (this.expresion.tipoDato.getTipo() == tipoDato.ENTERO) {
      if (this.tipo.getTipo() == tipoDato.DECIMAL) {
        this.tipoDato = new Tipo(tipoDato.DECIMAL);
        return parseFloat(exp);
      } else if (this.tipo.getTipo() == tipoDato.CADENA) {
        this.tipoDato = new Tipo(tipoDato.CADENA);
        return exp.toString();
      } else if (this.tipo.getTipo() == tipoDato.CARACTER) {
        this.tipoDato = new Tipo(tipoDato.CARACTER);
        return String.fromCharCode(parseInt(exp));
      } else
        return new Errores(
          'SEMANTICO',
          'NO ES POSIBLE EL CASTEO POR TIPO DE DATO',
          this.fila,
          this.columna
        );
    } else if (this.expresion.tipoDato.getTipo() == tipoDato.DECIMAL) {
      if (this.tipo.getTipo() == tipoDato.ENTERO) {
        this.tipoDato = new Tipo(tipoDato.ENTERO);
        return parseInt(exp);
      } else if (this.tipo.getTipo() == tipoDato.CADENA) {
        this.tipoDato = new Tipo(tipoDato.CADENA);
        return exp.toString();
      } else
        return new Errores(
          'SEMANTICO',
          'NO ES POSIBLE EL CASTEO POR TIPO DE DATO',
          this.fila,
          this.columna
        );
    } else if (this.expresion.tipoDato.getTipo() == tipoDato.CARACTER) {
      if (this.tipo.getTipo() == tipoDato.ENTERO) {
        this.tipoDato = new Tipo(tipoDato.ENTERO);
        var da = exp + '';
        var res = da.charCodeAt(0);
        return res;
      } else if (this.tipo.getTipo() == tipoDato.DECIMAL) {
        this.tipoDato = new Tipo(tipoDato.DECIMAL);
        var da = exp + '';
        var res = da.charCodeAt(0);
        return res;
      } else
        return new Errores(
          'SEMANTICO',
          'NO ES POSIBLE EL CASTEO POR TIPO DE DATO',
          this.fila,
          this.columna
        );
    } else
      return new Errores(
        'SEMANTICO',
        'NO ES POSIBLE EL CASTEO POR TIPO DE DATO',
        this.fila,
        this.columna
      );
  }
}
