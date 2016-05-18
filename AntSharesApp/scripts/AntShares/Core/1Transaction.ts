/*
 * 在Chrome中使用extends关键字时，父类和子类没有先后顺序
 * 但在IE和EDGE中，使用extends关键字时，父类要在子类的上面，否则运行时会出错。
 * 所以在文件名前加了个“1”，这样保证Transaction类在编译成JS后会在子类前面。
 */
namespace AntShares.Core
{
    export abstract class Transaction implements ISignable
    {
        public txid: string;
        public hex: string;
        public type: TransactionType;
        public attributes: Array<TransactionAttribute>;
        public vin: Array<TransactionInput>;
        public vout: Array<TransactionOutput>;
        public scripts: Array<Script>;

        public Sign(account: Wallets.AccountItem, callback: (signed: Uint8Array) => any)
        {
            let point = Cryptography.ECPoint.fromUint8Array(account.PublicKey, Cryptography.ECCurve.secp256r1);
            let key = new Cryptography.ECDsaCryptoKey(point);
            let ecdsa = new Cryptography.ECDsa(key);
            //可签名对象序列化后的Hash
            window.crypto.subtle.digest(
                {
                    name: "SHA-256",
                },
                this.Serialize()
            )
                .then(hash =>
                {
                    let signed = ecdsa.sign(hash);
                    if (callback)
                        callback(signed as Uint8Array);
                })
            
        }

        private Serialize(): Uint8Array
        {
            let array = new Array<Uint8Array>();
            array.push(new Uint8Array[this.type]);
            array.push(this.SerializeExclusiveData());
            for (let i of this.attributes)
            {
                array.push(new Uint8Array[i.usage]);
                array.push(i.data);
            }
            for (let i of this.vin)
            {
                array.push(i.txid.hexToBytes());
                //little-endian
                array.push(new Uint8Array[i.vout % 256]); 
                array.push(new Uint8Array[i.vout / 256]); 
            }

            let length = 0;
            for (let i of array)
            {
                length += i.length;
            }
            let result = new Uint8Array(length);
            let p = 0;
            for (let i of array)
            {
                result.set(i, p);
                p += i.length;
            }
            return result;
        }
        abstract SerializeExclusiveData(): Uint8Array
    }
}