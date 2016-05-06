namespace AntShares.UI.Asset
{
    export class Index extends TabBase
    {
        protected oncreate(): void
        {
        }

        protected onload(): void
        {
            let wallet = GlobalWallet.GetCurrentWallet();
            if (wallet.accounts.length <= 0)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            //TypescriptLinq的GroupBy貌似有Bug

            //let ul = $("#Tab_Asset_Index").find("ul:eq(0)");
            //ul.find("li :visible").remove();
            //for (let i = 0; i < wallet.accounts.length; i++)
            //{
            //    addAccountList(i)
            //}
        }
    }

    function addAccountList(i: number)
    {
        let ul = $("#Tab_Asset_Index").find("ul:eq(0)");
        let liTemplet = ul.find("li:eq(0)");
        let li = liTemplet.clone(true);
        li.removeAttr("style");
        let span = li.find("span");
        let a = li.find("a");
        let btn = li.find("button:eq(0)");
        ul.append(li);
    }
}