import { reporteTabla } from '../../Reportes/reporteTabla';
import { Instruccion } from '../Abstracto/Instruccion';
import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Arbol from '../TS/Arbol';
import Simbolo from '../TS/Simbolo';
import tablaSimbolos from '../TS/tablaSimbolos';
import Tipo, { tipoDato } from '../TS/Tipo';
import obtenerValor from '../../Reportes/cambiarTipo';
export default class Declaracion extends Instruccion {
  private tipo: Tipo;
  private identificador: string;
  private valor: Instruccion | undefined;
  constructor(
    tipo: Tipo,
    fila: number,
    columna: number,
    id: string,
    valor?: Instruccion
  ) {
    super(tipo, fila, columna);
    this.tipo = tipo;
    this.identificador = id;
    this.valor = valor;
  }
  public getNodo(): nodoAST {
    let nodo = new nodoAST('DECLARACION');
    nodo.agregarHijo(obtenerValor(this.tipo.getTipo()) + '');
    nodo.agregarHijo(this.identificador);
    if (this.valor != undefined) {
      nodo.agregarHijo('=');
      nodo.agregarHijoAST(this.valor.getNodo());
    }
    nodo.agregarHijo(';');
    return nodo;
  }
  public interpretar(arbol: Arbol, tabla: tablaSimbolos) {
    if (this.valor === undefined) {
      switch (this.tipo.getTipo()) {
        case tipoDato.ENTERO:
          if (
            tabla.setVariable(new Simbolo(this.tipo, this.identificador, 0)) ==
            'La variable existe actualmente'
          ) {
            return new Errores(
              'SEMANTICO',
              'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE',
              this.fila,
              this.columna
            );
          } else {
            if (
              !arbol.actualizarTabla(
                this.identificador,
                '0',
                this.fila.toString(),
                tabla.getNombre().toString(),
                this.columna.toString()
              )
            ) {
              let nuevoSimbolo = new reporteTabla(
                this.identificador,
                '0',
                'Variable',
                obtenerValor(this.tipo.getTipo()) + '',
                tabla.getNombre(),
                this.fila.toString(),
                this.columna.toString()
              );
              arbol.listaSimbolos.push(nuevoSimbolo);
            }
          }
          break;
        case tipoDato.DECIMAL:
          if (
            tabla.setVariable(
              new Simbolo(this.tipo, this.identificador, 0.0)
            ) == 'La variable existe actualmente'
          ) {
            return new Errores(
              'SEMANTICO',
              'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE',
              this.fila,
              this.columna
            );
          } else {
            if (
              !arbol.actualizarTabla(
                this.identificador,
                '0.0',
                this.fila.toString(),
                tabla.getNombre().toString(),
                this.columna.toString()
              )
            ) {
              let nuevoSimbolo = new reporteTabla(
                this.identificador,
                '0.0',
                'Variable',
                obtenerValor(this.tipo.getTipo()) + '',
                tabla.getNombre(),
                this.fila.toString(),
                this.columna.toString()
              );
              arbol.listaSimbolos.push(nuevoSimbolo);
            }
          }
          break;
        case tipoDato.CARACTER:
          if (
            tabla.setVariable(
              new Simbolo(this.tipo, this.identificador, '\u0000')
            ) == 'La variable existe actualmente'
          ) {
            return new Errores(
              'SEMANTICO',
              'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE',
              this.fila,
              this.columna
            );
          } else {
            if (
              !arbol.actualizarTabla(
                this.identificador,
                '\u0000',
                this.fila.toString(),
                tabla.getNombre().toString(),
                this.columna.toString()
              )
            ) {
              let nuevoSimbolo = new reporteTabla(
                this.identificador,
                '\u0000',
                'Variable',
                obtenerValor(this.tipo.getTipo()) + '',
                tabla.getNombre(),
                this.fila.toString(),
                this.columna.toString()
              );
              arbol.listaSimbolos.push(nuevoSimbolo);
            }
          }
          break;
        case tipoDato.CADENA:
          if (
            tabla.setVariable(new Simbolo(this.tipo, this.identificador, '')) ==
            'La variable existe actualmente'
          ) {
            return new Errores(
              'SEMANTICO',
              'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE',
              this.fila,
              this.columna
            );
          } else {
            if (
              !arbol.actualizarTabla(
                this.identificador,
                '',
                this.fila.toString(),
                tabla.getNombre().toString(),
                this.columna.toString()
              )
            ) {
              let nuevoSimbolo = new reporteTabla(
                this.identificador,
                '',
                'Variable',
                obtenerValor(this.tipo.getTipo()) + '',
                tabla.getNombre(),
                this.fila.toString(),
                this.columna.toString()
              );
              arbol.listaSimbolos.push(nuevoSimbolo);
            }
          }
          break;
        case tipoDato.BOOLEANO:
          if (
            tabla.setVariable(
              new Simbolo(this.tipo, this.identificador, true)
            ) == 'La variable existe actualmente'
          ) {
            return new Errores(
              'SEMANTICO',
              'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE',
              this.fila,
              this.columna
            );
          } else {
            if (
              !arbol.actualizarTabla(
                this.identificador,
                'true',
                this.fila.toString(),
                tabla.getNombre().toString(),
                this.columna.toString()
              )
            ) {
              let nuevoSimbolo = new reporteTabla(
                this.identificador,
                'true',
                'Variable',
                obtenerValor(this.tipo.getTipo()) + '',
                tabla.getNombre(),
                this.fila.toString(),
                this.columna.toString()
              );
              arbol.listaSimbolos.push(nuevoSimbolo);
            }
          }
          break;
      }
    } else {
      let val = this.valor.interpretar(arbol, tabla);
      if (this.tipo.getTipo() != this.valor.tipoDato.getTipo()) {
        return new Errores(
          'SEMANTICO',
          'TIPO DE VALOR DIFERENTE',
          this.fila,
          this.columna
        );
      } else {
        if (
          tabla.setVariable(new Simbolo(this.tipo, this.identificador, val)) ==
          'La variable existe actualmente'
        ) {
          return new Errores(
            'SEMANTICO',
            'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE',
            this.fila,
            this.columna
          );
        } else {
          if (
            !arbol.actualizarTabla(
              this.identificador,
              val,
              this.fila.toString(),
              tabla.getNombre().toString(),
              this.columna.toString()
            )
          ) {
            let nuevoSimbolo = new reporteTabla(
              this.identificador,
              val,
              'Variable',
              obtenerValor(this.tipo.getTipo()) + '',
              tabla.getNombre(),
              this.fila.toString(),
              this.columna.toString()
            );
            arbol.listaSimbolos.push(nuevoSimbolo);
          }
        }
      }
    }
  }
}
