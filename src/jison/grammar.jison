/**
 * CALCULADORA EN JISON
 */

/* DEFINICIÓN LÉXICA */
%lex

%options case-insensitive

%%

/* COMENTARIOS */
[/][*][^]*[*][/]    // COMENTARIO SIMPLE
[/][/].*            // COMENTARIO MULTIPLE

'print'                 return 'print';
'println'               return 'println';
'null'                  return 'null';
'true'                  return 'true';
'false'                 return 'false';

"("                     return '(';
")"                     return ')';
"["                     return '[';
"]"                     return ']';

"."                     return '.';

"+"                     return '+';
"-"                     return '-';
"*"                     return '*';
"/"                     return '/';
"%"                     return '%';

">="                    return '>=';
"<="                    return '<=';
">"                     return '>';
"<"                     return '<';
"!="                    return '!=';
"=="                    return '==';

"&&"                    return '&&';
"||"                    return '||';
"!"                     return '!';

"&"                     return '&';
"^"                     return '^';

["][^"]*["]             {
                            yytext = yytext.substr(1, yyleng - 2)
                            return 'cadena'
                        }
['](.|\\(w|d|s|b|t|n|r))['] {
                            yytext = yytext.substr(1, yyleng - 2)
                            return 'caracter'
                        }
[0-9]+([.][0-9]+)\b     return 'decimal';
[0-9]+\b                return 'entero';
([a-zA-Z])[a-zA-Z0-9_]* return 'identificador';

/* ESPACIOS EN BLANCO */
[\t\n\r]+           // TABS, RETORNO Y SALTOS
\s+                 // Espacios en blanco

.                       { setConsole(`Error léxico (${yytext}), en la línea ${yylloc.first_line} y columna ${yylloc.first_column}\n`) }

<<EOF>>                 return 'EOF';

/lex

%{
    const { Attribute } = require('../scripts/expressions/attribute')
    const { Objeto } = require('../scripts/expressions/object')
    const { Operacion, Operador } = require('../scripts/expressions/operation')
    const { Primitive } = require('../scripts/expressions/primitive')
    const { Print, Println } = require('../scripts/instructions/print')
    const { Type } = require('../scripts/ast/type')
    const { setConsole } = require('../scripts/shared')
%}

/* ASOCIACIÓN Y PRECEDENCIA */

%left '||'
%left '&&'
%left '!'
%left '==' '!=' '<' '<=' '>' '>='
%left '&'
%left '+' '-'
%left '*' '/'
%left '^'
%left '%'
%left UMENOS

%start START

%%

/* DEFINICIÓN DE GRAMÁTICA */

START
	: INSTRUCCIONES EOF
        {
            $$ = $1;
            return $$
        }
    ;

INSTRUCCIONES
    : INSTRUCCIONES INSTRUCCION
        { 
            $1.push($2)
            $$ = $1
        }
    | INSTRUCCION
        { $$ = [$1] }
    ;

INSTRUCCION
    : PRINT
        { $$ = $1 }
    ;

PRINT
    : print '(' EXPR ')'
        { $$ = new Print($3, @1.first_line, @1.first_column) }
    | println '(' EXPR ')'
        { $$ = new Println($3, @1.first_line, @1.first_column) }
    ;

EXPR
    : PRIMITIVA
        { $$ = $1 }
    | OP_LOGICA
        { $$ = $1 }
    | OP_RELACIONAL
        { $$ = $1 }
    | OP_ARITMETICA
        { $$ = $1 }
    ;

OP_LOGICA
    : EXPR '&&' EXPR
        { $$ = new Operacion($1, $3, Operador.AND, @1.first_line, @1.first_column) }
    | EXPR '||' EXPR
        { $$ = new Operacion($1, $3, Operador.OR, @1.first_line, @1.first_column) }
	| '!' EXPR
        { $$ = new Operacion($2, $2, Operador.NOT, @1.first_line, @1.first_column) }
    ;

OP_RELACIONAL
    : EXPR '!=' EXPR
        { $$ = new Operacion($1, $3, Operador.DIFERENTE, @1.first_line, @1.first_column) }
    | EXPR '==' EXPR
        { $$ = new Operacion($1, $3, Operador.IGUAL, @1.first_line, @1.first_column) }
    | EXPR '<' EXPR
        { $$ = new Operacion($1, $3, Operador.MENOR, @1.first_line, @1.first_column) }
    | EXPR '<=' EXPR
        { $$ = new Operacion($1, $3, Operador.MENOR_IGUAL, @1.first_line, @1.first_column) }
    | EXPR '>' EXPR
        { $$ = new Operacion($1, $3, Operador.MAYOR, @1.first_line, @1.first_column) }
    | EXPR '>=' EXPR
        { $$ = new Operacion($1, $3, Operador.MAYOR_IGUAL, @1.first_line, @1.first_column) }
    ;

OP_ARITMETICA
	: EXPR '+' EXPR
        { $$ = new Operacion($1, $3, Operador.SUMA, @1.first_line, @1.first_column) }
	| EXPR '-' EXPR
        { $$ = new Operacion($1, $3, Operador.RESTA, @1.first_line, @1.first_column) }
	| EXPR '*' EXPR
        { $$ = new Operacion($1, $3, Operador.MULTIPLICACION, @1.first_line, @1.first_column) }
	| EXPR '/' EXPR
        { $$ = new Operacion($1, $3, Operador.DIVISION, @1.first_line, @1.first_column) }
	| EXPR '^' EXPR
        { $$ = new Operacion($1, $3, Operador.REPETIR, @1.first_line, @1.first_column) }
	| EXPR '&' EXPR
        { $$ = new Operacion($1, $3, Operador.CONCAT, @1.first_line, @1.first_column) }
	| EXPR '%' EXPR
        { $$ = new Operacion($1, $3, Operador.MODULO, @1.first_line, @1.first_column) }
	| '(' EXPR ')'
        { $$ = $2 }
    | '-' EXPR %prec UMENOS
        { $$ = new Operacion($2, $2, Operador.NEGATIVO, @1.first_line, @1.first_column) }
    ;

PRIMITIVA
	: entero
        { $$ = new Primitive(Number($1), Type.INT, @1.first_column, @1.first_column) }
	| decimal
        { $$ = new Primitive(Number($1), Type.DOUBLE, @1.first_column, @1.first_column) }
	| cadena
        { $$ = new Primitive($1, Type.STRING, @1.first_column, @1.first_column) }
	| caracter
        { $$ = new Primitive($1, Type.CHAR, @1.first_column, @1.first_column) }
	| true
        { $$ = new Primitive(true, Type.BOOLEAN, @1.first_column, @1.first_column) }
	| false
        { $$ = new Primitive(false, Type.BOOLEAN, @1.first_column, @1.first_column) }
	| null
        { $$ = new Primitive(null, Type.NULL, @1.first_column, @1.first_column) }
    ;
