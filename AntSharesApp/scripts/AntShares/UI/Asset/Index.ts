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

            let ul = $("#Tab_Asset_Index").find("ul:eq(0)");
            ul.find("li :visible").remove();
            for (let i = 0; i < wallet.coins.length; i++)
            {
                addAccountList(i)
            }
        }
    }

    function addAccountList(i: number)
    {
        let wallet = GlobalWallet.GetCurrentWallet();
        let ul = $("#Tab_Asset_Index").find("ul:eq(0)");
        let liTemplet = ul.find("li:eq(0)");
        let li = liTemplet.clone(true);
        li.removeAttr("style");
        li.find("span");
        li.find(".asset_address").text(wallet.coins[i].Address);
        li.find(".asset_value").text(wallet.coins[i].Value);
        GetAssetName(wallet.coins[i].AssetId, (name) =>
        {
            li.find(".asset_name").text(name);
            let a = li.find("a");
            let btn = li.find("button:eq(0)");
            ul.append(li);
        });
    }

    function GetAssetName(assetId: Uint8Array, callback: (name: string) => any)
    {
        let rpc = new AntShares.Network.RPC.RpcClient("http://seed1.antshares.org:20332/");
        //根据指定的高度（索引），返回对应区块的散列值
        rpc.call("getrawtransaction", [assetId],
            (tx: Core.RegisterTransaction) =>
            {
                callback(tx.asset.name[0].name);
            });
    }
}