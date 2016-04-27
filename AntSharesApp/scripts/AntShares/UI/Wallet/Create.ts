namespace AntShares.UI.Wallet {
    export class Create extends TabBase {
        protected oncreate(): void {
            $(this.target).find("#create_wallet").click(this.OnCreateButtonClick);
            $(this.target).find("#delete_wallet").click(this.OnDeleteButtonClick);
        }

        protected onload(): void
        {
            Wallets.Master.GetInstance().OpenDB(() => { });
        }

        private OnCreateButtonClick() {
            if (formIsValid("form_create_wallet")) {
                let master = Wallets.Master.GetInstance();
                master.OpenDB(() =>
                {
                    master.GetWalletNameList(createWallet);
                });   
            }   
        }

        //删除当前所有钱包，测试用
        private OnDeleteButtonClick()
        {
            console.clear();
            let master = Wallets.Master.GetInstance();
            master.OpenDB(() =>
            {
                master.GetWalletNameList(
                    (walletNameList: Array<string>) =>
                {
                    if (walletNameList.length == 0)
                    {
                        alert("当前没有钱包数据库");
                    }
                    else
                    {
                        for (let i = 0; i < walletNameList.length; i++)
                        {
                            deleteWallet(walletNameList[i]);
                            master.DeleteWalletName(walletNameList[i]);
                            alert("delete current wallet success.");
                        }
                    }
                })
            });
        }
    }

    function deleteWallet(waletName: string)
    {
        let wallet = new Wallets.Wallet();
        wallet.OpenDB(waletName, () =>
        {
            wallet.ClearObjectStore(StoreName.Key);
            wallet.ClearObjectStore(StoreName.Contract);
            wallet.ClearObjectStore(StoreName.Account);
            wallet.DeleteIndexdDB();
        });
    }

    function createWallet(walletNameList: Array<string>)
    {
        let alreadyExitWallet = false;
        for (let i = 0; i < walletNameList.length; i++)
        {
            if (walletNameList[i] == $("#wallet_name").val())
            {
                alreadyExitWallet = true;
                break;
            }
        }
        if (alreadyExitWallet)
        {
            alert("已经存在重名的钱包文件，你可以打开钱包或者创建新的钱包。");
        }
        else
        {
            let wallet = GlobalWallet.GetCurrentWallet();
            wallet.dbName = $("#wallet_name").val();
            Wallets.Master.GetInstance().AddWalletName(new Wallets.WalletStore(wallet.dbName));
            wallet.OpenDB
            (
                $("#wallet_name").val(),
                () =>
                {
                    ToPasswordKey(toUint8Array($("#create_password").val()),
                        (passwordKey) =>
                        {
                            wallet.CreateWallet(passwordKey, createECDSAKey)
                        });
                }
            );
            
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
            .then(p =>
            {
                Wallets.Account.PrivateKey = p.d.base64UrlDecode();
                let publicKey = new Uint8Array(64);
                publicKey.set(p.x.base64UrlDecode(), 0);
                publicKey.set(p.y.base64UrlDecode(), 32);
                Wallets.Account.PublicECPoint = Cryptography.ECPoint.fromUint8Array(publicKey, Cryptography.ECCurve.secp256r1);
                
                Wallets.Account.PublicKey = Wallets.Account.PublicECPoint.encodePoint(false).subarray(1, 65);
                let test = Wallets.Account.PublicECPoint.encodePoint(true);

                ToScriptHash(Wallets.Account.PublicECPoint.encodePoint(true), createAccount);
            });
    }
    function createAccount(publicKeyHash: Uint8Array) {
        Wallets.Account.PublicKeyHash = publicKeyHash;
        GlobalWallet.GetCurrentWallet().EncriptPrivateKeyAndSave(
            Wallets.Account.PrivateKey,
            Wallets.Account.PublicKey,
            publicKeyHash,
            "我的账户",
            CreateContract()
        );
    }

    function CreateContract() {
        let sc = new Wallets.SignatureContract(Wallets.Account.PublicECPoint);
        ToScriptHash(sc.RedeemScript, saveContract)
        
    }

    function saveContract(ScriptHash: Uint8Array) {
        let sc = new Wallets.SignatureContract(Wallets.Account.PublicECPoint);
        let contract = new ContractStore(ScriptHash, sc, sc.PublicKeyHash, "SignatureContract");
        let wallet = GlobalWallet.GetCurrentWallet();
        Wallets.Account.clear();
        wallet.AddContract(contract);


        //创建钱包时记录下当前区块高度以便从此高度开始同步区块
        let rpc = new AntShares.Network.RPC.RpcClient("http://seed1.antshares.org:20332/");
        //根据指定的散列值，返回对应的交易信息
        rpc.call("getblockcount", [],
            (height) =>
            {
                wallet.AddKey(new Wallets.KeyStore("Height", height));
            })
        

        //对创建钱包进行校验
        wallet.GetDataByKey(StoreName.Key, "IV", (() => {
            wallet.GetDataByKey(StoreName.Key, "MasterKey", (() => {
                wallet.GetDataByKey(StoreName.Key, "WalletName", (() => {
                    wallet.GetDataByKey(StoreName.Key, "PasswordHash", (() =>
                    {
                        wallet.OpenWalletAndDecryptPrivateKey(() =>
                        {
                            alert("创建钱包成功");
                            //打开成功后跳转账户管理页面
                            TabBase.showTab("#Tab_Account_Index");
                            syncWallet();
                        });
                    }));
                }));
            }));
        }));
    }
}
