namespace AntShares
{
    export class BigInteger
    {
        private static _minusone: BigInteger;
        private static _one: BigInteger;
        private static _zero: BigInteger;

        private _sign: number;
        private _bits: Uint32Array;

        public static get MinusOne(): BigInteger
        {
            return BigInteger._minusone || (BigInteger._minusone = new BigInteger(-1));
        }

        public static get One(): BigInteger
        {
            return BigInteger._one || (BigInteger._one = new BigInteger(1));
        }

        public static get Zero(): BigInteger
        {
            return BigInteger._zero || (BigInteger._zero = new BigInteger(0));
        }

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
                    this.fromUint64(parts.man.rightShift(-parts.exp), parts.sign);
                }
                else if (parts.exp <= 11)
                {
                    this.fromUint64(parts.man.leftShift(parts.exp), parts.sign);
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
                let l: number;
                if (radix == 2) l = 16;
                else if (radix == 3) l = 10;
                else if (radix == 4) l = 8;
                else if (radix <= 6) l = 6;
                else if (radix <= 9) l = 5;
                else if (radix <= 16) l = 4;
                else if (radix < 256) l = 3;
                let buf_result = new ArrayBuffer(Math.ceil(value.length / l) * 2 + 2);
                let bits_result16 = new Uint16Array(buf_result, 0, Math.ceil(value.length / l));
                let bits_result32 = new Uint32Array(buf_result, 0, Math.floor(buf_result.byteLength / 4));
                let bits_radix = new Uint16Array([radix]);
                let bits_t16 = new Uint16Array(bits_result16.length + 1);
                let bits_t32 = new Uint32Array(bits_t16.buffer, 0, Math.floor(bits_t16.length / 2));
                let bits_a = new Uint32Array(1);
                let first = value.charCodeAt(0);
                let withsign = first == 0x2b || first == 0x2d;
                let sign = first == 0x2d ? -1 : +1;
                for (let i = withsign ? 1 : 0; i < value.length; i++)
                {
                    bits_a[0] = value.charCodeAt(i);
                    if (bits_a[0] >= 0x30 && bits_a[0] <= 0x39) bits_a[0] -= 0x30;
                    else if (bits_a[0] >= 0x41 && bits_a[0] <= 0x5a) bits_a[0] -= 0x37;
                    else if (bits_a[0] >= 0x61 && bits_a[0] <= 0x7a) bits_a[0] -= 0x57;
                    else throw new RangeError();
                    BigInteger.multiplyInternal(bits_result16, bits_radix, bits_t16);
                    BigInteger.addInternal(bits_t32, bits_a, bits_result32);
                }
                this.fromUint8Array(new Uint8Array(buf_result), sign);
            }
            else if (value instanceof Uint8Array)
            {
                this.fromUint8Array(value);
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
            let bits_x = bi_x.toUint32Array(), bits_y = bi_y.toUint32Array();
            let bits_r = new Uint32Array(Math.max(bits_x.length, bits_y.length) + 1);
            BigInteger.addInternal(bits_x, bits_y, bits_r);
            let bi_new = new BigInteger(new Uint8Array(bits_r.buffer));
            if (bi_x._sign < 0)
                bi_new._sign = -bi_new._sign;
            return bi_new;
        }

        private static addInternal(x: Uint32Array, y: Uint32Array, r: Uint32Array)
        {
            let max_length = Math.max(x.length, y.length)
            let carry = false;
            for (let i = 0; i < max_length; i++)
            {
                let a = (x[i] || 0) + (y[i] || 0);
                if (carry) a++;
                r[i] = a;
                carry = a > 0xffffffff;
            }
            if (carry)
                r[max_length] = 1;
        }

        private static compareAbs(x: BigInteger, y: BigInteger): number
        {
            let bits_x = x.toUint32Array(), bits_y = y.toUint32Array();
            let max_length = Math.max(bits_x.length, bits_y.length);
            for (let i = max_length - 1; i >= 0; i--)
                if ((bits_x[i] || 0) > (bits_y[i] || 0))
                    return 1;
                else if ((bits_x[i] || 0) < (bits_y[i] || 0))
                    return -1;
            return 0;
        }

