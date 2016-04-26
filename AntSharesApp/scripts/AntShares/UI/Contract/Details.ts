namespace AntShares.UI.Contract
{
    export class Details extends TabBase
    {
        protected oncreate(): void
        {

        }

        protected onload(args: any[]): void
        {
            let i = args[0] as number;
            //$("#public_key").text(AccountList.List[i].PublicKeyHash.base58Encode());
        }
    }
}