namespace AntShares
{
    export class BigInteger
    {
        private _sign: number;
        private _bits: Uint32Array;

        constructor(value?: number | string | Uint8Array, radix?: number)
        {
            if (typeof value === "number")
            {
                if (!isFinite(value) || isNaN(value)) throw new RangeError();
                let parts = BigInteger.getDoubleParts(value);
                if (parts.man.equals(0))
                {
                    this._sign = 0;
                }
                else if (parts.exp <= -64)
                {
                    this._sign = 0;
                }
                else if (parts.exp <= 0)
                {
                    parts.man = parts.man.rightShift(-parts.exp);
                    if (parts.man.compareTo(0x7fffffff) <= 0)
                    {
                        this._sign = parts.man.toInt32();
                    }
                    else
                    {
                        this._sign = +1;
                        this._bits = parts.man.bits;
                    }
                    if (parts.sign < 0)
                        this._sign = -this._sign;
                }
                else if (parts.exp <= 11)
                {
                    parts.man = parts.man.leftShift(parts.exp);
                    if (parts.man.compareTo(0x7fffffff) <= 0)
                    {
                        this._sign = parts.man.toInt32();
                    }
                    else
                    {
                        this._sign = +1;
                        this._bits = parts.man.bits;
                    }
                    if (parts.sign < 0)
                        this._sign = -this._sign;
                }
                else
                {
                    // Overflow into at least 3 uints.
                    // Move the leading 1 to the high bit.
                    parts.man = parts.man.leftShift(11);
                    parts.exp -= 11;
 
                    // Compute cu and cbit so that exp == 32 * cu - cbit and 0 <= cbit < 32.
                    let cu = ((parts.exp - 1) >>> 5) + 1;
                    let cbit = cu * 32 - parts.exp;
 
                    // Populate the uints.
                    this._bits = new Uint32Array(cu + 2);
                    this._bits[cu + 1] = parts.man.rightShift(cbit + 32).toUint32();
                    this._bits[cu] = parts.man.rightShift(cbit).toUint32();
                    if (cbit > 0)
                        this._bits[cu - 1] = parts.man.toUint32() << (32 - cbit);
                    this._sign = parts.sign;
                }
            }
            else if (typeof value === "string")
            {
                if (radix == null) radix = 10;
                if (radix < 2 || radix > 36) throw new RangeError();
                //TODO:
            }
            else if (value instanceof Uint8Array)
            {
                let actual_length = 0;
                for (let i = value.length - 1; i >= 0; i--)
                    if (value[i] != 0)
                    {
                        actual_length = i + 1;
                        break;
                    }
                if (actual_length == 0)
                {
                    this._sign = 0;
                    return;
                }
                actual_length += (4 - actual_length % 4) % 4;
                let buffer: ArrayBuffer;
                let offset: number;
                if (value.byteOffset % 4 != 0 || actual_length > value.buffer.byteLength - value.byteOffset)
                {
                    let bits = new Uint8Array(actual_length);
                    bits.set(value);
                    buffer = bits.buffer;
                    offset = 0;
                }
                else
                {
                    buffer = value.buffer;
                    offset = value.byteOffset;
                }
                let bits = new Uint32Array(buffer, offset, actual_length / 4);
                if (bits.length == 1 && bits[0] <= 0x7fffffff)
                {
                    this._sign = bits[0];
                }
                else
                {
                    this._sign = +1;
                    this._bits = bits;
                }
            }
        }

        public static add(x: number | BigInteger, y: number | BigInteger): BigInteger
        {
            let bi_x = typeof x === "number" ? new BigInteger(x) : x;
            let bi_y = typeof y === "number" ? new BigInteger(y) : y;
            if (bi_x._sign == 0) return bi_y;
            if (bi_y._sign == 0) return bi_x;
            if ((bi_x._sign > 0) != (bi_y._sign > 0))
                return BigInteger.subtract(bi_x, bi_y.negate());
            let bits_x = bi_x._bits || new Uint32Array([Math.abs(bi_x._sign)]);
            let bits_y = bi_y._bits || new Uint32Array([Math.abs(bi_y._sign)]);
            let bits_r = new Uint32Array(Math.max(bits_x.length, bits_y.length) + 1);
            let overflow = false;
            for (let i = 0; i < bits_r.length; i++)
            {
                let r = (bits_x[i] | 0) + (bits_y[i] | 0);
                if (overflow) r++;
                bits_r[i] = r;
                overflow = r > 0xffffffff;
            }
            let bi_new = new BigInteger(new Uint8Array(bits_r.buffer));
            if (bi_x._sign < 0)
                bi_new._sign = -bi_new._sign;
            return bi_new;
        }

        private static compareAbs(x: BigInteger, y: BigInteger): number
        {
            let bits_x = x._bits || new Uint32Array([Math.abs(x._sign)]);
            let bits_y = y._bits || new Uint32Array([Math.abs(y._sign)]);
            let max_length = Math.max(bits_x.length, bits_y.length);
            for (let i = max_length - 1; i >= 0; i--)
                if ((bits_x[i] | 0) > (bits_y[i] | 0))
                    return 1;
                else if ((bits_x[i] | 0) < (bits_y[i] | 0))
                    return -1;
            return 0;
        }

        private static getDoubleParts(dbl: number)
        {
            let uu = new Uint32Array(2);
            new Float64Array(uu.buffer)[0] = dbl;
            let result = {
                sign: 1 - ((uu[1] >>> 30) & 2),
                man: new UintVariable([uu[0], uu[1] & 0x000FFFFF]),
                exp: (uu[1] >>> 20) & 0x7FF,
                fFinite: true
            };
            if (result.exp == 0)
            {
                if (!result.man.equals(0))
                    result.exp = -1074;
            }
            else if (result.exp == 0x7FF)
            {
                result.fFinite = false;
            }
            else
            {
                result.man = result.man.or(new UintVariable([0, 0x00100000]));
                result.exp -= 1075;
            }
            return result;
        }

        public negate(): BigInteger
        {
            let bi_new = new BigInteger();
            bi_new._sign = -this._sign;
            bi_new._bits = this._bits;
            return bi_new;
        }

        public static subtract(x: number | BigInteger, y: number | BigInteger): BigInteger
        {
            let bi_x = typeof x === "number" ? new BigInteger(x) : x;
            let bi_y = typeof y === "number" ? new BigInteger(y) : y;
            if (bi_x._sign == 0) return bi_y.negate();
            if (bi_y._sign == 0) return bi_x;
            if ((bi_x._sign > 0) != (bi_y._sign > 0))
                return BigInteger.add(bi_x, bi_y.negate());
            let c = BigInteger.compareAbs(bi_x, bi_y);
            if (c == 0) return new BigInteger(0);
            if (c < 0) return BigInteger.subtract(bi_y, bi_x).negate();
            let bits_x = bi_x._bits || new Uint32Array([Math.abs(bi_x._sign)]);
            let bits_y = bi_y._bits || new Uint32Array([Math.abs(bi_y._sign)]);
            let bits_r = new Uint32Array(Math.max(bits_x.length, bits_y.length));
            let overflow = false;
            for (let i = 0; i < bits_r.length; i++)
            {
                let r = bits_x[i] - bits_y[i];
                if (overflow) r--;
                bits_r[i] = r;
                overflow = r < 0;
            }
            let bi_new = new BigInteger(new Uint8Array(bits_r.buffer));
            if (bi_x._sign < 0)
                bi_new._sign = -bi_new._sign;
            return bi_new;
        }
    }
}
