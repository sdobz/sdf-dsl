#!/usr/bin/env bash

qjs -I "./generate-ast.js" -e "console.log(generateAst());" > ast.js
