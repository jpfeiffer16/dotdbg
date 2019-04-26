// This contains code for parsing and interpolating config
// values found in vscode generated launch.json files
const fs = require('fs');


module.exports = function(launchFilePath) {
  const workspaceFolder = launchFilePath.split('.vscode')[0];
  let launchJson = fs.readFileSync(launchFilePath, 'utf8');
  let config;
  parse();

  function interpolate() {
    launchJson = launchJson
      .replace(/\${workspaceFolder}/g, workspaceFolder);
    parse();
  }

  function parse() {
    try {
      config = JSON.parse(
        launchJson
          .split('\n')
          .filter(line => !line.trim().startsWith('//'))
          .join('\n')
      );
    } catch (exception) {
      console.log('Error: Invalid launch.json');
      console.log(exception);
      process.exit(1);
    }
  }

  getConfig = () => config;

  return {
    getConfig,
    interpolate
  };
};
