namespace AntShares.Core
{
    export class TransactionInput
    {
        constructor(public prevHash: string, public prevIndex: number)
        {
        }
        public toString()
        {
            return "{ prevHash: '" + this.prevHash + "', PrevIndex: '" + this.prevIndex + "' }"
        }
    }
}