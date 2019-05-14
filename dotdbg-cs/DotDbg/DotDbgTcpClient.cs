using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Sockets;

namespace DotDbg
{
    public class DotDbgTcpClient : IDotDbgTcpClient
    {
        private readonly TcpClient client;
        private List<Stream> streams = new List<Stream>();

        public DotDbgTcpClient(TcpClient client)
        {
            this.client = client;
        }

        public Stream GetStream()
        {
            var stream = this.client.GetStream();
            this.streams.Add(stream);
            return stream;
        }


        public virtual void Dispose(bool disposing)
        {
            Console.WriteLine(disposing);
            if (disposing)
            {
                this.client.Dispose();
                foreach (var stream in this.streams)
                {
                    stream.Dispose();
                }
            }
        }

        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

    }
}
