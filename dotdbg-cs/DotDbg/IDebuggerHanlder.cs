using System;

namespace DotDbg
{
    public interface IDebuggerHandler
    {
        IDebugger Run();
    }
}
