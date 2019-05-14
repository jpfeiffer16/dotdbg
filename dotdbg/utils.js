const fs = require('fs');
const path = require('path');

module.exports = function () {

  function findBin(sourceFilePath) {
    //Get parent dir
    const sourcePath = path.parse(sourceFilePath);
    const parentDir = sourcePath.dir;
    if (parentDir === '/') throw 'Error: reached root dir';
    //Does it have a bin folder?
    //Yes - Recurse into the dir and find .dll
    //No - Recurse on this function and see if the parent of this parent has a 
    // bin dir. rinse and repeat.
    const files = fs.readdirSync(parentDir);
    const binFolders = files.filter(file => ~file.indexOf('bin'));
    return binFolders.length
      ? getBin(path.join(parentDir, binFolders[0]))
      : findBin(parentDir);
  }

  function getBin(binFolderPath) {
    const debugPath = path.join(binFolderPath, 'Debug');
    if (!fs.existsSync(debugPath)) throw 'Error: no Debug folder present';
    const frameworkFolders = fs.readdirSync(debugPath);
    if (frameworkFolders.length !== 1) throw 'Error: found more than one framework folder';
    const dllFolder = path.join(debugPath, frameworkFolders[0]);
    const distFiles = fs.readdirSync(dllFolder);
    const dllFiles = distFiles.filter(file => ~file.indexOf('.dll'));
    if (dllFiles.length !== 1) throw 'Error: did not find one dll file';
    return path.join(dllFolder, dllFiles[0]);
  }
  function getVsCodeLaunchFile(basePath) {
    //Get parent dir
    const baseFilePath = path.parse(basePath);
    const parentDir = baseFilePath.dir;
    if (parentDir === '/') throw 'Error: reached root dir';
    //Does it have a bin folder?
    //Yes - Recurse into the dir and find .dll
    //No - Recurse on this function and see if the parent of this parent has a 
    // bin dir. rinse and repeat.
    const files = fs.readdirSync(parentDir);
    const vscodeFolders = files.filter(file => ~file.indexOf('.vscode'));
    return vscodeFolders.length
      ? getLaunchJson(path.join(parentDir, vscodeFolders[0]))
      : getVsCodeLaunchFile(parentDir);
  }
  
  function getLaunchJson(vscodePath) {
    const launchJsonPath = path.join(vscodePath, 'launch.json');
    return fs.existsSync(launchJsonPath)
      ? launchJsonPath
      : null;
  }

  function getNearestCsproj(sourceFilePath) {
    //Get parent dir
    const sourcePath = path.parse(sourceFilePath);
    const parentDir = sourcePath.dir;
    if (parentDir === '/') throw 'Error: reached root dir';
    const files = fs.readdirSync(parentDir);
    const csprojs = files.filter(file => ~file.indexOf('.csproj'));
    return csprojs.length
      ? path.join(parentDir, csprojs[0])
      : getNearestCsproj(parentDir);
  }

  return {
    findBin,
    getVsCodeLaunchFile,
    getNearestCsproj
  };
};
