interface Uint8Array
{
    hash160(): Uint8Array;
    hash256(): Uint8Array;
    ripemd160(): Uint8Array;
    sha256(): Uint8Array;
}

Uint8Array.prototype.hash160 = function (): Uint8Array
{
    return AntShares.Cryptography.RIPEMD160.computeHash(AntShares.Cryptography.Sha256.computeHash(this));
}

Uint8Array.prototype.hash256 = function (): Uint8Array
{
    return AntShares.Cryptography.Sha256.computeHash(AntShares.Cryptography.Sha256.computeHash(this));
}

Uint8Array.prototype.ripemd160 = function (): Uint8Array
{
    return AntShares.Cryptography.RIPEMD160.computeHash(this);
}

Uint8Array.prototype.sha256 = function (): Uint8Array
{
    return AntShares.Cryptography.Sha256.computeHash(this);
}
