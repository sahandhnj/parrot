#!/bin/bash

rm -r app
node_modules/grunt/bin/grunt build 

cd client
npm run-script build
mv build ../app

cd ..
mv app/build app/public
node app.js