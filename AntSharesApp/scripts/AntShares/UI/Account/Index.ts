namespace AntShares.UI.Account {
    export class Index extends TabBase {
        protected oncreate(): void {
            $(this.target).find("#create_account").click(this.OnCreateButtonClick);
        }
        
        protected onload(): void
        {
            if (AccountList.List.length <= 0)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            let wallet = GlobalWallet.GetCurrentWallet();
            wallet.TraversalData(StoreName.Account,
                (rawData: Array<AccountStore>) =>
                {
                    let ul = $("#form_account_list").find("ul:eq(0)");
                    ul.find("li :visible").remove();
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
        let liTemplet = ul.find("li:eq(0)");
        let li = liTemplet.clone(true);
        li.removeAttr("style");
        let span = li.find("span");
        let a = li.find("a");
        let btn = li.find("button:eq(0)");
        btn.click(() =>
        {
            Export(AccountList.List[i].PrivateKey, (wif) =>
            {
                alert("WIF格式的私钥为：" + wif);
            });
        })
        a.click(() =>
        {
            TabBase.showTab("#Tab_Account_Details", i);
        });
        span.text(AccountList.List[i].Name + AccountList.List[i].PublicKeyHash.base58Encode().substr(0, 8));
        ul.append(li);
    }

}