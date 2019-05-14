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

        public EditorHandler(IDotDbgTcpListener listener)
        {
            this.listener = listener;
        }

        public async Task Init()
        {
            this.listener.Start();
            using (var client = await this.listener.AcceptTcpClientAsync())
            {
                using (var reader = new StreamReader(client.GetStream()))
                {
                    var buffer = new char[MAX_BUFFER_SIZE];
                    while (true)
                    {
                        var readBytes = await reader.ReadAsync(buffer, 0, MAX_BUFFER_SIZE);
                        Console.WriteLine(readBytes);
                        var commandText = new String(buffer.Take(readBytes).ToArray());
                        this.OnEditorCommand(commandText);
                    }
                }
            }
        }


        private void OnEditorCommand(string commandText)
        {
            Console.WriteLine(commandText);
            try
            {
                var command = JsonConvert.DeserializeObject<JObject>(commandText);
                Console.WriteLine(command["Test"]);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }
    }
}
