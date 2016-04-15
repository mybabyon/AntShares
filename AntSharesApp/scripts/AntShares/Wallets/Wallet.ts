namespace AntShares.Wallets
{
    
    export class Wallet 
    {
        public db: IDBDatabase;
        public dbName = "wallet";
        private version = 6;

        /**
         * 打开钱包数据库
         * @param callback 查询结果的回调函数。
         */
        public OpenDB = (walletName: string, callback) => {
            if (!window.indexedDB) {
                alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
                //TODO:在config.xml中设置目标平台为Windows8.1时，在Windows10 mobile的手机中无法运行IndexedDB
                return;
            }
            try
            {
                this.dbName = walletName;
                let request = window.indexedDB.open(this.dbName, this.version);

                request.onsuccess = (e: any) => {
                    this.db = e.target.result;
                    callback();
                    return;
                };
                request.onerror = (e: any) => {
                    console.log(e.currentTarget.error.toString());
                    return;
                };
                request.onupgradeneeded = (e: any) => {
                    this.db = e.target.result;

                    if (!this.db.objectStoreNames.contains('Account')) {
                        let objectStore = this.db.createObjectStore('Account', { keyPath: "Name" });
                        objectStore.createIndex("Account", "Name", { unique: true });

                    }
                    if (!this.db.objectStoreNames.contains('Contract')) {
                        let objectStore = this.db.createObjectStore('Contract', { keyPath: "Name" });
                        objectStore.createIndex("Contract", "Name", { unique: true });

                    }
                    if (!this.db.objectStoreNames.contains('Key')) {
                        let objectStore = this.db.createObjectStore('Key', { keyPath: "Name" });
                        objectStore.createIndex("Key", "Name", { unique: true });

                    }
                    console.log('IDB wallet version changed to ' + this.version);
                };
            }
            catch (e) {
                console.log("打开IDB wallet异常： " + e);
            }
        }

        /**
         * 创建钱包数据库
         * @param passwordKey 钱包密码。
         * @param callback 查询结果的回调函数。
         */
        CreateWallet(passwordKey: Uint8Array, callback: () => any) {
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
                .then(hash => {
                    let passwordHash = new Uint8Array(hash);
                    Key.PasswordHash = passwordHash;
                    this.AddKey(new KeyStore("PasswordHash", passwordHash));
                })
                .catch(err => {
                    console.error(err);
                });

            window.crypto.subtle.importKey(
                "raw",
                passwordKey,
                "AES-CBC",
                false,
                ["encrypt", "decrypt"]
            )
                .then(keyImport => {
                    return window.crypto.subtle.encrypt(
                        {
                            name: "AES-CBC",
                            iv: IV
                        },
                        keyImport,
                        masterKey
                    )
                }, err => {
                    console.error(err);
                })
                .then(q => {
                    masterKey = new Uint8Array(q);
                    this.AddKey(new KeyStore("MasterKey", masterKey));

                    let versionArray = new Uint8Array(1);
                    versionArray[0] = this.version;
                    this.AddKey(new KeyStore("Version", versionArray));

                    callback(); //执行创建钱包后的回调函数
                })

        }

        /**
         * 向钱包中添加Account
         * @param account 要添加的Account。
         */
        public AddAccount(account: AccountStore) {
            try {
                if (this.db) {
                    let transaction = this.db.transaction("Account", IDBTransaction.READ_WRITE); //针对Edge
                    transaction = this.db.transaction("Account", 'readwrite');//针对Chrome
                    let store = transaction.objectStore("Account");
                    let request = store.add(account);
                    request.onsuccess = (e: any) => {
                        console.log('add account success');
                    };
                    request.onerror = (e: any) => {
                        console.log(e.currentTarget.error.toString());
                    };
                }
                else {
                    console.log('db = null');
                }
            }
            catch (e) {
                console.log(e);
            }
        }

        /**
         * 向钱包中添加Contract
         * @param contract 要添加的Contract。
         */
        public AddContract(contract: ContractStore) {
            try {
                if (this.db) {
                    let transaction = this.db.transaction("Contract", IDBTransaction.READ_WRITE);
                    transaction = this.db.transaction("Contract", 'readwrite');
                    let store = transaction.objectStore("Contract");
                    let request = store.add(contract);
                    request.onsuccess = (e: any) => {
                        console.log('add contract success');
                    };
                    request.onerror = (e: any) => {
                        console.log(e.currentTarget.error.toString());
                    };
                }
                else {
                    console.log('db = null');
                }
            }
            catch (e) {
                console.log(e);
            }
        }

        /**
         * 向钱包中添加Key
         * @param key 要添加的Key。
         */
        public AddKey(key: KeyStore) {
            try {
                if (this.db) {
                    let transaction = this.db.transaction("Key", IDBTransaction.READ_WRITE);
                    transaction = this.db.transaction("Key", 'readwrite');
                    let store = transaction.objectStore("Key");
                    let request = store.add(key);
                    request.onsuccess = (e: any) => {
                        console.log('add key ' + key.Name + ' success');
                    };
                    request.onerror = (e: any) => {
                        console.log(e.currentTarget.error.toString());
                    };
                }
                else {
                    console.log('db = null');
                }
            }
            catch (e) {
                console.log(e);
            }
        }

        public CloseDB() {
            try {
                if (this.db != null) {
                    this.db.close();
                }
                else {
                    console.log('db = null');
                }
            }
            catch (e) {
                console.log(e);
            }
        }

        public ClearObjectStore(storeName: StoreName) {
            let transaction = this.db.transaction(StoreName[storeName], IDBTransaction.READ_WRITE);
            transaction = this.db.transaction(StoreName[storeName], 'readwrite');
            let store = transaction.objectStore(StoreName[storeName]);
            store.clear();
        }

        public DeleteDataByKey(storeName: StoreName, key: string) {
            let transaction = this.db.transaction(StoreName[storeName], IDBTransaction.READ_WRITE);
            transaction = this.db.transaction(StoreName[storeName], 'readwrite');
            let store = transaction.objectStore(StoreName[storeName]);
            store.delete(key);
        }

        /**
         * 删除IndexdDB
         */
        public DeleteIndexdDB() {
            try {
                let request = window.indexedDB.deleteDatabase(this.dbName);
                request.onsuccess = () => {
                    console.log('Database deleted');
                    this.db = null;
                };
                request.onerror = (e: any) => {
                    console.log(e.currentTarget.error.toString());
                };
            }
            catch (e) {
                console.log(e);
            }

        };

        /**
         * 根据key查询数据
         * @param storeName objectStore名称。
         * @param key 要查询的Key。
         * @param callback 查询结果的回调函数。
         */
        public GetDataByKey(storeName: StoreName, key: string, callback: (key: KeyStore) => any) {
            if (this.db) {
                let transaction = this.db.transaction(StoreName[storeName], IDBTransaction.READ_WRITE);
                transaction = this.db.transaction(StoreName[storeName], 'readwrite');
                let store = transaction.objectStore(StoreName[storeName]);
                let request = store.get(key);

                request.onsuccess = (e: any) => {
                    callback(e.target.result);
                };
                request.onerror = (e: any) => {
                    console.log(e.currentTarget.error.toString());
                };
            }
            else {
                console.log('读取' + key + '错误，因为db=null');
            }
        }

        /**
         * 遍历钱包的objectStore
         * @param storeName objectStore名称。
         * @param callback 遍历完毕时执行的方法，参数是遍历的结果数组型。
         */
        public TraversalData(storeName: StoreName, callback: (result: Array<any>) => any) {
            try {
                if (this.db) {
                    let array = new Array<Uint8Array>();
                    let transaction = this.db.transaction(StoreName[storeName], IDBTransaction.READ_WRITE);
                    transaction = this.db.transaction(StoreName[storeName], 'readwrite');
                    let objectStore = transaction.objectStore(StoreName[storeName]);
                    let request = objectStore.openCursor();
                    request.onsuccess = (e: any) => {
                        let cursor = e.target.result;
                        if (cursor) {
                            let key = cursor.key;
                            let rowData = cursor.value;
                            array.push(rowData);
                            console.log(rowData);
                            cursor.continue();
                        }
                        else {
                            console.log("遍历完毕");
                            callback(array);
                        }
                    }
                    request.onerror = (e: any) => {
                        console.log(e.currentTarget.error.toString());
                    }
                }
                else {
                    console.log('db = null');
                }
            }
            catch (e) {
                console.log(e);
            }
        }

        public UpdateDataByKey(storeName: StoreName, value: string, object: AccountStore | ContractStore | KeyStore) {
            let transaction = this.db.transaction(StoreName[storeName], IDBTransaction.READ_WRITE);
            transaction = this.db.transaction(StoreName[storeName], 'readwrite');
            let store = transaction.objectStore(StoreName[storeName]);
            let request = store.get(value);
            request.onsuccess = (e: any) => {
                let obj = e.target.result;
                obj = object;
                store.put(obj);
            };
            request.onerror = (e: any) => {
                console.log(e.currentTarget.error.toString());
            }
        }

        /**
         * 验证钱包密码是否正确
         * @param password 用户输入的钱包密码。
         * @param verifySuccess 验证成功时调用的回调函数。
         * @param verifyFaild 验证失败时调用的回调函数。
         */
        public VerifyPassword(password: Uint8Array, verifySuccess, verifyFaild) {
            this.GetDataByKey(StoreName.Key, "PasswordHash",
                (key) => {
                    Key.PasswordHash = key.Value;
                    ToPasswordKey(password,
                        (passwordKey) => {
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
                                        verifySuccess();    //调用验证成功的回调函数
                                    }
                                    else {
                                        verifyFaild();      //调用验证失败的回调函数
                                    }
                                })
                                .catch(err => {
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
        public ChangePassword(oldPassword: Uint8Array, newPassword: Uint8Array, callback) {
            let firstStep = false;
            //1、用旧的PasswordKey对MasterKey解密，再用新的PasswordKey对MasterKey重新加密
            this.GetDataByKey(StoreName.Key, "IV",
                (iv: KeyStore) => {
                    Key.IV = iv.Value;
                    this.GetDataByKey(StoreName.Key, "MasterKey",
                        (masterkey: KeyStore) => {
                            Key.MasterKey = masterkey.Value;
                            //1.1 解密过程
                            ToPasswordKey(oldPassword,
                                (passwordKey) => {
                                    window.crypto.subtle.importKey(
                                        "raw",
                                        passwordKey, //旧的PasswordKey,用来解密MasterKey
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
                                                Key.MasterKey //待解密的MasterKey
                                            )
                                        }, err => {
                                            console.error(err);
                                        })
                                        .then(q => {
                                            let masterKey = new Uint8Array(q); //解密后的masterKey
                                            //1.2 加密过程
                                            ToPasswordKey(newPassword,
                                                (passwordKey) => {
                                                    window.crypto.subtle.importKey(
                                                        "raw",
                                                        passwordKey,  //新的PasswordKey,用来加密MasterKey
                                                        "AES-CBC",
                                                        false,
                                                        ["encrypt", "decrypt"]
                                                    )
                                                        .then(keyImport => {
                                                            return window.crypto.subtle.encrypt(
                                                                {
                                                                    name: "AES-CBC",
                                                                    iv: Key.IV
                                                                },
                                                                keyImport,
                                                                masterKey //待加密的masterKey
                                                            )
                                                        }, err => {
                                                            console.error(err);
                                                        })
                                                        .then(q => {
                                                            let masterKey = new Uint8Array(q); //重新加密后的masterKey
                                                            this.UpdateDataByKey(StoreName.Key, "MasterKey", new KeyStore("MasterKey", masterKey));
                                                            console.log("修改MasterKey成功");
                                                            firstStep = true;
                                                            if (firstStep && secondStep)
                                                                callback();
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
            
            let secondStep = false;
            //2、替换PasswordKeyHash
            ToPasswordKey(newPassword,
                (passwordKey) => {
                    window.crypto.subtle.digest(
                        {
                            name: "SHA-256",
                        },
                        passwordKey
                    )
                        .then(hash => {
                            let passwordHash = new Uint8Array(hash);
                            Key.PasswordHash = passwordHash;
                            this.UpdateDataByKey(StoreName.Key, "PasswordHash", new KeyStore("PasswordHash", passwordHash));
                            console.log("替换PasswordHash成功");
                            secondStep = true;
                            if (firstStep && secondStep)
                                callback();
                        })
                        .catch(err => {
                            console.error(err);
                        });
                }
            );//ToPasswordKey
        }

        /**
         * 打开钱包并解密私钥
         * @param callback 成功后执行的方法
         */
        public OpenWalletAndDecryptPrivateKey(callback) {
            this.GetDataByKey(StoreName.Key, "IV",
                (iv: KeyStore) => {
                    Key.IV = iv.Value;
                    this.GetDataByKey(StoreName.Key, "MasterKey",
                        (masterkey: KeyStore) => {
                            Key.MasterKey = masterkey.Value;
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
                                    this.TraversalData(StoreName.Account,
                                        (rawDataArray: Array<AccountStore>) =>
                                        {
                                            AccountList.List = new Array<AccountItem>();
                                            //以下函数相当于一个for循环,所有异步执行完毕才进入回调函数。
                                            decPriKey(rawDataArray, 0, callback);
                                        }
                                    );
                                }, err => {
                                    console.log("解密MasterKey失败");
                                });
                        }
                    );//GetDataByKey
                }
            );//GetDataByKey
        }//OpenWalletAndDecryptPrivateKey
    }

    /**
     * 对加密过的privateKeyEncrypted进行解密
     * @param rawData 从数据库中读出的account字段
     */
    function decPriKey(rawDataArray: Array<AccountStore>, i: number, callback)
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
            .then(keyImport => {
                return window.crypto.subtle.decrypt(
                    {
                        name: "AES-CBC",
                        iv: Key.IV
                    },
                    keyImport,
                    rawDataArray[i].PrivateKeyEncrypted //AES加密后的私钥和公钥
                )
            }, err => {
                console.error(err);
            })
            .then(q => {
                let privateKeyEncrypted = new Uint8Array(q);
                let privateKey = privateKeyEncrypted.subarray(0, 32);
                let publicKey = privateKeyEncrypted.subarray(32, 96);
                let item = new AccountItem();
                item.Name = rawDataArray[i].Name;
                item.PublicKeyHash = rawDataArray[i].PublicKeyHash;
                item.PrivateKey = privateKey;
                item.PublicKey = publicKey;
                AccountList.List.push(item);
                decPriKey(rawDataArray, ++i, callback);
                
            }, err => {
                console.log("解密私钥失败");
            });
    }

}
