﻿namespace AntShares.UI.Wallet {
    export class Create extends TabBase {
        protected oncreate(): void {
            $(this.target).find("#create_wallet").click(this.OnCreateButtonClick);
            $(this.target).find("#delete_wallet").click(this.OnDeleteButtonClick);
        }

        protected onload(): void {
            let wallet = AntShares.Wallets.Wallet.GetInstance();
            wallet.OpenDB(() => { });            
        }

        private OnCreateButtonClick() {
            let wallet = AntShares.Wallets.Wallet.GetInstance();
            wallet.GetDataByKey(StoreName.Key, "WalletName", createWallet);
        }

        //删除整个IndexedDB，测试用
        private OnDeleteButtonClick() {
            let wallet = AntShares.Wallets.Wallet.GetInstance();
            wallet.ClearObjectStore(StoreName.Key);
            wallet.ClearObjectStore(StoreName.Contract);
            wallet.ClearObjectStore(StoreName.Account);
            wallet.DeleteIndexdDB();
            let a = toUint8Array("3232");
            alert("delete wallet success.");
        }
    }
    function createWallet(walletName: KeyStore) {
        let wallet = AntShares.Wallets.Wallet.GetInstance();
        if (!(walletName && walletName.Value)) {
            wallet.walletName = $("#wallet_name").val();
            ToPasswordKey(toUint8Array($("#create_password").val()),
                (passwordKey) => {
                    wallet.CreateWallet(passwordKey, createECDSAKey)
                });
        }
        else {
            alert("已经存在钱包文件，请勿重新创建。");
        }

        //let wallet = AntShares.Wallets.Wallet.GetInstance();
        //wallet.DeleteIndexdDB();
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
                Account.PublicECPoint = new AntShares.Cryptography.ECPoint(
                    new AntShares.Cryptography.ECFieldElement(new BigInteger(p.x.base64UrlDecode()), AntShares.Cryptography.ECCurve.secp256r1),
                    new AntShares.Cryptography.ECFieldElement(new AntShares.BigInteger(p.y.base64UrlDecode()), AntShares.Cryptography.ECCurve.secp256r1),
                    AntShares.Cryptography.ECCurve.secp256r1);
                
                Account.PublicKey = Account.PublicECPoint.encodePoint(false).subarray(1, 65);

                ToScriptHash(Account.PublicECPoint.encodePoint(true), createAccount);
            });
    }
    function createAccount(publicKeyHash: Uint8Array) {
        Account.PublicKeyHash = publicKeyHash;
        let encryptedPrivateKey = new Uint8Array(96);
        encryptedPrivateKey.set(Account.PrivateKey, 0);
        encryptedPrivateKey.set(Account.PublicKey, 32);
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
                wallet.AddAccount(account); //TODO:这里有Bug
                CreateContract();
            }, err => {
                console.error(err);
            })
    }
    function CreateContract() {
        let sc = new SignatureContract(Account.PublicECPoint);
        ToScriptHash(sc.RedeemScript, saveContract)
        
    }

    function saveContract(ScriptHash: Uint8Array) {
        let sc = new SignatureContract(Account.PublicECPoint);
        let contract = new ContractStore(ScriptHash, sc, sc.PublicKeyHash, "SignatureContract");
        let wallet = AntShares.Wallets.Wallet.GetInstance();

        wallet.AddContract(contract);
    }
}