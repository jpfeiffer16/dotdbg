using System.Net;
using System.Threading.Tasks;

namespace DotDbg
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var ipAddress = IPAddress.Parse("127.0.0.1");
            var listener = new DotDbgTcpListener(ipAddress, 4322);

            var debuggerHandler = new DebuggerHandler();
            var handler = new EditorHandler(listener, debuggerHandler);

            while (true)
            {
                await handler.Init();
            }
        }
    }
}
