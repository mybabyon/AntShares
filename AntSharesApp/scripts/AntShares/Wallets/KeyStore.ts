namespace AntShares.Wallets
{
    export class KeyStore
    {
        constructor(name: string, value: Uint8Array)
        {
            this.Name = name;
            this.Value = value;
        }
        Name: string;
        Value: Uint8Array;
    }
}