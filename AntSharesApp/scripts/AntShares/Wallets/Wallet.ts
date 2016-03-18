namespace AntShares.Wallets {
    export class Wallet {
        public db: IDBDatabase;
        public OpenDB = (dbName: string, version: number) => {
            if (!window.indexedDB) {
                alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
            }

            let request = window.indexedDB.open(dbName, version);

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
                console.log('IDB version changed to ' + version);
            };
            request.onblocked = (e: any) => {
            };
        }
        constructor(passwordKey: Uint8Array, create: boolean) {
            const dbName = "wallet";
            const version = 4;
            if (create) {

                let IV = new Uint8Array(16);;
                window.crypto.getRandomValues(IV);
                this.AddKey(new KeyStore("IV", IV));

                let passwordHash = new Uint8Array(256);
                window.crypto.subtle.digest(
                    {
                        name: "SHA-256",
                    },
                    passwordKey
                ).then(
                    p => {
                        passwordHash = p;
                    }
                    );
                this.AddKey(new KeyStore("passwordKey", passwordKey));


                let masterKey = new Uint8Array(32);;
                window.crypto.getRandomValues(masterKey);;
                window.crypto.subtle.encrypt(
                    {
                        name: "AES-CBC", iv: IV
                    },
                    passwordKey,
                    //TODO:要把passwordKey转为CryptoKey接口的类型
                    masterKey
                ).then(p => {
                    masterKey = p;
                    });

                this.AddKey(new KeyStore("MasterKey", masterKey));

                let version = new Uint8Array(1);
                version[0] = 1;
                this.AddKey(new KeyStore("Version", version));
            }
            else {

            }
            this.OpenDB(dbName, version);
        }
        public AddAccount(account: AccountStore) {
            try {
                if (this.db) {
                    let transaction = this.db.transaction("Account", IDBTransaction.READ_WRITE);
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
                    let transaction = this.db.transaction("contract", IDBTransaction.READ_WRITE);
                    let store = transaction.objectStore("contract");
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
                    let transaction = this.db.transaction("key", IDBTransaction.READ_WRITE);
                    let store = transaction.objectStore("key");
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
        public GetDataByKey(storeName: StoreName, value: string): string {
            let transaction = this.db.transaction(storeName.toString(), IDBTransaction.READ_WRITE);
            let store = transaction.objectStore(storeName.toString());
            let request = store.get(value);
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
