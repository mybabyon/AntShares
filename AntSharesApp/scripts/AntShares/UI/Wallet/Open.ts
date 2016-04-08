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

    function verifyPassword(passwordKey) {
        let wallet = AntShares.Wallets.Wallet.GetInstance();
        window.crypto.subtle.digest(
            {
                name: "SHA-256",
            },
            new Uint8Array(passwordKey)
        )
            .then(hash => {
                let currentPasswordHash = new Uint8Array(hash);
                if (Equeal(Key.PasswordHash, currentPasswordHash)) {
                    Key.PasswordKey = passwordKey;
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
        wallet.GetDataByKey(StoreName.Key, "MasterKey", decryptMasterKey);
    }

    function decryptMasterKey(masterkey: KeyStore) {
        Key.MasterKey = masterkey.Value;
        let wallet = AntShares.Wallets.Wallet.GetInstance();
        window.crypto.subtle.importKey(
            "raw",
            Key.PasswordKey,
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
                wallet.TraversalData(StoreName.Account, decryptPrivateKey);
            }, err => {
                console.log("解密MasterKey失败");
            }); 
    }

    function decryptPrivateKey(rawDataArray: Array<AccountStore>) {
        //for (let i = 0; i < rawDataArray.length; i++) {
        //在循环中的函数使用循环块中的变量i，仅在VS2015.2的TS1.8中支持
            window.crypto.subtle.importKey(
                "raw",
                Key.MasterKey, //解密过的MasterKey
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
                        rawDataArray[0].PrivateKeyEncrypted
                        //rawDataArray[i].PrivateKeyEncrypted //AES加密后的私钥和公钥
                    )
                }, err => {
                    console.error(err);
                })
                .then(q => {
                    let privateKeyEncrypted = new Uint8Array(q);
                    let privateKey = privateKeyEncrypted.subarray(0, 32);
                }, err => {
                    console.log("解密私钥失败");
                }); 
        //}
        
    }
}

 