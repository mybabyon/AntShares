namespace AntShares
{
    function fillArray<T>(value: T, start = 0, end = this.length)
    {
        if (start < 0) start += this.length;
        if (start < 0) start = 0;
        if (start >= this.length) return;
        if (end < 0) end += this.length;
        if (end < 0) return;
        if (end > this.length) end = this.length;
        for (let i = start; i < end; i++)
            this[i] = value;
        return this;
    }

    Int8Array.prototype.fill = fillArray;
    Int16Array.prototype.fill = fillArray;
    Int32Array.prototype.fill = fillArray;
    Uint8Array.prototype.fill = fillArray;
    Uint8ClampedArray.prototype.fill = fillArray;
    Uint16Array.prototype.fill = fillArray;
    Uint32Array.prototype.fill = fillArray;
}
