// const VsCodeProtocol = require('../vscode.js');
// const EventEmitter = require('events');


function DebuggerHandler(debuggerStream) {
  const requestQueue = [];
  // const events = new EventEmitter();
  // const protocol = new VsCodeProtocol(clientStream);
  let chunk = '';
  let currentLen = 0;
  debuggerStream.on('data', data => {
    const parsed = data
      .split('Content-Length: ')
      .map(i => i.trim())
      .filter(i => i.length)
      .map(i => 
        i.split('\n')
        .map(j => j.trim())
        .filter(j => j.length)
      );
    if (parsed.length) {
      parsed.forEach(group => {
        if (group.length === 2) {
          // currentLen = parseInt(group[0]);
          const length = parseInt(group[0]);
          if (length === group[1].length) {
            const response = JSON.parse(group[1]);
            requestQueue.forEach(cb => cb(response));
          } else {
            currentLen = length;
            chunk += group[1];
          }
        } else if (group.length === 1) {
          chunk += group[0];
          if (chunk.length === currentLen) {
            const response = JSON.parse(chunk);
            requestQueue.forEach(cb => cb(response));
          }
        }
      });
    }
  });

  function onResponse(cb) {
    requestQueue.push(cb);
  }

  return {
    onResponse
  };
}

module.exports = DebuggerHandler;
