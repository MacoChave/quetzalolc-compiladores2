# Quetzal-JOLC

- [Quetzal-JOLC](#quetzal-jolc)
  - [Manuales](#manuales)
  - [Previa](#previa)
  - [Preparación](#preparación)

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