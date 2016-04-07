namespace AntShares.UI.Wallet {
    export class Open extends TabBase {
        protected oncreate(): void {
            $(this.target).find("button").click(this.OnOpenButtonClick);
        }

        protected onload(): void {
            let wallet = AntShares.Wallets.Wallet.GetInstance();
            wallet.OpenDB(listWallet);
        }

        private OnOpenButtonClick() {
            console.clear();
            let demo = $('#form_create_wallet') as any;
            if (!demo.valid()) {
                console.log("表单验证未通过");
                return;
            }
            else {
                console.log("验证通过");
                //return;
            }
            
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
                    wallet.GetDataByKey(StoreName.Key, "IV", getIVDown);
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
    function getIVDown(iv: KeyStore) {
        Key.IV = iv.Value;
        let wallet = AntShares.Wallets.Wallet.GetInstance();
        wallet.GetDataByKey(StoreName.Key, "MasterKey", getMasterKeyDown);
    }
    function getMasterKeyDown(masterkey: KeyStore) {
        Key.MasterKey = masterkey.Value;
        ToPasswordKey(toUint8Array($("#open_password").val()), decryptMasterKey);
    }
    function decryptMasterKey(passwordKey: Uint8Array) {
        window.crypto.subtle.importKey(
            "raw",
            passwordKey,
            "AES-CBC",
            false,
            ["encrypt", "decrypt"]
        )
            .then(keyImport => {
                return window.crypto.subtle.decrypt(
                    {
                        name: "AES-CBC",
                        iv: Key.IV
                    },
                    keyImport,
                    Key.MasterKey
                )
            }, err => {
                console.error(err);
            })
            .then(q => {
                Key.MasterKey = new Uint8Array(q);
            })
    }
}

