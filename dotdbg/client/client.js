const net = require('net');
const fs = require('fs');
const childProcess = require('child_process');
const stream = require('stream');
const duplexer = require('duplexer');

const EditorHandler = require('./editorHandler.js');
const DebuggerHandler = require('./debuggerHandler.js');
const VsCodeProtocol = require('../vscode.js');
const UI = require('./client-ui.js');
const USE_SERVER = false;
const USE_MICROSOFT_DEBUGGER = false;

if (USE_SERVER) {
  const debuggerStream = net.createConnection({port: 1234}, () => {
    debuggerStream.setEncoding('utf8');
    debuggerStream.on('end', () => process.exit(0));
    init(debuggerStream);
  });
} else {
  const logFile = fs.createWriteStream('./log.txt', 'utf8');
  let commandStr = USE_MICROSOFT_DEBUGGER
    ? '~/.vscode/extensions/ms-vscode.csharp-1.17.1/.debugger/vsdbg-ui'
    :'~/Source/netcoredbg/bin/netcoredbg --interpreter=vscode';
  const dbgProc = childProcess.exec(commandStr);
  dbgProc.stdout.pipe(logFile);
  init(duplexer(dbgProc.stdin, dbgProc.stdout));
}

function init(debuggerStream) {
  const debuggerHandler = DebuggerHandler(debuggerStream);
  debuggerHandler.onResponse(response => {
    if (response.type === 'event' && response.event === 'exited') {
      // console.log(response.body.exitCode);
      process.exit(parseInt(response.body.exitCode));
    }
  });
  const protocol = new VsCodeProtocol(debuggerStream);
  const editorHandler = EditorHandler(net, protocol);
  const ui = UI(debuggerHandler, protocol, editorHandler);
  editorHandler.onInit(() => {
    ui.init();
  });
}
