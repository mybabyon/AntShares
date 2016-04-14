namespace AntShares.UI.Account {
    export class Index extends TabBase {
        protected oncreate(): void {
            //$(this.target).find("#create_wallet").click(this.OnCreateButtonClick);
        }

        protected onload(): void {
            let wallet = GlobalWallet.GetCurrentWallet();
            wallet.TraversalData(StoreName.Account,
                (rawData: Array<AccountStore>) => {
                    for (let i = 0; i < rawData.length; i++) {
                        let ul = $("#form_account_list").find("ul:eq(0)");
                        ul.find("li:visible").remove();
                        let liTemplet = ul.find("li:eq(0)");
                        let li = liTemplet.clone(true);
                        li.removeAttr("style");
                        let span = li.find("span");
                        span.text(rawData[i].Name + rawData[i].PublicKeyHash.base58Encode().substr(0, 8));
                        ul.append(li);
                    }
                    
                }
            );
        }

        private OnCreateButtonClick() {
            if (formIsValid("form_account_list")) {
                
            }
        }
    }

    function setDetailClick(rawData: AccountStore)
    {
        //TODO：跳转到详情页面，这里要把私钥解密并且以WIF格式显示
    }
}