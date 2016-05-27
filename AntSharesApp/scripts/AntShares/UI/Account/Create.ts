namespace AntShares.UI.Account {
    export class Create extends TabBase {
        private CurrentHeight: number;

        protected oncreate(): void {
            $(this.target).find("#create_account_action").click(this.OnCreateButtonClick);
        }

        protected onload(args: any[]): void {
            
        }

        private OnCreateButtonClick() {
            //if (formIsValid("form_create_account")) {

            //}
            let accountName = $("#account_name").val();
            let account = new Wallets.Account();
            let wallet = GlobalWallet.GetCurrentWallet();
            wallet.CreateECDSAKey(accountName, account, (pAccount) => {
                wallet.CreateContract(pAccount.PublicKeyHash, pAccount.publicECPoint, this.CurrentHeight, (pWallet) => {
                    pWallet.LoadAccounts(() => {
                        pWallet.LoadContracts(() => {
                            pWallet.LoadCoins(() => {
                                alert("创建账户成功");
                                //新建账户成功后跳转至账户管理页面
                                TabBase.showTab("#Tab_Account_Index");
                            })
                        })
                    });
                });
            });


        }


    }

}