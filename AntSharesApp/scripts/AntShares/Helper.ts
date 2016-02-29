interface ArrayConstructor
{
    copy<T>(src: ArrayLike<T>, srcOffset: number, dst: ArrayLike<T>, dstOffset: number, count: number): void;
}

interface String
{
    hexToBytes(): Uint8Array;
}

interface Uint8Array
{
    toHexString(): string;
}

namespace AntShares
{
    Array.copy = function <T>(src: ArrayLike<T>, srcOffset: number, dst: ArrayLike<T>, dstOffset: number, count: number): void
    {
        for (let i = 0; i < count; i++)
            dst[i + dstOffset] = src[i + srcOffset];
    }

    function fillArray<T>(value: T, start = 0, end = this.length)
    {
        if (start < 0) start += this.length;
        if (start < 0) start = 0;
        if (start >= this.length) return this;
        if (end < 0) end += this.length;
        if (end < 0) return this;
        if (end > this.length) end = this.length;
        for (let i = start; i < end; i++)
            this[i] = value;
        return this;
    }

    String.prototype.hexToBytes = function (): Uint8Array
    {
        if ((this.length & 1) != 0) throw new RangeError();
        let bytes = new Uint8Array(this.length / 2);
        for (let i = 0; i < bytes.length; i++)
            bytes[i] = parseInt(this.substr(i * 2, 2), 16);
        return bytes;
    }

    function reverseArray()
    {
        let m = Math.floor(this.length / 2);
        for (let i = 0; i < m; i++)
        {
            let swap = this[i];
            this[i] = this[length - 1 - i];
            this[length - 1 - i] = swap;
        }
        return this;
    }

    Uint8Array.prototype.toHexString = function (): string
    {
        let s = "";
        for (let i = 0; i < this.length; i++)
        {
            s += (this[i] >>> 4).toString(16);
            s += (this[i] & 0xf).toString(16);
        }
        return s;
    }

    Int8Array.prototype.fill = fillArray;
    Int16Array.prototype.fill = fillArray;
    Int32Array.prototype.fill = fillArray;
    Uint8Array.prototype.fill = fillArray;
    Uint16Array.prototype.fill = fillArray;
    Uint32Array.prototype.fill = fillArray;

    Int8Array.prototype.reverse = reverseArray;
    Int16Array.prototype.reverse = reverseArray;
    Int32Array.prototype.reverse = reverseArray;
    Uint8Array.prototype.reverse = reverseArray;
    Uint16Array.prototype.reverse = reverseArray;
    Uint32Array.prototype.reverse = reverseArray;
}
