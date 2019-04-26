#!/usr/bin/env node

const childProcess = require('child_process');
const fs = require('fs');

const netcat = childProcess.exec('netcat -l -p 4711');
const vsdbgUi = childProcess.exec(
  '~/.vscode/extensions/ms-vscode.csharp-1.17.1/.debugger/vsdbg-ui'
);

netcat.stdout.pipe(vsdbgUi.stdin);
netcat.stdout.pipe(fs.createWriteStream('./in.log'));
vsdbgUi.stdout.pipe(netcat.stdin);
vsdbgUi.stdout.pipe(fs.createWriteStream('./out.log'));