        private static divide(x: number | BigInteger, y: number | BigInteger): BigInteger
        {
            let bi_x = typeof x === "number" ? new BigInteger(x) : x;
            let bi_y = typeof y === "number" ? new BigInteger(y) : y;
            return BigInteger.divRem(bi_x, bi_y).result;
        }

        private static divRem(x: number | BigInteger, y: number | BigInteger): { result: BigInteger, remainder: BigInteger }
        {
            let bi_x = typeof x === "number" ? new BigInteger(x) : x;
            let bi_y = typeof y === "number" ? new BigInteger(y) : y;
            if (bi_y._sign == 0) throw new RangeError();
            if (bi_x._sign == 0) return { result: BigInteger.Zero, remainder: BigInteger.Zero };
            if (bi_y._sign == 1 && bi_y._bits == null) return { result: bi_x, remainder: BigInteger.Zero };
            if (bi_y._sign == -1 && bi_y._bits == null) return { result: bi_x.negate(), remainder: BigInteger.Zero };
            let sign_result = (bi_x._sign > 0) == (bi_y._sign > 0);
            let c = BigInteger.compareAbs(bi_x, bi_y);
            if (c == 0) return { result: sign_result ? BigInteger.One : BigInteger.MinusOne, remainder: BigInteger.Zero };
            if (c < 0) return { result: BigInteger.Zero, remainder: bi_x };
            let bits_x = bi_x.toUint16Array(), bits_y = bi_y.toUint16Array();
            let bits_result = new Uint16Array(bits_x.length - bits_y.length + 1);
            let bits_rem = new Uint16Array(bits_x.length + 1);
            let bits_rem32 = new Uint32Array(bits_rem.buffer, 0, Math.ceil(bits_x.length / 2));
            bits_rem.set(bits_x);
            let view_rem = new DataView(bits_rem.buffer);
            let bits_sub = new Uint16Array(bits_x.length + 1);
            let bits_sub32 = new Uint32Array(bits_sub.buffer, 0, Math.ceil(bits_x.length / 2));
            for (let i = bits_x.length - 1; i >= bits_y.length - 1; i--)
            {
                let offset = i - bits_y.length + 1;
                bits_result[offset] = Math.floor(view_rem.getUint32(i * 2, true) / bits_y[bits_y.length - 1]);
                BigInteger.multiplyInternal(bits_y, bits_result.subarray(offset, offset + 1), bits_sub.subarray(offset));
                let borrow = BigInteger.subtractInternal(bits_rem32, bits_sub32, bits_rem32);
                if (borrow)
                {
                    bits_result[offset]--;
                    BigInteger.fillArray(bits_sub32, 0);
                    bits_sub.set(bits_y, offset);
                    BigInteger.addInternal(bits_rem32, bits_sub32, bits_rem32);
                }
            }
            let result = new BigInteger(new Uint8Array(bits_result.buffer));
            if (!sign_result)
                result._sign = -result._sign;
            let remainder = new BigInteger(new Uint8Array(bits_rem.buffer));
            if (bi_x._sign < 0)
                remainder._sign = -remainder._sign;
            return { result: result, remainder: remainder };
        }

        private static fillArray<T>(arr: ArrayLike<T>, value: T): void
        {
            for (let i = 0; i < arr.length; i++)
                arr[i] = value;
        }

