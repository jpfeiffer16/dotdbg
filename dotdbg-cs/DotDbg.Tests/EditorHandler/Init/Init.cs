using NUnit.Framework;
using NSubstitute;
using System.Threading.Tasks;
using System.IO;
using System.Threading;

namespace DotDbg.Tests
{
    public class Init : Behavior
    {
        private IDotDbgTcpListener listener;
        private EditorHandler handler;
        private MemoryStream ms;

        public override void Given()
        {
            var client = Substitute.For<IDotDbgTcpClient>();
            this.ms = new MemoryStream();
            client.GetStream().Returns(ms);
            this.listener = Substitute.For<IDotDbgTcpListener>();
            this.listener.AcceptTcpClientAsync().Returns(
              Task.FromResult(client));
            this.handler = new EditorHandler(listener);
        }

        public override void When()
        {
            handler.Init().Wait();
            // Thread.Sleep(300);
            using (var msWriter = new StreamWriter(this.ms))
            {
                msWriter.Write(0);
                msWriter.Flush();
            }
            this.ms.Close();
        }

        [Test]
        public void ListenerStartWasCalled()
        {
            this.listener.Received().Start();
        }

    }
}
