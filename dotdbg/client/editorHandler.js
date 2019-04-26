const utils = require('../utils.js')();
const fs = require('fs');
const readline = require('readline');
const VsCodeConfigEngine = require('../vscodeConfigEngine.js');

const logStream = fs.createWriteStream('./client.log');

function EditorHandler(netModule, protocol, preSelectedDebuggerConfigNumber = null) {
  const editors = []
        initCallbacks = [];
  const controllerServer = netModule.createServer(socket => {
    socket.pipe(logStream);
    protocol.init();
    socket.setEncoding('utf8');
    socket.on('data', data => {
      console.log(data);
      return;
      const parsed = JSON.parse(data);
      const seq = parsed[0];
      editors.push({socket, seq});
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
    });
  });

  controllerServer.listen(1235);

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
