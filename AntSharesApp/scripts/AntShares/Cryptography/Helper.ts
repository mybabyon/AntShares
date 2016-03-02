/// <reference path="RandomNumberGenerator.ts"/>

interface String
{
    base58Decode(): Uint8Array;
}

interface Uint8Array
{
    base58Encode(): string;
}

namespace AntShares.Cryptography
{
    String.prototype.base58Decode = function () { return Base58.Decode(this); };
    Uint8Array.prototype.base58Encode = function () { return Base58.Encode(this); };

    let getAlgorithmName = (algorithm: string | Algorithm) => typeof algorithm === "string" ? algorithm : algorithm.name;

    if (window.crypto == null)
        window.crypto = { subtle: null, getRandomValues: null };
    if (window.crypto.getRandomValues == null)
    {
        if (window.msCrypto)
        {
            window.crypto.getRandomValues = array=> window.msCrypto.getRandomValues(array);
        }
        else
        {
            RandomNumberGenerator.startCollectors();
            window.crypto.getRandomValues = RandomNumberGenerator.getRandomValues;
        }
    }
    window.crypto.subtle = window.crypto.subtle || window.crypto.webkitSubtle;
    if (window.crypto.subtle == null && window.msCrypto)
    {
        window.crypto.subtle = {
            decrypt: (a, b, c) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.decrypt(a, b, c); op.oncomplete = () => resolve(op.result); op.onerror = e => reject(e); }),
            deriveBits: (a, b, c) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.deriveBits(a, b, c); op.oncomplete = () => resolve(op.result); op.onerror = e => reject(e); }),
            deriveKey: (a, b, c, d, e) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.deriveKey(a, b, c, d, e); op.oncomplete = () => resolve(op.result); op.onerror = e => reject(e); }),
            digest: (a, b) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.digest(a, b); op.oncomplete = () => resolve(op.result); op.onerror = e => reject(e); }),
            encrypt: (a, b, c) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.encrypt(a, b, c); op.oncomplete = () => resolve(op.result); op.onerror = e => reject(e); }),
            exportKey: (a, b) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.exportKey(a, b); op.oncomplete = () => resolve(op.result); op.onerror = e => reject(e); }),
            generateKey: (a, b, c) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.generateKey(a, b, c); op.oncomplete = () => resolve(op.result); op.onerror = e => reject(e); }),
            importKey: (a, b, c, d, e) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.importKey(a, b, c, d, e); op.oncomplete = () => resolve(op.result); op.onerror = e => reject(e); }),
            sign: (a, b, c) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.sign(a, b, c); op.oncomplete = () => resolve(op.result); op.onerror = e => reject(e); }),
            unwrapKey: (a, b, c, d, e, f, g) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.unwrapKey(a, b, c, d, e, f, g); op.oncomplete = () => resolve(op.result); op.onerror = e => reject(e); }),
            verify: (a, b, c, d) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.verify(a, b, c, d); op.oncomplete = () => resolve(op.result); op.onerror = e => reject(e); }),
            wrapKey: (a, b, c, d) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.wrapKey(a, b, c, d); op.oncomplete = () => resolve(op.result); op.onerror = e => reject(e); }),
        };
    }
    if (window.crypto.subtle == null)
    {
        window.crypto.subtle = {
            decrypt: (algorithm, key, data) => new Promise((resolve, reject) =>
            {
                if (typeof algorithm === "string" || algorithm.name != "AES-CBC" || !algorithm.iv || algorithm.iv.byteLength != 16 || data.byteLength % 16 != 0)
                {
                    reject(new RangeError());
                    return;
                }
                try
                {
                    let aes = new Aes((key as any).export(), (algorithm as Algorithm).iv);
                    resolve(aes.decrypt(data));
                }
                catch (e)
                {
                    reject(e);
                }
            }),
            deriveBits: null,
            deriveKey: null,
            digest: (algorithm, data) => new Promise((resolve, reject) =>
            {
                if (getAlgorithmName(algorithm) != "SHA-256")
                {
                    reject(new RangeError());
                    return;
                }
                try
                {
                    resolve(Sha256.computeHash(data));
                }
                catch (e)
                {
                    reject(e);
                }
            }),
            encrypt: (algorithm, key, data) => new Promise((resolve, reject) =>
            {
                if (typeof algorithm === "string" || algorithm.name != "AES-CBC" || !algorithm.iv || algorithm.iv.byteLength != 16)
                {
                    reject(new RangeError());
                    return;
                }
                try
                {
                    let aes = new Aes((key as AesCryptoKey).export(), (algorithm as Algorithm).iv);
                    resolve(aes.encrypt(data));
                }
                catch (e)
                {
                    reject(e);
                }
            }),
            exportKey: (format, key) => new Promise((resolve, reject) =>
            {
                if (format != "raw" || !(key instanceof AesCryptoKey))
                {
                    reject(new RangeError());
                    return;
                }
                try
                {
                    resolve((key as AesCryptoKey).export().buffer);
                }
                catch (e)
                {
                    reject(e);
                }
            }),
            generateKey: (algorithm, extractable, keyUsages) => new Promise((resolve, reject) =>
            {
                if (typeof algorithm === "string" || algorithm.name != "AES-CBC" || (algorithm.length != 128 && algorithm.length != 192 && algorithm.length != 256))
                {
                    reject(new RangeError());
                    return;
                }
                try
                {
                    resolve(AesCryptoKey.create(algorithm.length));
                }
                catch (e)
                {
                    reject(e);
                }
            }),
            importKey: (format, keyData, algorithm, extractable, keyUsages) => new Promise((resolve, reject) =>
            {
                if (format != "raw" || getAlgorithmName(algorithm) != "AES-CBC")
                {
                    reject(new RangeError());
                    return;
                }
                try
                {
                    resolve(AesCryptoKey.import(keyData));
                }
                catch (e)
                {
                    reject(e);
                }
            }),
            sign: null,
            unwrapKey: null,
            verify: null,
            wrapKey: null,
        };
    }
    let digest_old = window.crypto.subtle.digest;
    window.crypto.subtle.digest = (algorithm, data) =>
    {
        if (getAlgorithmName(algorithm) == "RIPEMD-160")
            return new Promise<ArrayBuffer>((resolve, reject) => resolve(RIPEMD160.computeHash(data)));
        return digest_old(algorithm, data as any);
    };
}
