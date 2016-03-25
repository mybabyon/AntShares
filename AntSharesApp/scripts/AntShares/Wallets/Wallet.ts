namespace AntShares.Wallets {
    export class Wallet {
        private static SingletonWallet: Wallet;
        public db: IDBDatabase;
        private dbName = "wallet";
        private version = 5;
        constructor() {
        }
        public static CreateInstance(): Wallet {
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

        CreateWallet(passwordKey: Uint8Array) {
            //console.log(this.db);
            let IV = new Uint8Array(16);;
            window.crypto.getRandomValues(IV);
            //console.log(IV);
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
                    //console.log(passwordHash);
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
                    window.crypto.subtle.digest(
                        {
                            name: "SHA-256",
                        },
                        hash
                    )
                        .then(hash2 => {
                            pwdAESKey = hash2;
                        })
                })
                .catch(err => {
                    console.error(err);
                });


            window.crypto.subtle.importKey(
                "jwk",
                {
                    kty: "oct",
                    k: pwdAESKey, //TODO:Edge可以正常运行，Chrome报错
                    alg: "A256CBC",
                    ext: true,
                } as any,
                "AES-CBC",
                false,
                ["encrypt", "decrypt"]
            )
                .then(key => {
                    return key;
                })
                .catch(err => {
                    console.error(err);
                })
                .then(pwdImport => {
                    window.crypto.subtle.encrypt(
                        {
                            name: "AES-CBC",
                            iv: IV
                        },
                        pwdImport, //from generateKey or importKey above
                        masterKey
                    )
                        .then(q => {
                            masterKey = q;
                            console.log(masterKey);
                            this.AddKey(new KeyStore("MasterKey", masterKey));
                        })
                        .catch(err => {
                            console.error(err);
                        });
                });



            let versionArray = new Uint8Array(1);
            versionArray[0] = this.version;
            this.AddKey(new KeyStore("Version", versionArray));

        }

        public AddAccount(account: AccountStore) {
            try {
                if (this.db) {
                    let transaction = this.db.transaction("Account", IDBTransaction.READ_WRITE); //针对Edge
                    transaction = this.db.transaction("Account", 'readwrite');//针对Chrome
                    let store = transaction.objectStore("Account");
                    store.add(account);
                    console.log('add account success');
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
                    store.add(contract);
                    console.log('add contract success');
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
                    store.add(key);
                    console.log('add key success');
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
            let transaction = this.db.transaction(storeName.toString(), IDBTransaction.READ_WRITE);
            let store = transaction.objectStore(storeName.toString());
            store.clear();
        }
        public DeleteDataByKey(storeName: StoreName, value: string) {
            let transaction = this.db.transaction(storeName.toString(), IDBTransaction.READ_WRITE);
            let store = transaction.objectStore(storeName.toString());
            store.delete(value);
        }
        public DeleteIndexdDB(dbName: string) {
            let request = window.indexedDB.deleteDatabase(dbName);
            request.onsuccess = () => {
                console.log('Database deleted');
                this.db = null;
            };
            request.onerror = (e) => {
                console.log(request.error.toString());
            };
        };
        public GetDataByKey(storeName: StoreName, key: string): string {
            let transaction = this.db.transaction(storeName.toString(), IDBTransaction.READ_WRITE);
            let store = transaction.objectStore(storeName.toString());
            let request = store.get(key);
            request.onsuccess = (e: any) => {
                return e.target.result;
            };
            request.onerror = (e: any) => {
                console.log(e.currentTarget.error.toString());
            }
            return "";
        }
        public TraversalData(storeName: StoreName) {
            try {
                if (this.db) {
                    let transaction = this.db.transaction(storeName.toString(), IDBTransaction.READ_ONLY);
                    let objectStore = transaction.objectStore(storeName.toString());
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
            let transaction = this.db.transaction(storeName.toString(), IDBTransaction.READ_WRITE);
            let store = transaction.objectStore(storeName.toString());
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
