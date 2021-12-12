import { Instruccion } from '../Abastracto/Instruccion';
import nodoAST from '../Abastracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../Simbolos/Arbol';
import tablaSimbolos from '../Simbolos/tablaSimbolos';
import Tipo, { tipoDato } from '../Simbolos/Tipo';
import Declaracion from './Declaracion';
import Metodos from './Metodos';

export default class Exec extends Instruccion {
  private identificador: String;
  private parametros: Instruccion[];
  constructor(
    identificador: String,
    parametros: Instruccion[],
    fila: number,
    columna: number
  ) {
    super(new Tipo(tipoDato.ENTERO), fila, columna);
    this.identificador = identificador.toLowerCase();
    this.parametros = parametros;
  }
  public getNodo(): nodoAST {
    let nodo = new nodoAST('EXEC');
    nodo.agregarHijo('exec');
    nodo.agregarHijo(this.identificador + '');
    nodo.agregarHijo('(');
    this.parametros.forEach((element) => {
      nodo.agregarHijoAST(element.getNodo());
    });
    nodo.agregarHijo(')');
    nodo.agregarHijo(';');
    return nodo;
  }
  public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
    let funcion = arbol.getFuncion(this.identificador);
    if (funcion == null)
      return new Errores(
        'SEMANTICO',
        'NO SE ENCONTRO LA FUNCION',
        this.fila,
        this.columna
      );
    if (funcion instanceof Metodos) {
      let metodo = <Metodos>funcion;
      if (metodo.parametros.length == this.parametros?.length) {
        let nuevaTabla = new tablaSimbolos(arbol.gettablaGlobal());
        for (let param = 0; param < this.parametros.length; param++) {
          let newVal = this.parametros[param].interpretar(arbol, tabla);
          if (newVal instanceof Errores) return newVal;
          let dec = new Declaracion(
            metodo.parametros[param].tipato,
            metodo.fila,
            metodo.columna,
            metodo.parametros[param].identificador
          );
          let nuevaDec = dec.interpretar(arbol, nuevaTabla);
          if (nuevaDec instanceof Errores) return nuevaDec;

          let variable = nuevaTabla.getVariable(
            metodo.parametros[param].identificador
          );
          if (variable != null) {
            if (
              variable.gettipo().getTipo() !=
              this.parametros[param].tipoDato.getTipo()
            ) {
              return new Errores(
                'SEMANTICO',
                'VARIABLE ' +
                  metodo.parametros[param].identificador +
                  ' TIPOS DE DATOS DIFERENTES',
                this.fila,
                this.columna
              );
            } else {
              variable.setvalor(newVal);
              nuevaTabla.setNombre(funcion.identificador);
            }
          } else {
            return new Errores(
              'SEMANTICO',
              'VARIABLE ' +
                metodo.parametros[param].identificador +
                ' NO EXISTE',
              this.fila,
              this.columna
            );
          }
        }
        let nuevMet = metodo.interpretar(arbol, nuevaTabla);
        if (nuevMet instanceof Errores) return nuevMet;
      } else {
        return new Errores(
          'SEMANTICO',
          'PARAMETROS NO COINCIDENTES',
          this.fila,
          this.columna
        );
      }
    }
  }
}
