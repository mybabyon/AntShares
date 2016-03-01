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
            decrypt: (a, b, c) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.decrypt(a, b, c); op.finish(); resolve(op.result); }),
            deriveBits: (a, b, c) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.deriveBits(a, b, c); op.finish(); resolve(op.result); }),
            deriveKey: (a, b, c, d, e) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.deriveKey(a, b, c, d, e); op.finish(); resolve(op.result); }),
            digest: (a, b) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.digest(a, b); op.finish(); resolve(op.result); }),
            encrypt: (a, b, c) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.encrypt(a, b, c); op.finish(); resolve(op.result); }),
            exportKey: (a, b) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.exportKey(a, b); op.finish(); resolve(op.result); }),
            generateKey: (a, b, c) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.generateKey(a, b, c); op.oncomplete = () => resolve(op.result); op.onerror = e => reject(e); }),
            importKey: (a, b, c, d, e) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.importKey(a, b, c, d, e); op.finish(); resolve(op.result); }),
            sign: (a, b, c) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.sign(a, b, c); op.finish(); resolve(op.result); }),
            unwrapKey: (a, b, c, d, e, f, g) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.unwrapKey(a, b, c, d, e, f, g); op.finish(); resolve(op.result); }),
            verify: (a, b, c, d) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.verify(a, b, c, d); op.finish(); resolve(op.result); }),
            wrapKey: (a, b, c, d) => new Promise((resolve, reject) => { let op = window.msCrypto.subtle.wrapKey(a, b, c, d); op.finish(); resolve(op.result); }),
        };
    }
    if (window.crypto.subtle == null)
    {
        window.crypto.subtle = {
            decrypt: null,
            deriveBits: null,
            deriveKey: null,
            digest: (algorithm, data) => new Promise<ArrayBuffer>((resolve, reject) => { if (getAlgorithmName(algorithm) == "SHA-256") resolve(Sha256.computeHash(data)); else reject(new Error()); }),
            encrypt: null,
            exportKey: null,
            generateKey: null,
            importKey: null,
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
