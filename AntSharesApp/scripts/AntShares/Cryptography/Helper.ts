interface String
{
    base58Decode(): Uint8Array;
}

interface Uint8Array
{
    base58Encode(): string;
    hash160(): Uint8Array;
    hash256(): Uint8Array;
    ripemd160(): Uint8Array;
    sha256(): Uint8Array;
}

namespace AntShares.Cryptography
{
    String.prototype.base58Decode = function ()
    {
        return Base58.Decode(this);
    }

    Uint8Array.prototype.base58Encode = function ()
    {
        return Base58.Encode(this);
    }

    Uint8Array.prototype.hash160 = function ()
    {
        return (this as Uint8Array).sha256().ripemd160();
    }

    Uint8Array.prototype.hash256 = function ()
    {
        return (this as Uint8Array).sha256().sha256();
    }

    Uint8Array.prototype.ripemd160 = function ()
    {
        return RIPEMD160.computeHash(this);
    }

    Uint8Array.prototype.sha256 = function ()
    {
        return Sha256.computeHash(this);
    }
}
