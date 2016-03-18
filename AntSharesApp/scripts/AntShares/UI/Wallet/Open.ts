namespace AntShares.UI.Wallet {
    export class Open extends TabBase {
        protected oncreate(): void {
            $(this.target).find("button").click(this.OnOpenButtonClick);
        }

        protected onload(): void {
            
        }

        private OnOpenButtonClick() {
            //let wallet = new AntShares.Wallets.Wallet();
            //setTimeout(function () {
                
            //    let account = new AccountStore("11111", "22222");
            //    wallet.AddAccount(account);
            //    setTimeout(function () {
            //        wallet.TraversalData(StoreName.account);
            //        console.log(wallet.db);
            //    }, 1000);  
            //}, 500);   
        }

    }

}
