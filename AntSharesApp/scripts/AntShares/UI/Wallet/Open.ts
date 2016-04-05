namespace AntShares.UI.Wallet {
    export class Open extends TabBase {
        protected oncreate(): void {
            $(this.target).find("button").click(this.OnOpenButtonClick);
        }

        protected onload(): void {
            let wallet = AntShares.Wallets.Wallet.GetInstance();
            wallet.OpenDB(listWallet);
            listWallet();
        }

        private OnOpenButtonClick() {
            let wallet = AntShares.Wallets.Wallet.GetInstance();
            wallet.GetDataByKey(StoreName.Key, "PasswordHash", getPwdHashDown);
        }
    }
    function getPwdHashDown(key: KeyStore) {
        Key.PasswordHash = key.Value;
        let wallet = AntShares.Wallets.Wallet.GetInstance();
        ToPasswordKey(toUint8Array($("#open_password").val()), verifyPassword);
    }

    function verifyPassword(hash) {
        let wallet = AntShares.Wallets.Wallet.GetInstance();
        window.crypto.subtle.digest(
            {
                name: "SHA-256",
            },
            new Uint8Array(hash)
        )
            .then(hash => {
                let currentPasswordHash = new Uint8Array(hash);
                if (Equeal(Key.PasswordHash, currentPasswordHash)) {
                    wallet.GetDataByKey(StoreName.Key, "IV", decryptMasterKey);
                    alert("open wallet success");
                    $("#open_error").hide();
                }
                else {
                    $("#open_error").show();
                }
            })
            .catch(err => {
                console.error(err);
            });
    }

    function listWallet() {
        let wallet = AntShares.Wallets.Wallet.GetInstance();
        wallet.GetDataByKey(StoreName.Key, "WalletName", listWallet2);
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
            //alert("没有找到钱包文件，请先创建钱包。");  
        }
    }
    function decryptMasterKey(key: KeyStore) {
        let IV = key.Value;
    }
}

