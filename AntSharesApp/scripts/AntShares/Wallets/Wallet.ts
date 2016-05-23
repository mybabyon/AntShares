namespace AntShares.Wallets
{
    export class Wallet
    {
        public accounts = new Array<AccountItem>();
        public contracts = new Array<ContractItem>();
        public coins = new Array<CoinItem>();
        public database = new AntShares.DataBase.Database();

        /**
         * 打开钱包数据库
         * @param callback 查询结果的回调函数。
         */
        public OpenDB = (walletName: string, callback) =>
        {
            if (!window.indexedDB)
            {
                alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
                //TODO:在config.xml中设置目标平台为Windows8.1时，在Windows10 mobile的手机中无法运行IndexedDB
                return;
            }
            try
            {
                this.database.dbName = walletName;
                let request = window.indexedDB.open(this.database.dbName, this.database.Version);

                request.onsuccess = (e: any) =>
                {
                    this.database.db = e.target.result;
                    callback();
                    return;
                };
                request.onerror = (e: any) =>
                {
                    console.log(e.currentTarget.error.toString());
                    return;
                };
                request.onupgradeneeded = (e: any) =>
                {
                    this.database.db = e.target.result;

                    if (!this.database.db.objectStoreNames.contains('Account'))
                    {
                        let objectStore = this.database.db.createObjectStore('Account', { keyPath: "Name" });
                        objectStore.createIndex("Account", "Name", { unique: true });
                    }
                    if (!this.database.db.objectStoreNames.contains('Contract'))
                    {
                        let objectStore = this.database.db.createObjectStore('Contract', { keyPath: "Name" });
                        objectStore.createIndex("Contract", "Name", { unique: true });
                    }
                    if (!this.database.db.objectStoreNames.contains('Key'))
                    {
                        let objectStore = this.database.db.createObjectStore('Key', { keyPath: "Name" });
                        objectStore.createIndex("Key", "Name", { unique: true });
                    }
                    if (!this.database.db.objectStoreNames.contains('Coin'))
                    {
                        let objectStore = this.database.db.createObjectStore('Coin', { keyPath: "Name" });
                        objectStore.createIndex("Coin", "Name", { unique: true });
                    }
                    if (!this.database.db.objectStoreNames.contains('Coin'))
                    {
                        let objectStore = this.database.db.createObjectStore('Transaction', { keyPath: "Hash" });
                        objectStore.createIndex("Transaction", "Hash", { unique: true });
                    }
                    console.log('IDB wallet version changed to ' + this.database.Version);
                };
                request.onblocked = (e: any) =>
                {
                    console.log(e.currentTarget.error.toString());
                    return;
                };
            }
            catch (e)
            {
                console.log("打开IDB wallet异常： " + e);
            }
        }

        /**
         * 创建钱包数据库
         * @param passwordKey 钱包密码。
         * @param callback 查询结果的回调函数。
         */
        public CreateWallet(passwordKey: Uint8Array, callback: () => any)
        {
            let IV = new Uint8Array(16);;
            window.crypto.getRandomValues(IV);
            Key.IV = IV;
            this.AddKey(new KeyStore("IV", IV));
            let masterKey = new Uint8Array(32);
            window.crypto.getRandomValues(masterKey);
            Key.MasterKey = masterKey;

            window.crypto.subtle.digest(
                {
                    name: "SHA-256",
                },
                passwordKey
            )
                .then(hash =>
                {
                    let passwordHash = new Uint8Array(hash);
                    Key.PasswordHash = passwordHash;
                    this.AddKey(new KeyStore("PasswordHash", passwordHash));
                })
                .catch(err =>
                {
                    console.error(err);
                });

            window.crypto.subtle.importKey(
                "raw",
                passwordKey,
                "AES-CBC",
                false,
                ["encrypt", "decrypt"]
            )
                .then(keyImport =>
                {
                    return window.crypto.subtle.encrypt(
                        {
                            name: "AES-CBC",
                            iv: IV
                        },
                        keyImport,
                        masterKey
                    )
                }, err =>
                {
                    console.error(err);
                })
                .then(q =>
                {
                    masterKey = new Uint8Array(q);
                    this.AddKey(new KeyStore("MasterKey", masterKey));

                    let versionArray = new Uint8Array(1);
                    versionArray[0] = this.database.Version;
                    this.AddKey(new KeyStore("Version", versionArray));

                    callback(); //执行创建钱包后的回调函数
                })
        }

        /**
         * 向钱包中添加Account
         */
        public AddAccount(account: AccountStore, callback = null)
        {
            this.AddData("Account", account, callback);
        }

        /**
         * 向钱包中添加Coin
         */
        public AddCoin(coin: CoinStore, callback = null)
        {
            this.AddData("Coin", coin, callback);
        }

        /**
         * 向钱包中添加Contract
         */
        public AddContract(contract: ContractStore, callback = null)
        {
            this.AddData("Contract", contract, callback);
        }

        /**
         * 向钱包中添加Key
         */
        public AddKey(key: KeyStore, callback = null)
        {
            this.AddData("Key", key, callback);
        }

        /**
         * 向钱包中添加Transaction
         */
        public AddTransaction(tx: TransactionStore, callback = null)
        {
            this.AddData("Transaction", tx, callback);
        }

        private AddData(storeName: string, data: AccountStore | CoinStore | ContractStore | KeyStore | TransactionStore, callback)
        {
            try
            {
                if (this.database.db)
                {
                    let transaction = this.database.db.transaction(storeName, IDBTransaction.READ_WRITE);
                    transaction = this.database.db.transaction(storeName, 'readwrite');
                    let store = transaction.objectStore(storeName);
                    let request = store.add(data);
                    request.onsuccess = (e: any) =>
                    {
                        console.log('add ' + storeName + ' success');
                        if (callback != null)
                            callback();
                    };
                    request.onerror = (e: any) =>
                    {
                        console.log("向" + storeName + "添加数据错误：" + e.currentTarget.error.toString());
                    };
                }
                else
                {
                    console.log('database.db = null');
                }
            }
            catch (e)
            {
                console.log(e);
            }
        }
        
        /**
         * 以事务的方式更新钱包密码
         * @param newPasswordKeyHash 新的钱包密码的Hash
         * @param newMasterKey 新的加密过的MasterKey
         * @param callback 同时修改PasswordKeyHash和MasterKey成功后的回调函数
         */
        public UpdatePassword(newPasswordKeyHash: Uint8Array, newMasterKey: Uint8Array, callback)
        {
            let transaction = this.database.db.transaction("Key", IDBTransaction.READ_WRITE);
            transaction = this.database.db.transaction("Key", 'readwrite');
            let store = transaction.objectStore("Key");
            let pwdhRquest = store.get("PasswordHash");

            pwdhRquest.onsuccess = (e: any) =>
            {
                let obj = e.target.result;
                obj.Value = newPasswordKeyHash;
                pwdhRquest = store.put(obj);
                pwdhRquest.onsuccess = () =>
                {
                    console.log("1.修改PasswordHash成功");
                };
            };

            let mkRquest = store.get("MasterKey");
            mkRquest.onsuccess = (e: any) =>
            {
                let obj = e.target.result;
                obj.Value = newMasterKey;
                mkRquest = store.put(obj);
                mkRquest.onsuccess = () =>
                {
                    console.log("2.修改MasterKey成功");
                };
            };
            transaction.oncomplete = () =>
            {
                console.log("3.修改PasswordHash和修改MasterKey成功");
                callback();
            }
        }

        /**
         * 验证钱包密码是否正确
         * @param password 用户输入的钱包密码。
         * @param verifySuccess 验证成功时调用的回调函数。
         * @param verifyFaild 验证失败时调用的回调函数。
         */
        public VerifyPassword(password: Uint8Array, verifySuccess, verifyFaild)
        {
            this.database.GetDataByKey(StoreName.Key, "PasswordHash",
                (key) =>
                {
                    Key.PasswordHash = key.Value;
                    ToPasswordKey(password,
                        (passwordKey) =>
                        {
                            window.crypto.subtle.digest(
                                {
                                    name: "SHA-256",
                                },
                                new Uint8Array(passwordKey)
                            )
                                .then(hash =>
                                {
                                    let currentPasswordHash = new Uint8Array(hash);
                                    if (Equeal(Key.PasswordHash, currentPasswordHash))
                                    {
                                        Key.PasswordKey = passwordKey;
                                        verifySuccess();    //调用验证成功的回调函数
                                    }
                                    else
                                    {
                                        verifyFaild();      //调用验证失败的回调函数
                                    }
                                })
                                .catch(err =>
                                {
                                    console.error(err);
                                });
                        }
                    );//ToPasswordKey
                }
            );//GetDataByKey
        }//VerifyPassword

        /**
         * 修改钱包密码（替换PasswordKeyHash, 修改MasterKey）
         * @param oldPassword 旧的钱包密码
         * @param newPassword 新的钱包密码
         * @param callback 成功后执行的方法
         */
        public ChangePassword(oldPassword: Uint8Array, newPassword: Uint8Array, callback)
        {
            let firstStep = false;
            //1、用旧的PasswordKey对MasterKey解密，再用新的PasswordKey对MasterKey重新加密
            this.database.GetDataByKey(StoreName.Key, "IV",
                (iv: KeyStore) =>
                {
                    Key.IV = iv.Value;
                    this.database.GetDataByKey(StoreName.Key, "MasterKey",
                        (masterkey: KeyStore) =>
                        {
                            //1.1 解密过程
                            ToPasswordKey(oldPassword,
                                (passwordKey) =>
                                {
                                    window.crypto.subtle.importKey(
                                        "raw",
                                        passwordKey, //旧的PasswordKey,用来解密MasterKey
                                        "AES-CBC",
                                        false,
                                        ["encrypt", "decrypt"]
                                    )
                                        .then(keyImport =>
                                        {
                                            return window.crypto.subtle.decrypt(
                                                {
                                                    name: "AES-CBC",
                                                    iv: Key.IV
                                                },
                                                keyImport,
                                                masterkey.Value //待解密的MasterKey
                                            )
                                        }, err =>
                                        {
                                            console.error(err);
                                        })
                                        .then(q =>
                                        {
                                            let masterKey = new Uint8Array(q); //解密后的masterKey
                                            //1.2 加密过程
                                            ToPasswordKey(newPassword,
                                                (passwordKey) =>
                                                {
                                                    window.crypto.subtle.importKey(
                                                        "raw",
                                                        passwordKey,  //新的PasswordKey,用来加密MasterKey
                                                        "AES-CBC",
                                                        false,
                                                        ["encrypt", "decrypt"]
                                                    )
                                                        .then(keyImport =>
                                                        {
                                                            return window.crypto.subtle.encrypt(
                                                                {
                                                                    name: "AES-CBC",
                                                                    iv: Key.IV
                                                                },
                                                                keyImport,
                                                                masterKey //待加密的masterKey
                                                            )
                                                        }, err =>
                                                        {
                                                            console.error(err);
                                                        })
                                                        .then(q =>
                                                        {
                                                            let newMasterKey = new Uint8Array(q); //重新加密后的masterKey
                                                            Key.PasswordKey = passwordKey;
                                                            //2、替换PasswordKeyHash
                                                            ToPasswordKey(newPassword,
                                                                (passwordKey) =>
                                                                {
                                                                    window.crypto.subtle.digest(
                                                                        {
                                                                            name: "SHA-256",
                                                                        },
                                                                        passwordKey
                                                                    )
                                                                        .then(hash =>
                                                                        {
                                                                            let passwordHash = new Uint8Array(hash);
                                                                            Key.PasswordHash = passwordHash;

                                                                            this.UpdatePassword(Key.PasswordHash, newMasterKey, callback);
                                                                        })
                                                                        .catch(err =>
                                                                        {
                                                                            console.error(err);
                                                                        });
                                                                }
                                                            );//ToPasswordKey
                                                        })
                                                }
                                            ); //ToPasswordKey
                                        })
                                }
                            ); //ToPasswordKey
                        }
                    ); //GetDataByKey
                }
            ); //GetDataByKey
        }

        /**
         * 打开钱包并解密私钥
         * @param callback 成功后执行的方法
         */
        public LoadAccounts = (callback) =>
        {
            this.database.GetDataByKey(StoreName.Key, "IV",
                (iv: KeyStore) =>
                {
                    Key.IV = iv.Value;
                    this.database.GetDataByKey(StoreName.Key, "MasterKey",
                        (masterkey: KeyStore) =>
                        {
                            Key.MasterKey = masterkey.Value;
                            window.crypto.subtle.importKey(
                                "raw",
                                Key.PasswordKey,
                                "AES-CBC",
                                false,
                                ["encrypt", "decrypt"]
                            )
                                .then(keyImport =>
                                {
                                    return window.crypto.subtle.decrypt(
                                        {
                                            name: "AES-CBC",
                                            iv: Key.IV
                                        },
                                        keyImport,
                                        Key.MasterKey
                                    )
                                }, err =>
                                {
                                    console.error(err);
                                })
                                .then(q =>
                                {
                                    Key.MasterKey = new Uint8Array(q);
                                    this.database.TraversalData(StoreName.Account,
                                        (rawDataArray: Array<AccountStore>) =>
                                        {
                                            this.accounts = new Array<AccountItem>();
                                            //以下函数相当于一个for循环,所有异步执行完毕才进入回调函数。
                                            this.decPriKey(rawDataArray, 0, callback);
                                        }
                                    );
                                }, err =>
                                {
                                    console.log("解密MasterKey失败");
                                });
                        }
                    );//GetDataByKey
                }
            );//GetDataByKey
        }//OpenWalletAndDecryptPrivateKey

        /**
         * 从数据库中读取合约存到contracts变量中
         */
        public LoadContracts = (callback) =>
        {
            this.database.TraversalData(StoreName.Contract, (rawData: Array<ContractStore>) =>
            {
                this.contracts = new Array<ContractItem>();
                this.addToContracts(rawData, 0, callback);
            })
        }

        private addToContracts(rawData: Array<ContractStore>, i: number, callback)
        {
            if (i >= rawData.length)
            {
                callback();
                return;
            }
            toAddress(rawData[i].ScriptHash, (addr: string) =>
            {
                if (rawData[i].Type == "SignatureContract")
                {
                    let item = rawData[i].RawData as ContractItem;
                    item.Address = addr;
                    this.contracts.push(item);
                }
                this.addToContracts(rawData, ++i, callback);
            });
        }

        /**
         * 从数据库中读取合约存到coins变量中
         */
        public LoadCoins = (callback) =>
        {
            this.database.TraversalData(StoreName.Coin, (rawData: Array<CoinStore>) =>
            {
                this.coins = new Array<CoinItem>();
                this.addToCoins(rawData, 0, callback);
            })
        }

        private addToCoins(rawData: Array<CoinStore>, i: number, callback)
        {
            if (i >= rawData.length)
            {
                callback();
                return;
            }
            let item = new CoinItem(rawData[i].Input, rawData[i].Address, rawData[i].State, rawData[i].AssetId, rawData[i].Value);
            this.coins.push(item);
            this.addToCoins(rawData, ++i, callback);
        }

        public SetHeight(height: number, callback)
        {
            this.database.UpdateDataByKey(StoreName.Key, "Height", new Wallets.KeyStore("Height", height), () =>
            {
                if (callback)
                    callback();
            })
        }

        public EncriptPrivateKeyAndSave = (privateKey, publicKey, publicKeyHash, name, callback) =>
        {
            let encryptedPrivateKey = new Uint8Array(96);
            encryptedPrivateKey.set(privateKey, 0);
            encryptedPrivateKey.set(publicKey, 32);
            window.crypto.subtle.importKey(
                "raw",
                Key.MasterKey,
                "AES-CBC",
                false,
                ["encrypt", "decrypt"]
            )
                .then(importKey =>
                {
                    return window.crypto.subtle.encrypt(
                        {
                            name: "AES-CBC",
                            iv: Key.IV
                        },
                        importKey,
                        encryptedPrivateKey
                    )
                }, err =>
                {
                    console.error(err);
                })
                .then(result =>
                {
                    let account = new AccountStore(name, publicKeyHash, new Uint8Array(result));
                    this.AddAccount(account);
                    callback();
                }, err =>
                {
                    console.error(err);
                })
        }

        /**
         * 对加密过的privateKeyEncrypted进行解密
         * @param rawData 从数据库中读出的account字段
         */
        private decPriKey = (rawDataArray: Array<AccountStore>, i: number, callback) =>
        {
            if (i >= rawDataArray.length)
            {
                callback();
                return;
            }
            window.crypto.subtle.importKey(
                "raw",
                Key.MasterKey, //解密过的MasterKey
                "AES-CBC",
                false,
                ["encrypt", "decrypt"]
            )
                .then(keyImport =>
                {
                    return window.crypto.subtle.decrypt(
                        {
                            name: "AES-CBC",
                            iv: Key.IV
                        },
                        keyImport,
                        rawDataArray[i].PrivateKeyEncrypted //AES加密后的私钥和公钥
                    )
                }, err =>
                {
                    console.error(err);
                })
                .then(q =>
                {
                    let privateKeyEncrypted = new Uint8Array(q);
                    let privateKey = privateKeyEncrypted.subarray(0, 32);
                    let publicKey = privateKeyEncrypted.subarray(32, 96);
                    let item = new AccountItem(rawDataArray[i].Name, rawDataArray[i].PublicKeyHash, privateKey, publicKey);
                    this.accounts.push(item);
                    this.decPriKey(rawDataArray, ++i, callback);
                }, err =>
                {
                    console.log("解密私钥失败");
                });
        }

        public sign(context: Core.SignatureContext, callback: (fSuccess: boolean) => any)
        {
            this.signLoop(false, context, 0, callback);
        }

        private signLoop(fSuccess: boolean, context: Core.SignatureContext, i: number, callback: (fSuccess: boolean) => any)
        {
            if (i > context.ScriptHashes.length)
            {
                callback(fSuccess);
                return;
            }
            let scriptHash = context.ScriptHashes[i];
            let contract = this.GetContract(scriptHash);
            if (contract == null) this.signLoop(fSuccess, context, ++i, callback);
            let account = this.GetAccountByScriptHash(scriptHash);
            if (account == null) this.signLoop(fSuccess, context, ++i, callback);
            context.Signable.Sign(account, (signed) =>
            {
                fSuccess = fSuccess || context.Add(contract, account.PublicKey, signed);
                this.signLoop(fSuccess, context, ++i, callback);
            });
        }

        private GetAccountByScriptHash(scriptHash: Uint8Array): AccountItem
        {
            for (let c of this.contracts)
            {
                if (c.ScriptHash == scriptHash)
                {
                    for (let a of this.accounts)
                    {
                        if (a.PublicKeyHash == c.PublicKeyHash)
                        {
                            return a;
                        } 
                    }
                } 
            }
            return null;
        }

        private GetContract(scriptHash: Uint8Array): ContractItem
        {
            for (let c of this.contracts)
            {
                if (c.ScriptHash == scriptHash)
                {
                    return c;
                }
            }
            return null;
        }



    }
}