namespace AntShares.Core
{
    export interface Serializable
    {
        serialize(account: Wallets.AccountItem, callback: (signed: Uint8Array) => any)
    }
}