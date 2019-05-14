using System;
using System.IO;

namespace DotDbg
{
    public interface IDotDbgTcpClient : IDisposable
    {
        Stream GetStream();
    }
}
