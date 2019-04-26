#!/usr/bin/env node

const net = require('net');
const fs = require('fs');
const childProcess = require('child_process');
const stream = require('stream');
const VsCodeProtocol = require('./vscode.js');

const USE_MICROSOFT_DEBUGGER = false;
const logFile = fs.createWriteStream('./log.txt', 'utf8');
let commandStr = USE_MICROSOFT_DEBUGGER
  ? '~/.vscode/extensions/ms-vscode.csharp-1.17.1/.debugger/vsdbg-ui'
  :'~/Source/netcoredbg/bin/netcoredbg --interpreter=vscode';
const dbgProc = childProcess.exec(commandStr);
dbgProc.stdout.pipe(logFile);
dbgProc.stdout.pipe(process.stdout);

const server = net.createServer(socket => {
  socket.on('end', () => {
    process.exit(0);
  });
  dbgProc.stdout.pipe(socket);
  socket.pipe(dbgProc.stdin);
  socket.pipe(process.stdout);
});

server.listen(1234);

