/*封装IndexdDB*/
class IndexedDB {
    dbName: string;
    version: number;
    db: IDBDatabase;
    constructor()
    {
        if (!this.db) {
            this.dbName = "wallet";
            this.version = 3;
            let w = window as any;
            window.indexedDB = w.indexedDB || w.mozIndexedDB || w.webkitIndexedDB || w.msIndexedDB;
            let request = window.indexedDB.open(this.dbName, 1);

            request.onsuccess = function () {
                this.db = <IDBDatabase>(request.result);
                console.log('open IDB success!');
            };
            request.onerror = function () {
                console.log(request.error.toString());
            };
            request.onupgradeneeded = function () {
                let db = request.result;
                if (!db.objectStoreNames.contains('Account')) {
                    db.createObjectStore('Account', { keyPath: "PublicKeyHash" });
                }
                if (!db.objectStoreNames.contains('Contract')) {
                    db.createObjectStore('Contract', { keyPath: "ScriptHash" });
                }
                if (!db.objectStoreNames.contains('Key')) {
                    db.createObjectStore('Key', { keyPath: "Name" });
                }
                console.log('IDB version changed to ' + this.version);
            };
            request.onblocked = function () {
                console.log(request.error.toString());
            };
        }
    }
    getIndexedDB(): IDBDatabase
    {
        return this.db;
    }
    addAccount(Accounts) {
        try {
            if (this.db != null) {
                let transaction = this.db.transaction("Account", IDBTransaction.READ_WRITE);
                let store = transaction.objectStore("Account");

                for (var i = 0; i < Accounts.length; i++) {
                    store.add(Accounts[i]);
                }
                console.log('add data success');
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    closeDB() {
        try {
            if (this.db != null) {
                this.db.close();
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    DeleteIndexdDB() {
        let request = window.indexedDB.deleteDatabase(this.dbName);
        request.onsuccess = function (event) {
            console.log('Database deleted');
            this.db = null;
        };
        request.onerror = function (e) {
            console.log(request.error.toString());
        };
    };
};

let Contract = [
    {
        ScriptHash: '04a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd5b8dec5235a0fa8722476c7709c02559e3aa73aa03918ba2d492eea75abea235',
        PublicKeyHash: 'c790c4e36b6db06226e41c6912b3c2c35a34a34b99f222fc82b8b56ac1c540c5bd5b8dec5235a0fa8722476c7709c02559e3aa73aa03918ba2d492eea75abea235',
        Type: 'String'
    },
    {
        ScriptHash: '12b3c2c35a34a34b99f2204a34b99f22c790c4c790c4e36b6db06226e41c692fc82b8b56ac1c540c5bd5b8dec5235a0fa8722476c7709c02559e3aa73aa03918ba2d492eea75abea235',
        PublicKeyHash: 'e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd5b8dec5235a0fa8722476c7709c02559e3aa73aa03918ba2d492eea75abea235',
        Type: 'String'
    }];
let Key = [
    {
        Name: 'key1',
        Value: 'TFbNrFaUHUtgf',
    },
    {
        Name: 'key2',
        Value: 'UXs1tRSPTFbN',
    }];
let Account = [
    {
        PublicKeyHash: '04a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd5b8dec5235a0fa8722476c7709c02559e3aa73aa03918ba2d492eea75abea235',
        PrivateKeyEncrypted: 'L1tRSPTFbNrFaUHUtgfMY7GUXshdadtjPJhUXiTqoCnCW6BmiS4C',
    },
    {
        PublicKeyHash: '12b3c2c35a34a34b99f22c790c4e36b6db06226e41c692fc82b8b56ac1c540c5bd5b8dec5235a0fa8722476c7709c02559e3aa73aa03918ba2d492eea75abea235',
        PrivateKeyEncrypted: 'MaUHUtgfMY7GUXs1tRSPTFbNrFhdmiS4CadtjPJhUXiTqoCnCW6B',
    }];

