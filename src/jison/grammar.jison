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

"("                     return '(';
")"                     return ')';
"["                     return '[';
"]"                     return ']';

"+"                     return '+';
"-"                     return '-';
"*"                     return '*';
"/"                     return '/';
"^"                     return '^';
"%"                     return '%';

["].*["]                {
                            yytext = yytext.substr(1, yyleng - 2)
                            return 'CADENA'
                        }
[0-9]+([.][0-9]+)?\b    return 'DECIMAL';
[0-9]+\b                return 'ENTERO';
([a-zA-Z])[a-zA-Z0-9_]* return 'IDENTIFICADOR';

/* ESPACIOS EN BLANCO */
[\t\n\r]+           // TABS, RETORNO Y SALTOS
\s+                 // Espacios en blanco

.                       { setConsole(`Error léxico (${yytext}), en la línea ${yylloc.first_line} y columna ${yylloc.first_column}\n`) }

<<EOF>>                 return 'EOF';

/lex

%{
%}

/* ASOCIACIÓN Y PRECEDENCIA */

%left '+' '-'
%left '*' '/'
%left '^'
%left '!'
%left '%'
%left UMENOS

%start expressions

%%

/* DEFINICIÓN DE GRAMÁTICA */

expressions
	: e EOF
        {
            $$ = $1;
            return $$
        }
;

e
	: e '+' e
        { $$ = $1 + $3; }
	| e '-' e
        { $$ = $1 - $3; }
	| e '*' e
        { $$ = $1 * $3; }
	| e '/' e
        { $$ = $1 / $3; }
	| e '^' e
        { $$ = Math.pow($1, $3); }
	| PARIZQ e PARDER
        { $$ = $2; }
	| '-' e %prec UMENOS
        { $$ = $2 *- 1; }
	| ENTERO
        { $$ = Number($1); }
	| DECIMAL
        { $$ = Number($1); }
;