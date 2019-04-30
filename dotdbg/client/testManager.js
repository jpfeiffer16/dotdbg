const childProcess = require('child_process');

module.exports = function TestManager(csproj) {
  function runTests(name) {
    const testProc = childProcess.exec(`dotnet test --filter ${name} ${csproj}`);
    testProc.stdout.pipe(process.stdout);
  }
  
  return {
    runTests
  };
}
