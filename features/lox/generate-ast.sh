#!/usr/bin/env bash

qjs -I "./generate-ast.js" -e "console.log(generateExpr());" > expr.js
qjs -I "./generate-ast.js" -e "console.log(generateStmt());" > stmt.js
