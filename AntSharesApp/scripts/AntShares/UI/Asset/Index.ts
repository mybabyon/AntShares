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

            let ul = $("#Tab_Asset_Index").find("ul:eq(0)");
            ul.find("li :visible").remove();
            if (wallet.coins.length <= 0)
            {
                $("h5").show();
                return;
            }
            else
            {
                $("h5").hide();
            }
            let group = new Array<CoinItem>();
            for (let i of wallet.coins)
            {
                let index = CoinsIndexof(group, i);
                if (index < 0)
                {
                    group.push(i);
                }
                else
                {
                    group[index].Value += (i as CoinItem).Value;
                }
            }
            for (let item of group)
            {
                addAccountList(item as CoinItem);
            }
        }
    }
    function CoinsIndexof(coins: CoinItem[], coin: CoinItem): number
    {
        for (let i = 0; i < coins.length; i++)
        {
            if (coins[i].AssetId == coin.AssetId)
                return i;
        }
        return -1;
    }
    function addAccountList(item: CoinItem)
    {
        let wallet = GlobalWallet.GetCurrentWallet();
        let ul = $("#Tab_Asset_Index").find("ul:eq(0)");
        let liTemplet = ul.find("li:eq(0)");
        let li = liTemplet.clone(true);
        li.removeAttr("style");
        li.find("span");
        li.find(".asset_address").text(item.Address);
        li.find(".asset_value").text(item.Value);
        GetAssetName(item.AssetId, (name) =>
        {
            li.find(".asset_name").text(name);
            li.find(".asset_issuer").text("发行人"); //TODO:发行人
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