namespace AntShares.Wallets {
    export class Wallet {
        private static SingletonWallet: Wallet;
        public db: IDBDatabase;
        private dbName = "wallet";
        private version = 5;
        constructor() {
        }
        //Wallet的单例静态方法
        public static GetInstance(): Wallet {
            if (this.SingletonWallet == null) {
                this.SingletonWallet = new Wallet();
                return this.SingletonWallet;
            }
            else {
                return this.SingletonWallet;
            }
        }
        public OpenDB = () => {
            if (!window.indexedDB) {
                alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
                //TODO:在config.xml中设置目标平台为Windows8.1时，在Windows10 mobile的手机中无法运行IndexedDB
                //可能是因为Windows10 mobile中没有IE的原因
                //设置目标平台为Windows10时，正常运行。
                return;
            }
            let request = window.indexedDB.open(this.dbName, this.version);

            request.onsuccess = (e: any) => {
                this.db = e.target.result;
            };
            request.onerror = (e: any) => {
                console.log(e.currentTarget.error.toString());
            };
            request.onupgradeneeded = (e: any) => {
                this.db = e.target.result;

                if (!this.db.objectStoreNames.contains('Account')) {
                    let objectStore = this.db.createObjectStore('Account', { keyPath: "PublicKeyHash" });
                    objectStore.createIndex("Account", "PublicKeyHash", { unique: true });

                }
                if (!this.db.objectStoreNames.contains('Contract')) {
                    let objectStore = this.db.createObjectStore('Contract', { keyPath: "ScriptHash" });
                    objectStore.createIndex("Contract", "ScriptHash", { unique: true });

                }
                if (!this.db.objectStoreNames.contains('Key')) {
                    let objectStore = this.db.createObjectStore('Key', { keyPath: "Name" });
                    objectStore.createIndex("Key", "Name", { unique: true });

                }
                console.log('IDB version changed to ' + this.version);
            };
            request.onblocked = (e: any) => {
            };
        }

        CreateWallet(passwordKey: Uint8Array, callback: () => any) {
            let IV = new Uint8Array(16);;
            window.crypto.getRandomValues(IV);
            Key.IV = IV;
            this.AddKey(new KeyStore("IV", IV));

            let passwordHash = new Uint8Array(256);
            window.crypto.subtle.digest(
                {
                    name: "SHA-256",
                },
                passwordKey
            )
                .then(hash => {
                    passwordHash = new Uint8Array(hash);
                    Key.PasswordHash = passwordHash;
                    this.AddKey(new KeyStore("PasswordHash", passwordHash));
                })
                .catch(err => {
                    console.error(err);
                });

            let masterKey = new Uint8Array(32);
            window.crypto.getRandomValues(masterKey);
            let pwdAESKey = new Uint8Array(256);
            window.crypto.subtle.digest(
                {
                    name: "SHA-256",
                },
                passwordKey
            )
                .then(hash => {
                    return window.crypto.subtle.digest(
                        {
                            name: "SHA-256",
                        },
                        new Uint8Array(hash)
                    )
                })
                .then(hash2 => {
                    //钱包口令经过UTF8编码以及两次HASH-256之后的结果
                    pwdAESKey = new Uint8Array(hash2);
                    return window.crypto.subtle.importKey(
                        "raw", //如果用jwk格式的话 Edge(UWP)、Chrome(Android)正常运行，IE(win8.1)报错；用raw格式均正常
                        pwdAESKey,
                        "AES-CBC",
                        false,
                        ["encrypt", "decrypt"]
                    )
                }, err => {
                    console.error(err);
                })
                .then(pwdImport => {
                    return window.crypto.subtle.encrypt(
                        {
                            name: "AES-CBC",
                            iv: IV
                        },
                        pwdImport,
                        masterKey
                    )
                }, err => {
                    console.error(err); 
                })
                .then(q => {
                    masterKey = new Uint8Array(q);
                    masterKey = masterKey.subarray(0, 32);
                    this.AddKey(new KeyStore("MasterKey", masterKey));

                    let versionArray = new Uint8Array(1);
                    versionArray[0] = this.version;
                    this.AddKey(new KeyStore("Version", versionArray));
                    Key.MasterKey = masterKey;
                    callback(); //执行创建钱包后的回调函数
                })
        }

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
                }
                else {
                    console.log('db = null');
                }
            }
            catch (e) {
                console.log(e);
            }
        }
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
                }
                else {
                    console.log('db = null');
                }
            }
            catch (e) {
                console.log(e);
            }
        }
        public AddKey(key: KeyStore) {
            try {
                if (this.db) {
                    let transaction = this.db.transaction("Key", IDBTransaction.READ_WRITE);
                    transaction = this.db.transaction("Key", 'readwrite');
                    let store = transaction.objectStore("Key");
                    let request = store.add(key);
                    request.onsuccess = (e: any) => {
                        console.log('add key success');
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
            let transaction = this.db.transaction(StoreName[StoreName.Key], IDBTransaction.READ_WRITE);
            transaction = this.db.transaction(StoreName[StoreName.Key], 'readwrite');
            let store = transaction.objectStore(StoreName[StoreName.Key]);
            store.clear();
        }
        public DeleteDataByKey(storeName: StoreName, value: string) {
            let transaction = this.db.transaction(StoreName[StoreName.Key], IDBTransaction.READ_WRITE);
            transaction = this.db.transaction(StoreName[StoreName.Key], 'readwrite');
            let store = transaction.objectStore(StoreName[StoreName.Key]);
            store.delete(value);
        }
        public DeleteIndexdDB(dbName: string) {
            let request = window.indexedDB.deleteDatabase(dbName);
            request.onsuccess = () => {
                console.log('Database deleted');
                this.db = null;
            };
            request.onerror = (e: any) => {
                console.log(e.currentTarget.error.toString());
            };
        };
        public GetDataByKey(storeName: StoreName, key: string, callback: (key: KeyStore) => any) {
            let transaction = this.db.transaction(StoreName[StoreName.Key], IDBTransaction.READ_WRITE);
            transaction = this.db.transaction(StoreName[StoreName.Key], 'readwrite');
            let store = transaction.objectStore(StoreName[StoreName.Key]);
            let request = store.get(key);

            request.onsuccess = (e: any) => {
                callback(e.target.result);
            };
            request.onerror = (e: any) => {
                console.log(e.currentTarget.error.toString());
            };
        }
        public TraversalData(storeName: StoreName) {
            try {
                if (this.db) {
                    let transaction = this.db.transaction(StoreName[StoreName.Key], IDBTransaction.READ_WRITE);
                    transaction = this.db.transaction(StoreName[StoreName.Key], 'readwrite');
                    let objectStore = transaction.objectStore(StoreName[StoreName.Key]);
                    let request = objectStore.openCursor();
                    request.onsuccess = (e: any) => {
                        let cursor = e.target.result;
                        if (cursor) {
                            let key = cursor.key;
                            let rowData = cursor.value;
                            console.log(rowData.PublicKeyHash);
                            console.log(rowData.PrivateKeyEncrypted);
                            cursor.continue();
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
            let transaction = this.db.transaction(StoreName[StoreName.Key], IDBTransaction.READ_WRITE);
            transaction = this.db.transaction(StoreName[StoreName.Key], 'readwrite');
            let store = transaction.objectStore(StoreName[StoreName.Key]);
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
    };

}
