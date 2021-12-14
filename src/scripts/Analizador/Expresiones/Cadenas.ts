import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class Cadena extends Instruccion {
    private valor1: Instruccion | undefined;
    private valor2: Instruccion | undefined;
    private valorUnario: Instruccion | undefined;
    private operacion: Operadores;
  
    constructor(
      operador: Operadores,
      fila: number,
      columna: number,
      op1: Instruccion,
      op2?: Instruccion
    ) {
      super(new Tipo(tipoDato.ENTERO), fila, columna);
      this.operacion = operador;
      if (!op2) this.valorUnario = op1;
      else {
        this.valor1 = op1;
        this.valor2 = op2;
      }
    }
    public getNodo(): nodoAST {
      let nodo = new nodoAST('ARITMETICA');
      if (this.valorUnario != null) {
        nodo.agregarHijo(this.operacion + '');
        nodo.agregarHijoAST(this.valorUnario.getNodo());
      } else {
        nodo.agregarHijoAST(this.valor1?.getNodo());
        nodo.agregarHijo(this.operacion + '', 'ar', this.operacion);
        nodo.agregarHijoAST(this.valor2?.getNodo());
      }
      return nodo;
    }
    public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
      let izq, der, uno;
      izq = der = uno = null;
      izq = this.valor1?.interpretar(arbol, tabla);
      if (izq instanceof Errores) return izq;
      der = this.valor2?.interpretar(arbol, tabla);
      if (der instanceof Errores) return der;
      switch (this.operacion) {
        case Operadores.CONCATENACION:
          return this.concatenacionCadenas(izq, der);
        case Operadores.DUPLICIDAD:
          return this.duplicarCadenas(izq, der);
        default:
          return new Errores(
            'ERROR SEMANTICO',
            'OPERADOR INVALIDO',
            this.fila,
            this.columna
          );
      }
    }

    /*----------------------------------------------------------CONCATENACION------------------------------------------------- */
    private concatenacionCadenas(izq: any, der: any){
        let op1 = this.valor1?.tipoDato.getTipo();
        let op2 = this.valor2?.tipoDato.getTipo();
        switch (
            op1 //operador 1
        ) {
            case tipoDato.CADENA:
                return this.op2Concatenacion(1, op2, izq, der);
            case tipoDato.CARACTER:
                return this.op2Concatenacion(2, op2, izq, der);
        }
    }

    private op2Concatenacion(numero: number, op2: any, izq: any, der: any){
        if (numero == 1) {
            //cadena
            switch (
              op2 //OPERADOR 2
            ) {
              case tipoDato.CADENA: //(Cadena & Cadena)
                this.tipoDato = new Tipo(tipoDato.CADENA);
                return izq + '' + der;
              case tipoDato.CARACTER: //(Cadena & caracter)
                this.tipoDato = new Tipo(tipoDato.CADENA);
                return izq + '' + der;
              default: //OTROS TIPOS DE DATOS
                //error
                return new Errores(
                  'SEMANTICO',
                  'ESTA OPERACION NO PUEDE EJECUTARSE CON OTRO TIPO DE DATO QUE NO SEA CADENA',
                  this.fila,
                  this.columna
                );
            }
          } else if (numero == 2) {
            //caracter
            switch (
              op2 //OPERADOR 2
            ) {
                case tipoDato.CADENA: //(Caracter & Cadena)
                    this.tipoDato = new Tipo(tipoDato.CADENA);
                    return izq + '' + der;
                case tipoDato.CARACTER: //(Caracter & caracter)
                    this.tipoDato = new Tipo(tipoDato.CADENA);
                    return izq + '' + der;
                default: //OTROS TIPOS DE DATOS
                    //error
                    return new Errores(
                    'SEMANTICO',
                    'ESTA OPERACION NO PUEDE EJECUTARSE CON OTRO TIPO DE DATO QUE NO SEA CADENA',
                    this.fila,
                    this.columna
                    );
            }
          }
    }

    /*----------------------------------------------------------DUPLICIDAD------------------------------------------------- */
    private duplicarCadenas(izq: any, der: any){
        let op1 = this.valor1?.tipoDato.getTipo();
        let op2 = this.valor2?.tipoDato.getTipo();
        switch (
            op1 //operador 1
        ) {
            case tipoDato.CADENA:
                return this.op2Duplicar(1, op2, izq, der);
            case tipoDato.CARACTER:
                return this.op2Duplicar(2, op2, izq, der);
        }
    }

    private op2Duplicar(numero: number, op2: any, izq: any, der: any){
        if (numero == 1) {
            //cadena
            switch (
              op2 //OPERADOR 2
            ) {
              case tipoDato.ENTERO: //(Cadena^Numero)
                this.tipoDato = new Tipo(tipoDato.CADENA);
                var palabra = izq + '';
                return palabra.repeat(parseInt(der));
              default: //OTROS TIPOS DE DATOS
                //error
                return new Errores(
                  'SEMANTICO',
                  'NO SE PUEDE UTILIZAR OTRO TIPO DE DATO DIFERENTE A ENTERO',
                  this.fila,
                  this.columna
                );
            }
          } else if (numero == 2) {
            //caracter
            switch (
              op2 //OPERADOR 2
            ) {
                case tipoDato.ENTERO: //(Caracter^Numero)
                    this.tipoDato = new Tipo(tipoDato.CADENA);
                    var palabra = izq + '';
                    return palabra.repeat(parseInt(der));
                default: //OTROS TIPOS DE DATOS
                    //error
                    return new Errores(
                    'SEMANTICO',
                    'NO SE PUEDE UTILIZAR OTRO TIPO DE DATO DIFERENTE A ENTERO',
                    this.fila,
                    this.columna
                    );
            }
          }
    }


  }
  export enum Operadores {
    CONCATENACION,
    DUPLICIDAD,
  }
  