import nodoAST from '../Abstracto/nodoAST';
import Errores from '../Excepciones/Errores';
import Asignacion from '../Instrucciones/Asignacion';
import Declaracion from '../Instrucciones/Declaracion';
import declaracionVectores from '../Instrucciones/declaracionVectores';
import Funciones from '../Instrucciones/Funciones';
import Metodos from '../Instrucciones/Metodos';
import Arbol from '../TS/Arbol';
import tablaSimbolos from '../TS/tablaSimbolos';
import graficarArbol from '../../Reportes/graficar';
import asignacionVector from '../Instrucciones/asignacionVector';
import Main from '../Instrucciones/Main';

export let listaErrores: Array<Errores>;
let arbolNuevo: Arbol;
let contador: number;
let cuerpo: string;
//tablas arboles y excepcciones
export class ControlInterprete {
  public interpretar(texto_Entrada: string) {
    listaErrores = new Array<Errores>();
    let parser = require('../../Analizador/analizador');
    let entrada = texto_Entrada;
    console.log('Analizando....')
    //console.log(entrada);
    try {
      let ast = new Arbol(parser.parse(entrada));
      var tabla = new tablaSimbolos();
      ast.settablaGlobal(tabla);
      //Manejo de pasadas

      //busqueda y guardado de funciones o metodos
      for (let i of ast.getinstrucciones()) {
        if ((i instanceof Metodos || i instanceof Funciones)) {
          ast.getfunciones().push(i);
        }
      }

      for (let i of ast.getinstrucciones()) {
          //busqueda de errores y actualizacion de consola
        if (i instanceof Errores) {
          listaErrores.push(i);
          ast.actualizaConsola((<Errores>i).returnError());
        }
        //si encuentra metodos o funciones que continue
        if (i instanceof Metodos || i instanceof Funciones)
          continue;
        if (
          i instanceof Declaracion ||
          i instanceof Asignacion ||
          i instanceof declaracionVectores ||
          i instanceof asignacionVector
        ) {
          var resultador = i.interpretar(ast, tabla);
          if (resultador instanceof Errores) {
            listaErrores.push(resultador);
            ast.actualizaConsola((<Errores>resultador).returnError());
          }
        } else {
          let error = new Errores(
            'SEMANTICO',
            'SENTENCIA FUERA DE METODO',
            i.fila,
            i.columna
          );
          listaErrores.push(error);
          ast.actualizaConsola((<Errores>error).returnError());
        }
      }
      
      arbolNuevo = ast;
      console.log(ast.getSimbolos());
      console.log(ast.getfunciones());
      console.log(ast.getconsola());
      /*res.send({
        resultado: ast.getconsola(),
        errores: listaErrores,
        tabla: ast.getSimbolos(),
      });*/
    } catch (err) {
      //res.json({ error: err, errores: listaErrores });
    }
  }
  public graficar(req: Request, res: Response) {
    let otro = arbolNuevo;
    if (otro == null) return //res.json({ msg: false });
    let arbolAst = new nodoAST('RAIZ');
    let nodoINS = new nodoAST('INSTRUCCIONES');
    otro.getinstrucciones().forEach((element) => {
      nodoINS.agregarHijoAST(element.getNodo());
    });
    arbolAst.agregarHijoAST(nodoINS);
    graficarArbol(<nodoAST>arbolAst);
    return ""//res.json({ msg: true });
  }
}
