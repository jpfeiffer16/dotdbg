using System.Net;
using System.Net.Sockets;
using System.Threading.Tasks;

namespace DotDbg
{
    public class DotDbgTcpListener : IDotDbgTcpListener
    {
        private readonly TcpListener listener;

        public DotDbgTcpListener(IPAddress address, int port)
        {
            this.listener = new TcpListener(address, port);
        }

        public async Task<IDotDbgTcpClient> AcceptTcpClientAsync()
        {
            return new DotDbgTcpClient(await this.listener.AcceptTcpClientAsync());
        }

        public void Start()
        {
            this.listener.Start();
        }
    }
}
