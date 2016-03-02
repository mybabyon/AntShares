namespace AntShares.Cryptography
{
    class CryptoKey
    {
        constructor(public type: string, public extractable: boolean, public algorithm: Algorithm, public usages: string[])
        {
        }
    }

    export class AesCryptoKey extends CryptoKey
    {
        private _key_bytes: Uint8Array;

        constructor(length: number)
        {
            super("secret", true, { name: "AES-CBC", length: length }, ["encrypt", "decrypt"]);
        }

        public static create(length: number): AesCryptoKey
        {
            if (length != 128 && length != 192 && length != 256)
                throw new RangeError();
            let key = new AesCryptoKey(length);
            key._key_bytes = new Uint8Array(length / 8);
            window.crypto.getRandomValues(key._key_bytes);
            return key;
        }

        public export(): Uint8Array
        {
            return this._key_bytes;
        }

        public static import(keyData: ArrayBuffer | ArrayBufferView): AesCryptoKey
        {
            if (keyData.byteLength != 16 && keyData.byteLength != 24 && keyData.byteLength != 32)
                throw new RangeError();
            let key = new AesCryptoKey(keyData.byteLength * 8);
            key._key_bytes = Uint8Array.fromArrayBuffer(keyData);
            return key;
        }
    }
}
