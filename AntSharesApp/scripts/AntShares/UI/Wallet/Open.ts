namespace AntShares.UI.Wallet {
    export class Open extends TabBase {
        protected oncreate(): void {
            $(this.target).find("button").click(this.OnOpenButtonClick);
            $(this.target).find("#open_password").change(() => { verifyPassword("open_password", "open_error") });
        }

        protected onload(): void {
            AntShares.Wallets.Wallet.GetInstance().OpenDB(listWallet);
        }

        private OnOpenButtonClick() {
            if (formIsValid("form_open_wallet")) {
                let wallet = AntShares.Wallets.Wallet.GetInstance();
                wallet.VerifyPassword(toUint8Array($("#open_password").val()),
                    () => {
                        wallet.OpenWalletAndDecryptPrivateKey(() => { alert("打开钱包成功"); });
                        $("#open_error").hide();
                    },
                    () => {
                        $("#open_error").show();
                    }
                );
            }
        }
    }

    function listWallet() {
        AntShares.Wallets.Wallet.GetInstance().GetDataByKey(StoreName.Key, "WalletName", listWallet2);
    }

    function listWallet2(walletName: KeyStore) {
        if (walletName && walletName.Value) {
            $("#input_wallet_name").hide();
            $("#list_wallet_name").show();
            $("#list_wallet_name").find("input").val(walletName.Value.toString());
            $("#list_wallet_name").find("span").text(walletName.Value.toString());
        }
        else {
            $("#list_wallet_name").hide();
            $("#input_wallet_name").show();
        }
    }
}

 