namespace AntShares.UI.Account {
    export class Index extends TabBase {
        protected oncreate(): void {
            $(this.target).find("#create_account").click(this.OnCreateButtonClick);
        }

        protected onload(): void {
            let wallet = GlobalWallet.GetCurrentWallet();
            wallet.TraversalData(StoreName.Account,
                (rawData: Array<AccountStore>) => {
                    for (let i = 0; i < rawData.length; i++) {
                        addAccountList(i)
                    }
                    
                }
            );
        }

        private OnCreateButtonClick()
        {
            TabBase.showTab("#Tab_Account_Details");
            //if (formIsValid("form_account_list")) {
                
            //}
        }
    }

    function addAccountList(i: number)
    {
        let ul = $("#form_account_list").find("ul:eq(0)");
        ul.find("li:visible").remove();
        let liTemplet = ul.find("li:eq(0)");
        let li = liTemplet.clone(true);
        li.removeAttr("style");
        let span = li.find("span");
        let a = li.find("a");
        a.click(() =>
        {
            TabBase.showTab("#Tab_Account_Details", i);
        });
        span.text(AccountList.List[i].Name + AccountList.List[i].PublicKeyHash.base58Encode().substr(0, 8));
        ul.append(li);
    }
}