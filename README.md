# Quetzal-JOLC

- [Quetzal-JOLC](#quetzal-jolc)
  - [Manuales](#manuales)
  - [Previa](#previa)
  - [Preparación](#preparación)

<p align="center">
  <a href="https://github.com/mhankbarbar"><img title="QuetzalOLC" src="https://img.shields.io/badge/QuetzalOLC-G31-blue?style=for-the-badge&logo=github"></a>
</p>

----
<p align="center">
  <a href="https://github.com/mhankbarbar"><img title="" src="https://img.shields.io/github/license/macochave/quetzalolc-compiladores2?style=flat&logo=github" > </a>
  <a href="https://github.com/mhankbarbar"><img title="" src="https://img.shields.io/npm/v/npm?style=flat&logo=npm" > </a>
  <a href="https://github.com/mhankbarbar"><img title="" src="https://img.shields.io/npm/v/jison?label=jison?style=flat&logo=npm" > </a>
  <a href="https://github.com/mhankbarbar"><img title="" src="https://img.shields.io/npm/v/codemirror?label=CodeMirror?style=flat&logo=npm" > </a>
</p>
----

## Manuales

- [Manual de usuario](./UserManual.md)
- [Manual técico](./TechniqueManual.md)

## Previa

- Instalar jison `npm i -g jison` para compilar la gramática
- Instalar browserify `npm i -g browserify` para crear el bundle

## Preparación

- Mantener actualizado los archivos javascript ante cualquier cambio: `npm run dev`
- Compilar la gramática jison: `npm run prepare`
- Generar el bundle para usarlo en el html: `npm run build`