        private fromUint8Array(arr: Uint8Array, sign?: number): void
        {
            let actual_length = BigInteger.getActualLength(arr);
            if (actual_length == 0)
            {
                this._sign = 0;
                return;
            }
            actual_length += (4 - actual_length % 4) % 4;
            let buffer: ArrayBuffer;
            let offset: number;
            if (arr.byteOffset % 4 != 0 || actual_length > arr.buffer.byteLength - arr.byteOffset)
            {
                let bits = new Uint8Array(actual_length);
                bits.set(arr);
                buffer = bits.buffer;
                offset = 0;
            }
            else
            {
                buffer = arr.buffer;
                offset = arr.byteOffset;
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
            if (sign < 0)
                this._sign = -this._sign;
        }

        private fromUint64(i: UintVariable, sign?: number): void
        {
            if (i.compareTo(0x7fffffff) <= 0)
            {
                this._sign = i.toInt32();
            }
            else
            {
                this._sign = +1;
                if (i.compareTo(0xffffffff) <= 0)
                    this._bits = i.bits.subarray(0, 1);
                else
                    this._bits = i.bits;
            }
            if (sign < 0)
                this._sign = -this._sign;
        }

        private static getActualLength(arr: ArrayLike<number>): number
        {
            let actual_length = 0;
            for (let i = arr.length - 1; i >= 0; i--)
                if (arr[i] != 0)
                {
                    actual_length = i + 1;
                    break;
                }
            return actual_length;
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

        public leftShift(shift: number): BigInteger
        {
            if (shift == 0) return this;
            let shift_units = shift >>> 5;
            shift = shift & 0x1f;
            let bits_this = this.toUint32Array();
            let bits_new = new Uint32Array(bits_this.length + shift_units + 1);
            for (let i = shift_units; i < bits_new.length; i++)
                if (shift == 0)
                    bits_new[i] = bits_this[i - shift_units];
                else
                    bits_new[i] = bits_this[i - shift_units] << shift | bits_this[i - shift_units - 1] >>> (32 - shift);
            let bi_new = new BigInteger(new Uint8Array(bits_new.buffer));
            if (this._sign < 0)
                bi_new._sign = -bi_new._sign;
            return bi_new;
        }

        public static mod(x: number | BigInteger, y: number | BigInteger): BigInteger
        {
            let bi_x = typeof x === "number" ? new BigInteger(x) : x;
            let bi_y = typeof y === "number" ? new BigInteger(y) : y;
            return BigInteger.divRem(bi_x, bi_y).remainder;
        }

        public static multiply(x: number | BigInteger, y: number | BigInteger): BigInteger
        {
            let bi_x = typeof x === "number" ? new BigInteger(x) : x;
            let bi_y = typeof y === "number" ? new BigInteger(y) : y;
            if (bi_x._sign == 0) return bi_x;
            if (bi_y._sign == 0) return bi_y;
            if (bi_x._sign == 1 && bi_x._bits == null) return bi_y;
            if (bi_x._sign == -1 && bi_x._bits == null) return bi_y.negate();
            if (bi_y._sign == 1 && bi_y._bits == null) return bi_x;
            if (bi_y._sign == -1 && bi_y._bits == null) return bi_x.negate();
            let bits_x = bi_x.toUint16Array(), bits_y = bi_y.toUint16Array();
            let bits_r = new Uint16Array(bits_x.length + bits_y.length + 1);
            BigInteger.multiplyInternal(bits_x, bits_y, bits_r);
            let bi_new = new BigInteger(new Uint8Array(bits_r));
            if ((bi_x._sign > 0) != (bi_y._sign > 0))
                bi_new._sign = -bi_new._sign;
            return bi_new;
        }

        private static multiplyInternal(x: Uint16Array, y: Uint16Array, r: Uint16Array): void
        {
            BigInteger.fillArray(r, 0);
            let view = new DataView(r.buffer, r.byteOffset, r.byteLength);
            for (let i = 0; i < x.length; i++)
                for (let j = 0; j < y.length; j++)
                {
                    let r32 = x[i] * y[j];
                    let offset = (i + j) * 2;
                    do
                    {
                        r32 += view.getUint32(offset, true);
                        view.setUint32(offset, r32, true);
                    } while ((r32 > 0xffffffff) && (r32 = 1) && (offset += 4));
                }
        }

        public negate(): BigInteger
        {
            let bi_new = new BigInteger();
            bi_new._sign = -this._sign;
            bi_new._bits = this._bits;
            return bi_new;
        }

        public rightShift(shift: number): BigInteger
        {
            if (shift == 0) return this;
            let shift_units = shift >>> 5;
            shift = shift & 0x1f;
            let bits_this = this.toUint32Array();
            if (bits_this.length <= shift_units)
                return BigInteger.Zero;
            let bits_new = new Uint32Array(bits_this.length - shift_units);
            for (let i = 0; i < bits_new.length; i++)
                if (shift == 0)
                    bits_new[i] = bits_this[i + shift_units];
                else
                    bits_new[i] = bits_this[i + shift_units] >>> shift | bits_this[i + shift_units + 1] << (32 - shift);
            let bi_new = new BigInteger(new Uint8Array(bits_new.buffer));
            if (this._sign < 0)
                bi_new._sign = -bi_new._sign;
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
            if (c == 0) return BigInteger.Zero;
            if (c < 0) return BigInteger.subtract(bi_y, bi_x).negate();
            let bits_x = bi_x.toUint32Array(), bits_y = bi_y.toUint32Array();
            let bits_r = new Uint32Array(bits_x.length);
            BigInteger.subtractInternal(bits_x, bits_y, bits_r);
            let bi_new = new BigInteger(new Uint8Array(bits_r.buffer));
            if (bi_x._sign < 0)
                bi_new._sign = -bi_new._sign;
            return bi_new;
        }

        private static subtractInternal(x: Uint32Array, y: Uint32Array, r: Uint32Array): boolean
        {
            let borrow = false;
            for (let i = 0; i < x.length; i++)
            {
                let s = x[i] - (y[i] || 0);
                if (borrow) s--;
                r[i] = s;
                borrow = s < 0;
            }
            return borrow;
        }

        public toString(radix?: number): string
        {
            if (this._sign == 0) return "0";
            if (radix == null) radix = 10;
            if (radix < 2 || radix > 36) throw new RangeError();
            let s = "";
            for (let bi: BigInteger = this; bi._sign != 0;)
            {
                let r = BigInteger.divRem(bi, radix);
                let rem = Math.abs(r.remainder._sign);
                if (rem < 10) rem += 0x30;
                else rem += 0x57;
                s = String.fromCharCode(rem) + s;
                bi = r.result;
            }
            if (this._sign < 0) s = "-" + s;
            return s;
        }

        public toUint8Array(): Uint8Array
        {
            if (this._bits == null)
            {
                let abs = Math.abs(this._sign);
                if (abs <= 0xff)
                    return new Uint8Array([abs]);
                else if (abs <= 0xffff)
                    return new Uint8Array([abs & 0xff, abs >>> 8]);
                else if (abs <= 0xffffff)
                    return new Uint8Array([abs & 0xff, (abs >>> 8) & 0xff, abs >>> 16]);
                else
                    return new Uint8Array([abs & 0xffff, (abs >>> 8) & 0xff, (abs >>> 16) & 0xff, abs >>> 24]);
            }
            else
            {
                let bits = new Uint8Array(this._bits.buffer, this._bits.byteOffset, this._bits.length * 4);
                let actual_length = BigInteger.getActualLength(bits);
                if (actual_length < bits.length)
                    bits = bits.subarray(0, actual_length);
                return bits;
            }
        }

        private toUint16Array(): Uint16Array
        {
            if (this._bits == null)
            {
                let abs = Math.abs(this._sign);
                if (abs <= 0xffff)
                    return new Uint16Array([abs]);
                else
                    return new Uint16Array([abs & 0xffff, abs >>> 16]);
            }
            else
            {
                let bits = new Uint16Array(this._bits.buffer, this._bits.byteOffset, this._bits.length * 2);
                let actual_length = BigInteger.getActualLength(bits);
                if (actual_length < bits.length)
                    bits = bits.subarray(0, actual_length);
                return bits;
            }
        }

        private toUint32Array(): Uint32Array
        {
            return this._bits || new Uint32Array([Math.abs(this._sign)]);
        }
    }
}
