namespace AntShares.Core
{
    export interface Signable
    {
        sign(account: Wallets.AccountItem, callback: (signed: Uint8Array) => any)
    }
}