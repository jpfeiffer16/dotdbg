const path = require('path');
const uuidv4 = require('uuid/v4');

const VsCodeProtocol = function(stream) {
  this.stream = stream;
  Object.defineProperty(this, 'seq', {
    get: () => seq
  });

  this.init = () => {
    const initCommand = command('initialize');
    initCommand.arguments = {
        "clientID":"vscode",
        "clientName":"Visual Studio Code",
        "adapterID":"coreclr",
        "pathFormat":"path",
        "linesStartAt1":true,
        "columnsStartAt1":true,
        "supportsVariableType":true,
        "supportsVariablePaging":true,
        "supportsRunInTerminalRequest":true,
        "locale":"en-us"
    };
    sendCommand(initCommand);
  };

  this.launch = (dll, cwd = null) => {
    if (cwd === null) {
      cwd = path.parse(dll).dir;
    }

    const launchCommand = command('launch');
    launchCommand.arguments = {
      "name":".NET Core Launch (console)",
      "type":"coreclr",
      "request":"launch",
      "preLaunchTask":"build",
      "program": dll,
      "args":[
      ],
      "cwd" : cwd,
      // "console":"externalTerminal",
      "stopAtEntry":false,
      "logging":{"engineLogging":false},
      "__sessionId": uuidv4()
    };
    sendCommand(launchCommand);
  };

  this.launchConfig = (config) => {
    const launchCommand = command('launch');
    launchCommand.arguments = config;
    launchCommand.arguments["__sessionId"] = uuidv4();
    sendCommand(launchCommand);
  };

  this.attach = (processId) => {
    const attachCommand = command('attach');
    // {"command":"attach","arguments":{"name":".NET Core Attach","type":"coreclr","request":"attach","processId":"3340","logging":{"engineLogging":false},"__sessionId":"d5a30049-2f04-4e48-8d2d-e0fe79944ad2"},"type":"request","seq":2}
    attachCommand.arguments = {
      name: ".NET Core Attach",
      type: "coreclr",
      request: "attach",
      processId: processId.toString(),
      // logging:{"engineLogging":false},
      "__sessionId": uuidv4()
    };
    sendCommand(attachCommand);
  };

  this.setBreakpoints = (file, breakpoints) => {
    const fileName = path.parse(file).base;
    const breakpointsCommand = command('setBreakpoints');
    breakpointsCommand.arguments = {
      "source":{
        "name": fileName,
        "path": file
        },
      "lines": breakpoints,
      "breakpoints": breakpoints.map(br => ({line: br})),
      // [
        // {"line":138}
      // ],
      "sourceModified":false
    };
    sendCommand(breakpointsCommand);
  };
  
  this.endConfig = () => {
    const endConfigCommand = command('configurationDone');
    sendCommand(endConfigCommand);
  };

  this.getThreads = () => {
    const threadsCommand = command('threads');
    sendCommand(threadsCommand);
  };

  this.getStack = threadId =>  {
    const getStackCommand = command('stackTrace');
    getStackCommand.arguments = {
      threadId: parseInt(threadId)
    };
    sendCommand(getStackCommand);
  };

  this.getScopes = frameId => {
    const getScopesCommand = command('scopes');
    getScopesCommand.arguments = {
      frameId: parseInt(frameId)
    };
    sendCommand(getScopesCommand);
  };

  this.getVariables = variablesReference => {
    const getVariablesCommand = command('variables');
    getVariablesCommand.arguments = {
      variablesReference: parseInt(variablesReference)
    };
    sendCommand(getVariablesCommand);
  };

  this.evaluate = (frameId, expression) => {
    const evaluateCommand = command('evaluate');
    evaluateCommand.arguments = {
      expression,
      frameId
    };
    sendCommand(evaluateCommand);
  };

  this.step = (threadId) => {
    const nextCommand = command('next');
    nextCommand.arguments = {
      threadId
    };
    sendCommand(nextCommand);
  };

  this.stepIn = (threadId) => {
    const stepInCommand = command('stepIn');
    stepInCommand.arguments = {
      threadId
    };
    sendCommand(stepInCommand);
  };

  this.stepOut = (threadId) => {
    const stepOutCommand = command('stepOut');
    stepOutCommand.arguments = {
      threadId
    };
    sendCommand(stepOutCommand);
  };

  this.continue = (threadId) => {
    const continueCommand = command('continue');
    continueCommand.arguments = {
      threadId
    };
    sendCommand(continueCommand);
  };

  this.disconnect = () => {
    const disconnectCommand = command('disconnect');
    disconnectCommand.arguments = {
      terminateDebuggee: true
    };
    sendCommand(disconnectCommand);
  };

  const sendCommand = (command) => {
    command.seq = seq;
    const commandStr = JSON.stringify(command);
    stream.write(`Content-Length: ${commandStr.length}\r\n\r\n${commandStr}`);
  };

};

let seq = 0;

//ProtocolMessage
function command(commandName = null) {
  return {
    seq: ++seq,
    type: 'request',
    command: commandName,
    arguments: null,
  }
}

module.exports = VsCodeProtocol;
