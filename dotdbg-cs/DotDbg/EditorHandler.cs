using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DotDbg
{
    public class EditorHandler
    {
        private const int MAX_BUFFER_SIZE = 2048;
        private readonly IDotDbgTcpListener listener;
        private readonly IDebuggerHandler debuggerHandler;
        private IDotDbgTcpClient client;

        public EditorHandler(IDotDbgTcpListener listener, IDebuggerHandler debuggerHandler)
        {
            this.listener = listener;
            this.debuggerHandler = debuggerHandler;
        }

        private void BreakpointHit(object sender, EventArgs e)
        {
            // TODO: Send breakpoint info back to listening socket here
            throw new NotImplementedException();
        }

        public async Task Init()
        {
            this.listener.Start();
            using (this.client = await this.listener.AcceptTcpClientAsync())
            {
                using (var reader = new StreamReader(client.GetStream()))
                {
                    var buffer = new char[MAX_BUFFER_SIZE];
                    while (true)
                    {
                        var bytesRead = await reader.ReadAsync(buffer, 0, MAX_BUFFER_SIZE);
                        if (bytesRead == 0) break;
                        var commandText = new String(buffer.Take(bytesRead).ToArray());
                        this.OnEditorCommand(commandText);
                    }
                }
            }
        }


        private void OnEditorCommand(string commandText)
        {
            try
            {
                var command = JsonConvert.DeserializeObject<JObject>(commandText);
                var commandType = command["Command"].ToString();
                Console.WriteLine(commandType);
                if (commandType == "debugProgram")
                {
                    this.debuggerHandler.Run();
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }
    }
}
