const utils = require('../utils.js')();
const fs = require('fs');
const readline = require('readline');
const VsCodeConfigEngine = require('../vscodeConfigEngine.js');
const TestManager = require('./testManager.js');

function EditorHandler(netModule, protocol, preSelectedDebuggerConfigNumber = null) {
  const editors = []
    initCallbacks = [];
  const controllerServer = netModule.createServer(socket => {
    protocol.init();
    socket.setEncoding('utf8');
    socket.on('data', data => {
      // console.log(data);

      const parsed = JSON.parse(data);
      if (parsed.length != 2) return;
      const seq = parsed[0];
      const command = parsed[1];
      editors.push({socket, seq});

      if (command.command === 'runTest') {
        const csproj = utils.getNearestCsproj(command.filename);
        const testManager = TestManager(csproj);
        testManager.runTests(command.name.replace(/\(/g, '').replace(/\)/g, ''));
      }

      if (command.command === 'debugProgram') {
        let file = parsed[1].file;
        let breakpoints = parsed[1].breakpoints;
        breakpoints = breakpoints.filter(br => 
          br.signs.filter(sn => sn.name === 'brk').length > 0
        );
        breakpoints.forEach(br => {
          br.signs = br.signs.filter(sn => sn.name === 'brk');
        });
        const launchJson = utils.getVsCodeLaunchFile(file);
        if (launchJson) {
          const configEngine = VsCodeConfigEngine(launchJson);
          // Interpolate special tokens in the config file
          configEngine.interpolate();
          const config = configEngine.getConfig();
          
          console.log('Select debugger configuration:');
          config.configurations.forEach((cfg, index) => {
            console.log(`${index}.) ${cfg.name}`);
          });
          const configSelector = readline.createInterface({
            input: process.stdin,
            // output: process.stdout
          });
          configSelector.question('', selected => {
            const selectedInt = parseInt(selected);
            if (
              isNaN(selected)
              || selectedInt < 0
              || selectedInt >= config.configurations.length
            ) {
              console.log('Must be a valid number in the above range');
              process.exit(1);
            }
            configSelector.close();
            initCallbacks.forEach(cb => cb());
            protocol.launchConfig(config.configurations[selectedInt]);
            init();
          })
        } else {
          const bin = utils.findBin(entryFile);
          initCallbacks.forEach(cb => cb());
          protocol.launch(bin);
          init();
        }
        function init() {
          breakpoints.forEach(br => {
            protocol.setBreakpoints(br.filename, br.signs.map(sn => sn.lnum));
          });
          protocol.endConfig();
        }
      }
    });
  });

  controllerServer.listen(4321);

  function highlighStackFrame(file, lineNumber) {
    editors.forEach(editor => {
      editor.socket.write(JSON.stringify(
        [
          0,
          {
            command: 'highlight',
            file,
            lineNumber
          }
        ]
      ));
    });
  }

  function clearHighlightInCurrentFile() {
    editors.forEach(editor => {
      editor.socket.write(JSON.stringify(
        [
          0,
          {
            command: 'clearHighlights'
          }
        ]
      ));
    });
  }

  function onInit(cb) {
    initCallbacks.push(cb);
  }

  return {
    highlighStackFrame,
    clearHighlightInCurrentFile,
    onInit
  };
}

module.exports = EditorHandler;
