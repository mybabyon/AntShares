namespace AntShares.Wallets {
    export class Account {

        private _privateKey: Uint8Array;
        get privateKey(): Uint8Array {
            return this._privateKey;
        }
        set privateKey(pPrivateKey: Uint8Array) {
            this._privateKey = pPrivateKey;
        }

        private _publicKey: Uint8Array;
        get publicKey(): Uint8Array {
            return this._publicKey;
        }
        set publicKey(pPublicKey: Uint8Array) {
            this._publicKey = pPublicKey;
        }

        public publicECPoint: AntShares.Cryptography.ECPoint;
        public publicKeyHash: Uint8Array;
    }
}