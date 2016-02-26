namespace AntShares
{
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

    Int8Array.prototype.fill = fillArray;
    Int16Array.prototype.fill = fillArray;
    Int32Array.prototype.fill = fillArray;
    Uint8Array.prototype.fill = fillArray;
    Uint8ClampedArray.prototype.fill = fillArray;
    Uint16Array.prototype.fill = fillArray;
    Uint32Array.prototype.fill = fillArray;

    Int8Array.prototype.reverse = reverseArray;
    Int16Array.prototype.reverse = reverseArray;
    Int32Array.prototype.reverse = reverseArray;
    Uint8Array.prototype.reverse = reverseArray;
    Uint8ClampedArray.prototype.reverse = reverseArray;
    Uint16Array.prototype.reverse = reverseArray;
    Uint32Array.prototype.reverse = reverseArray;
}
