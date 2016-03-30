namespace AntShares.UI.Wallet {
    export class Open extends TabBase {
        protected oncreate(): void {
            $(this.target).find("button").click(this.OnOpenButtonClick);
        }

        protected onload(): void {
            let wallet = AntShares.Wallets.Wallet.GetInstance();
            wallet.OpenDB();
        }

        private OnOpenButtonClick() {

            let wallet = AntShares.Wallets.Wallet.GetInstance();
            wallet.GetDataByKey(StoreName.Key, "MasterKey", getDataByKeyDone)          
        }

    }
    function getDataByKeyDone(key: KeyStore)
    {
        
    }
}
