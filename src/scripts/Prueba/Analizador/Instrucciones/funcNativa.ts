import obtenerValor from '../../Reportes/cambiarTipo';
import { Instruccion } from '../Abastracto/Instruccion';
import nodoAST from '../Abastracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Identificador from '../Expresiones/Identificador';
import Arbol from '../Simbolos/Arbol';
import tablaSimbolos from '../Simbolos/tablaSimbolos';
import Tipo, { tipoDato } from '../Simbolos/Tipo';

export default class funcNativa extends Instruccion {
  private identificador: string;
  private expresion: Instruccion;
  private ide: string;
  constructor(
    identificador: string,
    expresion: Instruccion,
    fila: number,
    columna: number
  ) {
    super(new Tipo(tipoDato.ENTERO), fila, columna);
    this.identificador = identificador.toLowerCase();
    this.expresion = expresion;
    if (expresion instanceof Identificador)
      this.ide = expresion.identificador.toString();
    else this.ide = '';
  }
  public getNodo() {
    let nodo = new nodoAST('FUNCION-NATIVA');
    nodo.agregarHijo(this.identificador);
    nodo.agregarHijo('(');
    nodo.agregarHijoAST(this.expresion.getNodo());
    nodo.agregarHijo(')');
    return nodo;
  }
  public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
    let exp = this.expresion.interpretar(arbol, tabla);
    if (exp instanceof Errores) return exp;
    switch (this.identificador) {
      case 'tolower':
        if (this.expresion.tipoDato.getTipo() != tipoDato.CADENA)
          return new Errores(
            'SEMANTICO',
            'TIPO DE DATO INCOMPATIBLE CON FUNCION TOLOWER',
            this.fila,
            this.columna
          );
        this.tipoDato = new Tipo(tipoDato.CADENA);
        return exp.toString().toLowerCase();
      case 'toupper':
        if (this.expresion.tipoDato.getTipo() != tipoDato.CADENA)
          return new Errores(
            'SEMANTICO',
            'TIPO DE DATO INCOMPATIBLE CON FUNCION TOUPPER',
            this.fila,
            this.columna
          );
        this.tipoDato = new Tipo(tipoDato.CADENA);
        return exp.toString().toUpperCase();
      case 'length':
        this.tipoDato = new Tipo(tipoDato.ENTERO);
        let vec = arbol.BuscarTipo(this.ide);
        if (vec == 'lista' || vec == 'vector') return exp.length;
        else if (this.expresion.tipoDato.getTipo() == tipoDato.CADENA)
          return exp.length;
        else
          return new Errores(
            'SEMANTICO',
            'TIPO DE DATO INCOMPATIBLE CON FUNCION LENGTH',
            this.fila,
            this.columna
          );
      case 'truncate':
        this.tipoDato = new Tipo(tipoDato.ENTERO);
        if (
          this.expresion.tipoDato.getTipo() == tipoDato.DECIMAL ||
          this.expresion.tipoDato.getTipo() == tipoDato.ENTERO
        )
          return Math.trunc(parseFloat(exp));
        else
          return new Errores(
            'SEMANTICO',
            'TIPO DE DATO INCOMPATIBLE CON FUNCION TRUNCATE',
            this.fila,
            this.columna
          );

      case 'round':
        this.tipoDato = new Tipo(tipoDato.ENTERO);
        if (
          this.expresion.tipoDato.getTipo() == tipoDato.DECIMAL ||
          this.expresion.tipoDato.getTipo() == tipoDato.ENTERO
        )
          return Math.round(parseFloat(exp));
        else
          return new Errores(
            'SEMANTICO',
            'TIPO DE DATO INCOMPATIBLE CON FUNCION ROUND',
            this.fila,
            this.columna
          );
      case 'typeof':
        this.tipoDato = new Tipo(tipoDato.CADENA);
        let tipo = arbol.BuscarTipo(this.ide);
        if (tipo == 'lista' || tipo == 'vector') return tipo.toString();
        else return obtenerValor(this.expresion.tipoDato.getTipo());
      case 'tostring':
        this.tipoDato = new Tipo(tipoDato.CADENA);
        if (
          this.expresion.tipoDato.getTipo() == tipoDato.DECIMAL ||
          this.expresion.tipoDato.getTipo() == tipoDato.ENTERO ||
          this.expresion.tipoDato.getTipo() == tipoDato.BOOLEANO ||
          this.expresion.tipoDato.getTipo() == tipoDato.CARACTER
        )
          return exp.toString();
        else
          return new Errores(
            'SEMANTICO',
            'TIPO DE DATO INCOMPATIBLE CON FUNCION TOSTRING',
            this.fila,
            this.columna
          );
      case 'tochararray':
        this.tipoDato = new Tipo(tipoDato.CARACTER);
        if (this.expresion.tipoDato.getTipo() == tipoDato.CADENA) {
          let arreglo = [];
          let cadena = exp.toString();
          for (let i = 0; i < cadena.length; i++) {
            arreglo.push(cadena[i]);
          }
          return arreglo;
        } else
          return new Errores(
            'SEMANTICO',
            'TIPO DE DATO INCOMPATIBLE CON FUNCION TOCHARARRAY',
            this.fila,
            this.columna
          );
      default:
        return new Errores(
          'SEMANTICO',
          'TIPO DE DATO INCOMPATIBLE CON FUNCION NATIVA',
          this.fila,
          this.columna
        );
    }
  }
}
