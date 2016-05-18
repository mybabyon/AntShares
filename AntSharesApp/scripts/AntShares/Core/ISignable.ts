namespace AntShares.Core
{
    export interface ISignable
    {
        Sign(account: Wallets.AccountItem, callback: (signed: Uint8Array) => any)
    }
}