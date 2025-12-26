#!/bin/bash
cd /home/kavia/workspace/code-generation/multi-shop-billing-system-40677-40686/frontend_app
npm run lint
ESLINT_EXIT_CODE=$?
npm run build
BUILD_EXIT_CODE=$?
if [ $ESLINT_EXIT_CODE -ne 0 ] || [ $BUILD_EXIT_CODE -ne 0 ]; then
   exit 1
fi

