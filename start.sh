#!/bin/bash
#
npm install

if [ "$NODE_ENV" == "production" ]
then
    gulp serve
else
    gulp serve:dev
fi