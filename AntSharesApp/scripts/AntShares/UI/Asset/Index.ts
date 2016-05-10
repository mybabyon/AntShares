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
            //BUG:已花费的币不应该统计到余额中

            let group = new Array<CoinItem>();
            for (let i = 0; i < wallet.coins.length; i++)
            {
                if (wallet.coins[i].State != Core.CoinState.Unspent)
                    continue;
                let index = CoinsIndexof(group, wallet.coins[i]);
                if (index < 0)
                {
                    group.push(new CoinItem(wallet.coins[i].Input, wallet.coins[i].Address, wallet.coins[i].State, wallet.coins[i].AssetId, wallet.coins[i].Value));
                }
                else
                {
                    group[index].Value = parseFloat(group[index].Value as any) + parseFloat(wallet.coins[i].Value as any);
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

    function GetAssetName(assetId: string, callback: (name: string) => any)
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