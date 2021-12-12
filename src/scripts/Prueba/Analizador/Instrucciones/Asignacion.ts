import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';

export default class Asignacion extends Instruccion {
  private identificador: string;
  private valor: Instruccion;
  constructor(
    identificador: string,
    valor: Instruccion,
    fila: number,
    columna: number
  ) {
    super(new Tipo(tipoDato.ENTERO), fila, columna);
    this.identificador = identificador.toLowerCase();
    this.valor = valor;
  }
  public getNodo(): nodoAST {
    let nodo = new nodoAST('ASIGNACION');
    nodo.agregarHijo(this.identificador);
    nodo.agregarHijo('=');
    nodo.agregarHijoAST(this.valor.getNodo());
    nodo.agregarHijo(';');
    return nodo;
  }
  public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
    //tomar el tipoDato de la variable
    let variable = tabla.getVariable(this.identificador);
    if (variable != null) {
      let val = this.valor.interpretar(arbol, tabla);
      if (variable.gettipo().getTipo() != this.valor.tipoDato.getTipo()) {
        return new Errores(
          'SEMANTICO',
          'VARIABLE ' + this.identificador + ' TIPOS DE DATOS DIFERENTES',
          this.fila,
          this.columna
        );
      } else {
        variable.setvalor(val);
        arbol.actualizarTabla(
          this.identificador,
          variable.getvalor(),
          this.fila.toString(),
          tabla.getNombre().toString(),
          this.columna.toString()
        );
        //identificadorm,
        //actualizar valor de la tabla y no crear otra equis des
      }
    } else {
      console.log(this.identificador);
      return new Errores(
        'SEMANTICO',
        'VARIABLE ' + this.identificador + ' NO EXISTE',
        this.fila,
        this.columna
      );
    }
  }
}
