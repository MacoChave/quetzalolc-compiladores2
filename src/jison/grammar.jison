/**
 * CALCULADORA EN JISON
 */

/* DEFINICIÓN LÉXICA */
%lex

%options case-insensitive

%%

"("                 return '(';
")"                 return ')';
"["                 return '[';
"]"                 return ']';

"+"                 return '+';
"-"                 return '-';
"*"                 return '*';
"/"                 return '/';
"^"                 return '^';
"%"                 return '%';

/* ESPACIOS EN BLANCO */
[ \r\t]+            {}
\n                  {}

[0-9]+("."[0-9]+)?\b    return 'DECIMAL';
[0-9]+\b                return 'ENTERO';

<<EOF>>                 return 'EOF';

.                       { setConsole(`Error léxico (${yytext}), en la línea ${yylloc.first_line} y columna ${yylloc.first_column}`) }

/lex

%{
    const setConsole = (str) => {
        document.querySelector('#my_console').value += str;
    };
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