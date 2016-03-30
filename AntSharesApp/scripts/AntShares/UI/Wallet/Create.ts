
namespace AntShares.UI.Wallet {
    export class Create extends TabBase {
        protected oncreate(): void {
            $(this.target).find("button").click(this.OnCreateButtonClick);
        }

        protected onload(): void {
            let wallet = AntShares.Wallets.Wallet.GetInstance();
            wallet.OpenDB();
        }

        private OnCreateButtonClick() {
            let wallet = AntShares.Wallets.Wallet.GetInstance();
            wallet.CreateWallet(toUint8Array(encodeUTF8($("#password").val())), createECDSAKey);
        }
    }
    //创建ECDSA公私钥对
    function createECDSAKey() {
        
        //生成随机数
        //TODO:Edge不支持ECDSA，所以目前在Windows10 mobile上无法运行
        window.crypto.subtle.generateKey(
            { name: "ECDSA", namedCurve: "P-256" },
            true,
            ["sign", "verify"]
        )
            .then(p => {
                return window.crypto.subtle.exportKey("jwk", p.privateKey); //以jwk格式导出私钥
            }, err=> {
                console.error(err);
            })
            .then(p => {
                Account.PrivateKey = p.d.base64UrlDecode();
                Account.PublicKey = EncodePoint(new ECPoint(p.x.base64UrlDecode(), p.y.base64UrlDecode()), false).subarray(1, 64);
                ToScriptHash(EncodePoint(new ECPoint(p.x.base64UrlDecode(), p.y.base64UrlDecode()), true), createAccount);
            });
    }
    function createAccount(publicKeyHash: Uint8Array) {
        Account.PublicKeyHash = publicKeyHash;
        let encryptedPrivateKey = new Uint8Array(96);
        encryptedPrivateKey.set(Account.PrivateKey, 0);
        encryptedPrivateKey.set(Account.PublicKey, 33);
        window.crypto.subtle.importKey(
            "raw",
            Key.MasterKey,
            "AES-CBC",
            false,
            ["encrypt", "decrypt"]
        )
            .then(importKey => {
                return window.crypto.subtle.encrypt(
                    {
                        name: "AES-CBC",
                        iv: Key.IV
                    },
                    importKey,
                    encryptedPrivateKey
                )
            }, err => {
                console.error(err);
            })
            .then(result => {
                let account = new AccountStore(publicKeyHash, new Uint8Array(result));
                let wallet = AntShares.Wallets.Wallet.GetInstance();
                wallet.AddAccount(account);
                CreateContract();
            }, err => {
                console.error(err);
            })
    }
    function CreateContract() {
        
    }
}
