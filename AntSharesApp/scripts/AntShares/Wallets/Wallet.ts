namespace AntShares.Wallets {
    export class Wallet {
        private static SingletonWallet: Wallet;
        public db: IDBDatabase;
        public dbName = "wallet";
        public walletName;
        private version = 6;
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
        public OpenDB = (callback) => {
            if (!window.indexedDB) {
                alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
                //TODO:在config.xml中设置目标平台为Windows8.1时，在Windows10 mobile的手机中无法运行IndexedDB
                return;
            }
            try {
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
                    console.log('IDB version changed to ' + this.version);
                };
            }
            catch (e) {
                console.log("打开IDB异常： " + e);
            }
            callback(); //当要打开的IDB已经处于打开状态时不会报错也不会抛出异常。这时可以直接调用回调函数执行后续操作。
        }

        CreateWallet(passwordKey: Uint8Array, callback: () => any) {
            let IV = new Uint8Array(16);;
            window.crypto.getRandomValues(IV);
            Key.IV = IV;
            this.AddKey(new KeyStore("IV", IV));
            this.AddKey(new KeyStore("WalletName", this.walletName));

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
                    masterKey = masterKey.subarray(0, 32);
                    this.AddKey(new KeyStore("MasterKey", masterKey));

                    let versionArray = new Uint8Array(1);
                    versionArray[0] = this.version;
                    this.AddKey(new KeyStore("Version", versionArray));

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
        public AddKey(key: KeyStore) {
            try {
                if (this.db) {
                    let transaction = this.db.transaction("Key", IDBTransaction.READ_WRITE);
                    transaction = this.db.transaction("Key", 'readwrite');
                    let store = transaction.objectStore("Key");
                    let request = store.add(key);
                    request.onsuccess = (e: any) => {
                        console.log('add key ' + key.Name +' success');
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
        public DeleteDataByKey(storeName: StoreName, value: string) {
            let transaction = this.db.transaction(StoreName[storeName], IDBTransaction.READ_WRITE);
            transaction = this.db.transaction(StoreName[storeName], 'readwrite');
            let store = transaction.objectStore(StoreName[storeName]);
            store.delete(value);
        }
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
        public TraversalData(storeName: StoreName) {
            try {
                if (this.db) {
                    let transaction = this.db.transaction(StoreName[storeName], IDBTransaction.READ_WRITE);
                    transaction = this.db.transaction(StoreName[storeName], 'readwrite');
                    let objectStore = transaction.objectStore(StoreName[storeName]);
                    let request = objectStore.openCursor();
                    request.onsuccess = (e: any) => {
                        let cursor = e.target.result;
                        if (cursor) {
                            let key = cursor.key;
                            let rowData = cursor.value;
                            console.log(rowData);
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
    };
}
