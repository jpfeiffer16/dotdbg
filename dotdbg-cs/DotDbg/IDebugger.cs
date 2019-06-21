using System;

namespace DotDbg
{
    public interface IDebugger : IDisposable
    {
        event EventHandler OnBreakpoint;
    }
}
