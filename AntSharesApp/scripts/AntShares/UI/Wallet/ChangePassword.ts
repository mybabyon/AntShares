namespace AntShares.UI.Wallet {
    export class ChangePassword extends TabBase {
        protected oncreate(): void {
            $(this.target).find("button").click(this.OnChangePasswordButtonClick);
            $(this.target).find("#old_password").change(() => { verifyPassword("old_password","change_error") });
        }

        protected onload(): void {
            AntShares.Wallets.Wallet.GetInstance().OpenDB(listWallet);
        }

        private OnChangePasswordButtonClick() {
            if (formIsValid("form_change_password")) {
                let wallet = AntShares.Wallets.Wallet.GetInstance();
                wallet.VerifyPassword(toUint8Array($("#old_password").val()),
                    () => {
                        $("#change_error").hide();
                    },
                    () => {
                        $("#change_error").show();
                    }
                );
                //wallet.GetDataByKey(StoreName.Key, "PasswordHash", getPwdHashDown);
            }
        }
    }


    function listWallet() {
        AntShares.Wallets.Wallet.GetInstance().GetDataByKey(StoreName.Key, "WalletName", listWallet2);
    }

    function listWallet2(walletName: KeyStore) {
        if (walletName && walletName.Value) {
            $("#input_wallet_name2").hide();
            $("#list_wallet_name2").show();
            $("#list_wallet_name2").find("input").val(walletName.Value.toString());
            $("#list_wallet_name2").find("span").text(walletName.Value.toString());
        }
        else {
            $("#list_wallet_name2").hide();
            $("#input_wallet_name2").show();
            //alert("没有找到钱包文件，请先创建钱包。");  
        }
    }

}


