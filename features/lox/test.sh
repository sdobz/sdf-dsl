#!/usr/bin/env bash

for file in *.test.js; do
    echo "$file:"
    qjs "$file"
done
