import { listaErrores } from '../../../indexControllers';
import { Instruccion } from '../../Abastracto/Instruccion';
import nodoAST from '../../Abastracto/nodoAST';
import Errores from '../../Excepciones/Errores';
import Arbol from '../../Simbolos/Arbol';
import tablaSimbolos from '../../Simbolos/tablaSimbolos';
import Tipo, { tipoDato } from '../../Simbolos/Tipo';
import Return from '../Return';

export default class condFor extends Instruccion {
  private declaracionAsignacion: Instruccion;
  private condicion: Instruccion;
  private actualizacion: Instruccion;
  private instrucciones: Instruccion[];
  constructor(
    declasignacion: Instruccion,
    condicion: Instruccion,
    actualizacion: Instruccion,
    instrucciones: Instruccion[],
    fila: number,
    columna: number
  ) {
    super(new Tipo(tipoDato.ENTERO), fila, columna);
    this.declaracionAsignacion = declasignacion;
    this.actualizacion = actualizacion;
    this.condicion = condicion;
    this.instrucciones = instrucciones;
  }

  public getNodo(): nodoAST {
    let nodo = new nodoAST('FOR');
    nodo.agregarHijo('for');
    nodo.agregarHijo('(');
    nodo.agregarHijoAST(this.declaracionAsignacion.getNodo());
    nodo.agregarHijo(';');
    nodo.agregarHijoAST(this.condicion.getNodo());
    nodo.agregarHijo(';');
    nodo.agregarHijoAST(this.actualizacion.getNodo());
    nodo.agregarHijo(')');
    nodo.agregarHijo('{');
    this.instrucciones.forEach((element) => {
      nodo.agregarHijoAST(element.getNodo());
    });
    nodo.agregarHijo('}');
    return nodo;
  }
  public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
    let nuevaTabla = new tablaSimbolos(tabla);
    nuevaTabla.setNombre('For');
    let declaAsig = this.declaracionAsignacion.interpretar(arbol, nuevaTabla);
    if (declaAsig instanceof Errores) return declaAsig;
    let val = this.condicion.interpretar(arbol, nuevaTabla);
    if (val instanceof Errores) return val;
    if (this.condicion.tipoDato.getTipo() != tipoDato.BOOLEANO) {
      return new Errores(
        'SEMANTICO',
        'DATO DEBE SER BOOLEANO',
        this.fila,
        this.columna
      );
    }
    while (this.condicion.interpretar(arbol, nuevaTabla)) {
      let otraTabla = new tablaSimbolos(nuevaTabla);
      otraTabla.setNombre('ForDentro');
      for (let i = 0; i < this.instrucciones.length; i++) {
        let a = this.instrucciones[i].interpretar(arbol, otraTabla);
        if (a instanceof Errores) {
          listaErrores.push(a);
          arbol.actualizaConsola((<Errores>a).returnError());
        }
        if (a instanceof Return) return a;
        if (a == 'ByLyContinue') break;
        if (a == 'ByLy23') return;
      }
      let valActualizacion = this.actualizacion.interpretar(arbol, nuevaTabla);
      if (valActualizacion instanceof Errores) return valActualizacion;
    }
  }
}
