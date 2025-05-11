#!/usr/bin/env bash

set -e # exit on error

cd web
npm install
npm run build
cd -
rm -rf server/handlers/web # cleanup previous build
mv web/dist server/handlers/web

cd server
go mod tidy
go build -tags web
cd -

# cleanup immediate build
rm -rf server/handlers/web

mv server/server finawise
