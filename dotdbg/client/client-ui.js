
module.exports = function(debuggerHandler, protocol, editorHandler) {
  const blessed = require('blessed');
  // TODO: Remove this if we don't need it anymore.
  // const blessedContrib = require('blessed-contrib');
  const tree = require('./tree.js');
  const program = blessed.program();
  let screen;
  let frameId;
  let threads = [],
      threadList,
      stackList,
      localsList,
      expressionList,
      requestQueue = {},
      stackFrames,
      selectedThreadId,
      selectedFrameId;

  debuggerHandler.onResponse(response => {
    // NOTE: For now we are just dropping unsucessfull responses
    if (
      response.type === 'response'
      && response.success
      && requestQueue[response.request_seq]
    ) {
      requestQueue[response.request_seq](response);
      return;
    }
    if (response.type === 'event' && response.event === 'stopped') {
      protocol.getThreads();
      requestQueue[protocol.seq] = res => {
        setThreads(res.body.threads);
        setTimeout(() => {
          selectThread(parseInt(response.body.threadId));
        }, 100);
      };
    }
    // if (response.type === 'response' && response.command === 'threads') {
    //   setThreads(response.body.threads);
    // }
    if (response.type === 'response' && response.command === 'stackTrace') {
      setStackFrames(response.body.stackFrames);
    }
    if (response.type === 'response' && response.command === 'scopes') {
      response.body.scopes.forEach(scope => {
        protocol.getVariables(scope.variablesReference);
        requestQueue[protocol.seq] = (res) => {
          setScope(scope.name, res.body.variables);
        };
      });
    }
    if (response.type === 'response' && response.command === 'evaluate') {
      // expressionList.addItem(JSON.stringify(response));
      if (response.body) {
        // expressionList.addItem(`${response.body.variablesReference}: ${response.body.result}`);
        screen.render();
      }
    }
  });

  function init() {
    screen = blessed.screen({
      // smartCSR: true
      program
    });
    program.alternateBuffer();
    screen.title = 'DotDebug';

    threadList = blessed.list({
      label: 'Threads',
      keys: true,
      border: {
        type: 'line'
      },
      style: {
        selected: {
          bg: 'white',
          fg: 'black'
        }
      },
      mouse: true,
      width: '33%',
      vi: true,
      draggable: true
    });
    threadList.on('select', item => {
      const threadId = parseInt(item.content.split('-')[1]);
      selectedThreadId = threadId;
      protocol.getStack(threadId);
    });

    screen.append(threadList);
    threadList.focus();

    stackList = blessed.list({
      label: 'Stack',
      keys: true,
      border: {
        type: 'line'
      },
      style: {
        selected: {
          bg: 'white',
          fg: 'black'
        }
      },
      mouse: true,
      width: '33%',
      left: '33%',
      vi: true,
      draggable: true
    });
    stackList.on('select', item => {
      frameId = parseInt(item.content.split('-')[1]);
      selectedFrameId = frameId;
      protocol.getScopes(frameId);
      let frame = stackFrames.find(fr => fr.id === frameId);
      if (frame && frame.source) {
        editorHandler.highlighStackFrame(frame.source.path, parseInt(frame.line));
      }
    });

    screen.append(stackList);

    localsList = blessed.list({
      label: 'Locals',
      keys: true,
      border: {
        type: 'line',
      },
      style: {
        selected: {
          bg: 'white',
          fg: 'black'
        }
      },
      mouse: true,
      width: '33%',
      left: '66%',
      vi: true,
      draggable: true
    });
    localsList.on('select', item => {
      // protocol.evaluate(frameId, item.content.split(':')[1].trim());
      const varParts = item.content.split(':');
      const varRef = parseInt(varParts[0]);
      const varName = varParts[1];
      protocol.getVariables(varRef);
      setExpression(varName, varRef);

      expressionList.show();
      expressionList.focus();
    });
    screen.append(localsList);

    expressionList = tree({
      label: 'Expression Evaluation',
      fg: 'green',
      border: 'line',
      draggable: true,
      mouse: true,
      vi: true
    });
    screen.append(expressionList);
    expressionList.hide();

    // Key bindings
    screen.key('q', () => {
      screen.destroy();
      protocol.disconnect();
      editorHandler.closeConnections();
    });

    screen.key('C-n', () => {
      protocol.step(selectedThreadId);
    });

    screen.key('C-s', () => {
      protocol.stepIn(selectedThreadId);
    });

    screen.key('C-o', () => {
      protocol.stepOut(selectedThreadId);
    });

    screen.key('C-g', () => {
      protocol.continue(selectedThreadId);
      editorHandler.clearHighlightInCurrentFile();
    });

    screen.key('C-e', () => {
      screen.readEditor({}, (err, value) => {
        if (value && value.trim().length)
          setExpression(value, null);
      });
    });

    screen.render();
  }

  function setExpression(name, variablesReference) {
    expressionList.setData({
      extended: true,
      name: variablesReference ? `${variablesReference}: ${name}` : name,
      variablesReference,
      children: resolve
    });
    screen.render();
  }

  function resolve(self, resolvedCb) {
    if (!self.childrenContent) {
      if (self.variablesReference) {
        // Get variable with variablesReference
        protocol.getVariables(self.variablesReference);
        requestQueue[protocol.seq] = response => {
          if (response.body.variables) {
            const data = {};
            response.body.variables.forEach(variable => {
              data[`${variable.variablesReference}: ${variable.name} - ${variable.value}`] = {
                variablesReference: variable.variablesReference,
                children: resolve
              };
            });
            resolvedCb(data);
            screen.render();
          }
        };
      } else {
        // Evaluate expression
        protocol.evaluate(selectedFrameId, self.name);
        requestQueue[protocol.seq] = response => {
          if (request.body) {
            const data = {};
            // data[request.body.
          }
        }
      }
    }
  }

  function setThreads(th) {
    threads = th;
    threadList.clearItems();
    threads.forEach(thread => {
      threadList.addItem(`${thread.name}-${thread.id}`);
    });
    screen.render();
    if (threads.length) {
      protocol.getStack(threads[0].id);
    }
  }

  function setStackFrames(sfs) {
    stackFrames = sfs;
    stackList.clearItems();
    stackFrames.forEach(stackFrame => {
      stackList.addItem(stackFrame.name + '-' + stackFrame.id);
    });
    screen.render();
    if (stackFrames.length) {
      const firstFrame = stackFrames[0];
      selectedFrameId = firstFrame;
      protocol.getScopes(firstFrame.id);
      if (firstFrame.source) {
        editorHandler.highlighStackFrame(firstFrame.source.path, parseInt(firstFrame.line));
      }
    }
  }

  function setScope(name, variables) {
    if (variables.length) {
      if (name.toLowerCase() === 'locals') {
        localsList.clearItems();
        variables.forEach(variable => {
          localsList.addItem(variable.variablesReference + ': ' + variable.name + ' : ' + variable.value);
        });
        screen.render();
      }
    }
  }

  function selectThread(threadId) {
    //TODO: Select thread in list
    threadList.select(threads.indexOf(threads.find(th => th.id === threadId)));
    selectedThreadId = threadId;
    protocol.getStack(threadId);
    // threadList.pick(threads.indexOf(threads.find(th => th.id === threadId)));
  }

  return {
    init
  };
};
