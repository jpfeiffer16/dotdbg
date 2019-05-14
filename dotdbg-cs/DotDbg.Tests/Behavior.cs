namespace DotDbg.Tests
{
    public abstract class Behavior
    {
        public Behavior()
        {
            this.Given();
            this.When();
        }

        public abstract void When();

        public abstract void Given();

    }
}
