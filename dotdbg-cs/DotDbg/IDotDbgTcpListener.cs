using System.Threading.Tasks;

namespace DotDbg
{
    public interface IDotDbgTcpListener
    {
        void Start();
        Task<IDotDbgTcpClient> AcceptTcpClientAsync();
    }
}
