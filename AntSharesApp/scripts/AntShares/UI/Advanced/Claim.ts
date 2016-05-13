namespace AntShares.UI.Asset
{
    export class Claim extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("#claim").click(this.claim);
        }

        protected onload(): void
        {
            let wallet = GlobalWallet.GetCurrentWallet();
            if (wallet.accounts.length <= 0)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            let text = wallet.calculateClaimAmount(this.getUnClaimedCoin());
        }

        public getUnClaimedCoin(): Array<CoinItem>
        {
            let wallet = GlobalWallet.GetCurrentWallet();
            let unclaimedCoins = new Array<CoinItem>();
            for (let coin of wallet.coins)
            {
                if (coin.State != Core.CoinState.Unspent)
                    continue;
                unclaimedCoins.push(new CoinItem(coin.Input, coin.Address, coin.State,
                    coin.AssetId, coin.Value));
            }
            return unclaimedCoins;
        }

        public claim()
        {

        }
    }
}