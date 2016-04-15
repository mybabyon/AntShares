namespace AntShares.UI.Wallet {
    export class Open extends TabBase {
        protected oncreate(): void {
            $(this.target).find("button").click(this.OnOpenButtonClick);
            $(this.target).find("#open_password").change(() => { this.vertifyPassword() });
            $(this.target).find("#list_wallet_name input[name='wallet']").change(() => { this.vertifyPassword() }); //没有触发
        }

        private vertifyPassword()
        {
            verifyPassword(
                $('#list_wallet_name input[name="wallet"]:checked').val(),
                "open_password",
                "open_error")
        }

        protected onload(): void
        {
            let master = AntShares.Wallets.Master.GetInstance();
            master.OpenDB(
                () =>
                {
                    master.GetWalletNameList(listWallet)
                }
            );
        }

        private OnOpenButtonClick() {
            if (formIsValid("form_open_wallet")) {
                let wallet = GlobalWallet.NewWallet();

                let walletName = $('#list_wallet_name input[name="wallet"]:checked ').val(); 
                wallet.OpenDB(walletName, () =>
                {
                    wallet.VerifyPassword(toUint8Array($("#open_password").val()),
                        () =>
                        {
                            wallet.OpenWalletAndDecryptPrivateKey(() =>
                            {
                                alert("打开钱包成功");
                                $("#open_error").hide();
                                //打开成功后跳转账户管理页面
                                TabBase.showTab("#Tab_Account_Index");   
                            });
                            
                            
                        },
                        () =>
                        {
                            $("#open_error").show();
                        }
                    );
                })
                
            }
        }
    }

    function listWallet(walletNameList: Array<AntShares.Wallets.WalletStore>)
    {
        if (walletNameList.length == 0)
        {
            $("#list_wallet_name").hide();
            $("#input_wallet_name").show();
        }
        else
        {
            $("#input_wallet_name").hide();
            $("#list_wallet_name").show();
            let ul = $("#list_wallet_name");
            ul.find("li:visible").remove();
            for (let i = 0; i < walletNameList.length; i++)
            {
                let liTemplet = ul.find("li:eq(0)");
                let li = liTemplet.clone();
                li.removeAttr("style");
                li.find("input").val(walletNameList[i].Name);
                li.find("span").text(walletNameList[i].Name);
                if (i == 0) //第一个默认选中
                {
                    li.find("input").attr("checked", 'checked');
                }
                ul.append(li);
            }
        }

    }
}

 