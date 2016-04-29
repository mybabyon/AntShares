namespace AntShares.Core
{
    export class Script
    {
        constructor(script)
        {
            this.stack = script.stack;
            this.redeem = script.redeem;
        }
        public stack: string;
        public redeem: string;
    }
}