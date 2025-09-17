#!/usr/bin/env bash

echo "Serving on http://localhost:8080/"

busybox httpd -f -p 8080
