using System.IO;
using System.Threading.Tasks;
using NSubstitute;
using NUnit.Framework;

namespace DotDbg.Tests
{

    public class Init : Behavior
    {
        private IDotDbgTcpClient listenertwo;
        private IDotDbgTcpListener listener;
        private EditorHandler handler;
        private IDotDbgTcpClient client;
        private MemoryStream ms;

        public override void Given()
        {
            this.client = Substitute.For<IDotDbgTcpClient>();
            this.ms = new MemoryStream(100);
            client.Stream.Returns(ms);
            this.listener = Substitute.For<IDotDbgTcpListener>();
            this.listener.AcceptTcpClientAsync().Returns(
              Task.FromResult(client));
            this.handler = new EditorHandler(listener);
        }

        public override void When()
        {
            handler.Init().Wait();
            this.ms.Close();
            this.client.Dispose();
            this.client.Dispose();
        }

        [Test]
        public void ListenerStartWasCalled()
        {
            this.listener.Received().Start();
        }

        [Test]
        public void ClientGetSteamWasCalled()
        {
            this.client.Received().Stream;
        }

    }
}
