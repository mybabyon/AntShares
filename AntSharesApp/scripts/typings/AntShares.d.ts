interface Algorithm
{
    iv?: ArrayBuffer | ArrayBufferView;
    length?: number;
}

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
