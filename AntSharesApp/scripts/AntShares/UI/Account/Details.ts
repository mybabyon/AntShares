namespace AntShares.UI.Account
{
    export class Details extends TabBase
    {
        protected oncreate(): void
        {
            
        }

        protected onload(args: any[]): void
        {
            let i = args[0] as number;
            $("#public_key").text(AccountList.List[i].PublicKeyHash.base58Encode());
            //TODO:要将PrivateKey以WIF格式显示
            $("#private_key_import").text(AccountList.List[i].PrivateKey.base58Encode());

        }
    }
}