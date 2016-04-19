namespace AntShares.Wallets
{
    export class KeyStore
    {
        constructor(name: string, value:any)
        {
            this.Name = name;
            this.Value = value;
        }
        Name: string;
        Value: any;
    }
}