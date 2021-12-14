import obtenerValor from '../../Reportes/cambiarTipo';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Identificador from '../Expresiones/Identificador';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

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
      case 'tolowercase':
        if (this.expresion.tipoDato.getTipo() != tipoDato.CADENA)
          return new Errores(
            'SEMANTICO',
            'TIPO DE DATO INCOMPATIBLE CON FUNCION TOLOWER',
            this.fila,
            this.columna
          );
        this.tipoDato = new Tipo(tipoDato.CADENA);
        return exp.toString().toLowerCase();
      case 'touppercase':
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
      case 'toint':
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
      case 'typeof':
        this.tipoDato = new Tipo(tipoDato.CADENA);
        let tipo = arbol.BuscarTipo(this.ide);
        if (tipo == 'lista' || tipo == 'vector') return tipo.toString();
        else return obtenerValor(this.expresion.tipoDato.getTipo());
      case 'string':
        this.tipoDato = new Tipo(tipoDato.CADENA);
        if (
          this.expresion.tipoDato.getTipo() == tipoDato.DECIMAL ||
          this.expresion.tipoDato.getTipo() == tipoDato.ENTERO ||
          this.expresion.tipoDato.getTipo() == tipoDato.BOOLEANO ||
          this.expresion.tipoDato.getTipo() == tipoDato.CARACTER
        )
          return exp.toString();
        else
          try {
            return exp.toString();
          } catch (error) {
            return new Errores(
              'SEMANTICO',
              'TIPO DE DATO INCOMPATIBLE CON FUNCION TOSTRING',
              this.fila,
              this.columna
            );
          }
      case 'int':
        if (this.expresion.tipoDato.getTipo() != tipoDato.CADENA)
          return new Errores(
            'SEMANTICO',
            'TIPO DE DATO INCOMPATIBLE CON FUNCION INT',
            this.fila,
            this.columna
          );
        this.tipoDato = new Tipo(tipoDato.CADENA);
        try {
          return parseInt(exp.toString());
        } catch (error) {
          return new Errores(
            'SEMANTICO',
            'NO SE PUEDE CONVERTIR CADENAS DE CARACTERES A INT',
            this.fila,
            this.columna
          );
        }
      case 'double':
        if (this.expresion.tipoDato.getTipo() != tipoDato.CADENA)
          return new Errores(
            'SEMANTICO',
            'TIPO DE DATO INCOMPATIBLE CON FUNCION DOUBLE',
            this.fila,
            this.columna
          );
        this.tipoDato = new Tipo(tipoDato.CADENA);
        try {
          return parseFloat(exp.toString());
        } catch (error) {
          return new Errores(
            'SEMANTICO',
            'NO SE PUEDE CONVERTIR CADENAS DE CARACTERES A DOUBLE',
            this.fila,
            this.columna
          );
        }
      case 'boolean':
        if (this.expresion.tipoDato.getTipo() != tipoDato.CADENA)
          return new Errores(
            'SEMANTICO',
            'TIPO DE DATO INCOMPATIBLE CON FUNCION BOOLEAN',
            this.fila,
            this.columna
          );
        this.tipoDato = new Tipo(tipoDato.CADENA);
        try {
          let valor = exp.toString();
          if(valor == '1' || valor.toLowerCase() == 'true'){
            return true;
          }else if(valor == '0' || valor.toLowerCase() == 'false'){
            return false;
          }else{
            return new Errores(
              'SEMANTICO',
              'NO SE PUEDE CONVERTIR ESTA CADENA A BOOLEAN',
              this.fila,
              this.columna
            );
          }
          
        } catch (error) {
          return new Errores(
            'SEMANTICO',
            'NO SE PUEDE CONVERTIR ESTA CADENA A BOOLEAN',
            this.fila,
            this.columna
          );
        }
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