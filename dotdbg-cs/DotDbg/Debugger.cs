
using System;

namespace DotDbg
{
    public class Debgger : IDebugger
    {
        public event EventHandler OnBreakpoint;

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                //TODO: Do disposale stuff here
                // Kill the proc etc...
            }
        }

        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
