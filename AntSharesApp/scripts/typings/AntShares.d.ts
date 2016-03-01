interface Crypto
{
    webkitSubtle?: SubtleCrypto;
}

interface Touch
{
    radiusX: number;
    radiusY: number;
    force: number;
}

interface Window
{
    msCrypto?: Crypto;
}
