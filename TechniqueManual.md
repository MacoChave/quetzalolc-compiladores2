# Manual técnico

- [Manual técnico](#manual-técnico)
  - [Requisitos técnicos](#requisitos-técnicos)
    - [Comandos necesarios](#comandos-necesarios)
  - [Tecnologías utilizadas](#tecnologías-utilizadas)
  - [Gramática](#gramática)
    - [Palabras reservadas](#palabras-reservadas)
    - [Operaciones permitidas](#operaciones-permitidas)

## Requisitos técnicos

- Conexión a internet
- npm (Únicamente para hacer uso de los comandos de compilación)
- jison (Para generar la gramática)
- Typescript (Para traspilar el código a javascript puro)
- Browserify (Para la creación del Bundle)
### Comandos necesarios

```
"dev": "tsc -w",
"prepare": "jison ./src/scripts/Analizador/analizador.jison -o ./src/scripts/Analizador/analizador.js && cp ./src/scripts/Analizador/analizador.js ./dist/scripts/Analizador/analizador.js",
"build": "browserify dist/scripts/app.js --standalone load > bundle.js"
```
## Tecnologías utilizadas

- Typescript
- npm
- Jison
- Browserify

## Gramática

El lenguaje cuenta con una gramática ascendente y compilada con la herramienta jison

```
INSTRUCCION: 
    IMPRIMIR                            
    |DECLARACION   FINISHLINEA               
    |ASIGNACION    FINISHLINEA               
    |CONDICIONIF                        
    |CONDICIONWHILE                     
    |CONDICIONDOWHILE                   
    |CONDBREAK                          
    |CODCONTINUE                        
    |CONDRETURN FINISHLINEA                  
    |CONDSWITCH                         
    |CONDINCREMENTO  FINISHLINEA             
    |CONDECREMENTO FINISHLINEA               
    |CONDFOR                            
    |METODOS                            
    |LLAMADA  FINISHLINEA                    
    |EJECUTAR FINISHLINEA                    
    |FUNCIONES                          
    |VECTORES FINISHLINEA                    
    |ASIGVECTORES FINISHLINEA                
    |error FINISHLINEA                   
```
### Palabras reservadas

- main
- Tipos de dato
  - int
  - char
  - double
  - boolean
  - string
- Funciones
  - print
  - println
  - pow
  - sqrt
  - sin
  - cos
  - tan
- Del lenguaje
  - if
  - else
  - for
  - while
  - do
  - switch
  - break
  - continue
### Operaciones permitidas

- Aritméticas
  - Suma
  - Resta
  - División
  - Multiplicación
  - Módulo
- Relacionales
- Lógicas
  - And
  - Or
  - Not
- Matemáticas
  - Potencia
  - Raiz cuadrada
  - Seno
  - Coseno
  - Tangente
- Arreglos
  - Acceso
  - Modificadores
    - Push
    - Pop