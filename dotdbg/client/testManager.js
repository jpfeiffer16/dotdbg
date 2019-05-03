const childProcess = require('child_process');
const PID_REGEX = /Process\sId:\s(\d*),/g;

module.exports = function TestManager(csproj) {
  function runTests(name) {
    const testProc = childProcess.exec(`dotnet test --filter ${name} ${csproj}`);
    testProc.stdout.pipe(process.stdout);
  }

  function runTestsWithDebugger(name, cb) {
    const testProc = childProcess.exec(
      `VSTEST_RUNNER_DEBUG=1 dotnet test --filter ${name} ${csproj}`
    );
    testProc.stdout.pipe(process.stdout);
    let curBuffer = '';
    testProc.stdout.on('data', function checkPid(chunk) {
      // Do regex testing here
      curBuffer += chunk;
      const matches = PID_REGEX.exec(curBuffer);
      if (matches && matches.length) {
        testProc.stdout.removeListener('data', checkPid);
        cb(parseInt(matches[1]));
      }
    });
  }
  
  return {
    runTests,
    runTestsWithDebugger
  };
}
