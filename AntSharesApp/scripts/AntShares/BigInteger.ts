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

        constructor(value: number | string | Uint8Array)
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
                this.fromString(value);
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

        public add(other: number | BigInteger): BigInteger
        {
            return BigInteger.add(this, other);
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

        public bitLength(): number
        {
            if (this._bits == null)
                return BigInteger.bitLengthInternal(Math.abs(this._sign));
            else
                return (this._bits.length - 1) * 32 + BigInteger.bitLengthInternal(this._bits[this._bits.length - 1] | 0);
        }

        private static bitLengthInternal(w: number): number
        {
            return (w < 1 << 15 ? (w < 1 << 7
                ? (w < 1 << 3 ? (w < 1 << 1
                    ? (w < 1 << 0 ? (w < 0 ? 32 : 0) : 1)
                    : (w < 1 << 2 ? 2 : 3)) : (w < 1 << 5
                        ? (w < 1 << 4 ? 4 : 5)
                        : (w < 1 << 6 ? 6 : 7)))
                : (w < 1 << 11
                    ? (w < 1 << 9 ? (w < 1 << 8 ? 8 : 9) : (w < 1 << 10 ? 10 : 11))
                    : (w < 1 << 13 ? (w < 1 << 12 ? 12 : 13) : (w < 1 << 14 ? 14 : 15)))) : (w < 1 << 23 ? (w < 1 << 19
                        ? (w < 1 << 17 ? (w < 1 << 16 ? 16 : 17) : (w < 1 << 18 ? 18 : 19))
                        : (w < 1 << 21 ? (w < 1 << 20 ? 20 : 21) : (w < 1 << 22 ? 22 : 23))) : (w < 1 << 27
                            ? (w < 1 << 25 ? (w < 1 << 24 ? 24 : 25) : (w < 1 << 26 ? 26 : 27))
                            : (w < 1 << 29 ? (w < 1 << 28 ? 28 : 29) : (w < 1 << 30 ? 30 : 31)))));
        }

        public static compare(x: number | BigInteger, y: number | BigInteger): number
        {
            let bi_x = typeof x === "number" ? new BigInteger(x) : x;
            let bi_y = typeof y === "number" ? new BigInteger(y) : y;
            if (bi_x._sign >= 0 && bi_y._sign < 0) return 1;
            if (bi_x._sign < 0 && bi_y._sign >= 0) return -1;
            let c = BigInteger.compareAbs(bi_x, bi_y);
            if (bi_x._sign < 0) c = -c;
            return c;
        }

        public compare(other: number | BigInteger): number
        {
            return BigInteger.compare(this, other);
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

        public static divide(x: number | BigInteger, y: number | BigInteger): BigInteger
        {
            let bi_x = typeof x === "number" ? new BigInteger(x) : x;
            let bi_y = typeof y === "number" ? new BigInteger(y) : y;
            return BigInteger.divRem(bi_x, bi_y).result;
        }

        public divide(other: number | BigInteger): BigInteger
        {
            return BigInteger.divide(this, other);
        }

        public static divRem(x: number | BigInteger, y: number | BigInteger): { result: BigInteger, remainder: BigInteger }
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
                    bits_sub32.fill(0);
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

        public static equals(x: number | BigInteger, y: number | BigInteger): boolean
        {
            let bi_x = typeof x === "number" ? new BigInteger(x) : x;
            let bi_y = typeof y === "number" ? new BigInteger(y) : y;
            if (bi_x._sign != bi_y._sign) return false;
            if ((bi_x._bits == null) != (bi_y._bits == null)) return false;
            if ((bi_x._bits == null) && (bi_y._bits == null)) return true;
            if (bi_x._bits.length != bi_y._bits.length) return false;
            for (let i = 0; i < bi_x._bits.length; i++)
                if (bi_x._bits[i] != bi_y._bits[i])
                    return false;
            return true;
        }

        public equals(other: number | BigInteger): boolean
        {
            return BigInteger.equals(this, other);
        }

        public static fromString(str: string, radix = 10): BigInteger
        {
            let bi = Object.create(BigInteger.prototype) as BigInteger;
            bi.fromString(str, radix);
            return bi;
        }

        private fromString(str: string, radix = 10): void
        {
            if (radix < 2 || radix > 36) throw new RangeError();
            let l: number;
            if (radix == 2) l = 16;
            else if (radix == 3) l = 10;
            else if (radix == 4) l = 8;
            else if (radix <= 6) l = 6;
            else if (radix <= 9) l = 5;
            else if (radix <= 16) l = 4;
            else if (radix < 256) l = 3;
            let buf_result = new ArrayBuffer(Math.ceil(str.length / l) * 2 + 2);
            let bits_result16 = new Uint16Array(buf_result, 0, Math.ceil(str.length / l));
            let bits_result32 = new Uint32Array(buf_result, 0, Math.floor(buf_result.byteLength / 4));
            let bits_radix = new Uint16Array([radix]);
            let bits_t16 = new Uint16Array(bits_result16.length + 1);
            let bits_t32 = new Uint32Array(bits_t16.buffer, 0, Math.floor(bits_t16.length / 2));
            let bits_a = new Uint32Array(1);
            let first = str.charCodeAt(0);
            let withsign = first == 0x2b || first == 0x2d;
            let sign = first == 0x2d ? -1 : +1;
            for (let i = withsign ? 1 : 0; i < str.length; i++)
            {
                bits_a[0] = str.charCodeAt(i);
                if (bits_a[0] >= 0x30 && bits_a[0] <= 0x39) bits_a[0] -= 0x30;
                else if (bits_a[0] >= 0x41 && bits_a[0] <= 0x5a) bits_a[0] -= 0x37;
                else if (bits_a[0] >= 0x61 && bits_a[0] <= 0x7a) bits_a[0] -= 0x57;
                else throw new RangeError();
                BigInteger.multiplyInternal(bits_result16, bits_radix, bits_t16);
                BigInteger.addInternal(bits_t32, bits_a, bits_result32);
            }
            this.fromUint8Array(new Uint8Array(buf_result), sign);
        }

        public static fromUint8Array(arr: Uint8Array, sign = 1, littleEndian = true): BigInteger
        {
            let bi = Object.create(BigInteger.prototype) as BigInteger;
            bi.fromUint8Array(arr, sign, littleEndian);
            return bi;
        }

        private fromUint8Array(arr: Uint8Array, sign = 1, littleEndian = true): void
        {
            if (!littleEndian)
            {
                let arr_new = new Uint8Array(arr.length + (4 - arr.length % 4) % 4);
                for (let i = 0; i < arr.length; i++)
                    arr_new[arr.length - 1 - i] = arr[i];
                arr = arr_new;
            }
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

        public getLowestSetBit(): number
        {
            if (this._sign == 0) return -1;
            let b: number;
            let w = 0;
            if (this._bits == null)
            {
                b = Math.abs(this._sign);
            }
            else
            {
                while (this._bits[w] == 0) w++;
                b = this._bits[w];
            }
            for (let x = 0; x < 32; x++)
                if ((b[w] & 1 << x) > 0)
                    return x + w * 32;
        }

        public isZero(): boolean
        {
            return this._sign == 0;
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
            let bi_new = BigInteger.divRem(bi_x, bi_y).remainder;
            if (bi_new._sign < 0)
                bi_new = BigInteger.add(bi_new, bi_y);
            return bi_new;
        }

        public mod(other: number | BigInteger): BigInteger
        {
            return BigInteger.mod(this, other);
        }

        public static modInverse(value: number | BigInteger, modulus: number | BigInteger): BigInteger
        {
            let a = typeof value === "number" ? new BigInteger(value) : value;
            let n = typeof modulus === "number" ? new BigInteger(modulus) : modulus;
            let i = n, v = BigInteger.Zero, d = BigInteger.One;
            while (a._sign > 0)
            {
                let t = BigInteger.divRem(i, a);
                let x = d;
                i = a;
                a = t.remainder;
                d = v.subtract(t.result.multiply(x));
                v = x;
            }
            return BigInteger.mod(v, n);
        }

        public modInverse(modulus: number | BigInteger): BigInteger
        {
            return BigInteger.modInverse(this, modulus);
        }

        public static modPow(value: number | BigInteger, exponent: number | BigInteger, modulus: number | BigInteger): BigInteger
        {
            let bi_v = typeof value === "number" ? new BigInteger(value) : value;
            let bi_e = typeof exponent === "number" ? new BigInteger(exponent) : exponent;
            let bi_m = typeof modulus === "number" ? new BigInteger(modulus) : modulus;
            if (bi_e._sign < 0 || bi_m._sign == 0) throw new RangeError();
            if (Math.abs(bi_m._sign) == 1 && bi_m._bits == null) return BigInteger.Zero;
            let h = bi_e.bitLength();
            let bi_new = BigInteger.One;
            for (let i = 0; i < h; i++)
            {
                if (i > 0)
                    bi_v = BigInteger.multiply(bi_v, bi_v);
                bi_v = bi_v.remainder(bi_m);
                if (bi_e.testBit(i))
                    bi_new = BigInteger.multiply(bi_v, bi_new).remainder(bi_m);
            }
            if (bi_new._sign < 0)
                bi_new = BigInteger.add(bi_new, bi_m);
            return bi_new;
        }

        public modPow(exponent: number | BigInteger, modulus: number | BigInteger): BigInteger
        {
            return BigInteger.modPow(this, exponent, modulus);
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
            let bi_new = new BigInteger(new Uint8Array(bits_r.buffer));
            if ((bi_x._sign > 0) != (bi_y._sign > 0))
                bi_new._sign = -bi_new._sign;
            return bi_new;
        }

        public multiply(other: number | BigInteger): BigInteger
        {
            return BigInteger.multiply(this, other);
        }

        private static multiplyInternal(x: Uint16Array, y: Uint16Array, r: Uint16Array): void
        {
            r.fill(0);
            let view = new DataView(r.buffer, r.byteOffset, r.byteLength);
            for (let i = 0; i < x.length; i++)
            {
                if (x[i] == 0) continue;
                for (let j = 0; j < y.length; j++)
                {
                    let r32 = x[i] * y[j];
                    if (r32 == 0) continue;
                    let offset = (i + j) * 2;
                    do
                    {
                        r32 += view.getUint32(offset, true);
                        view.setUint32(offset, r32, true);
                    } while ((r32 > 0xffffffff) && (r32 = 1) && (offset += 4));
                }
            }
        }

        public negate(): BigInteger
        {
            let bi_new = Object.create(BigInteger.prototype) as BigInteger;
            bi_new._sign = -this._sign;
            bi_new._bits = this._bits;
            return bi_new;
        }

        public static pow(value: number | BigInteger, exponent: number): BigInteger
        {
            let bi_v = typeof value === "number" ? new BigInteger(value) : value;
            if (exponent < 0 || exponent > 0x7fffffff) throw new RangeError();
            if (exponent == 0) return BigInteger.One;
            if (exponent == 1) return bi_v;
            if (bi_v._bits == null)
            {
                if (bi_v._sign == 1) return bi_v;
                if (bi_v._sign == -1) return (exponent & 1) != 0 ? bi_v : BigInteger.One;
                if (bi_v._sign == 0) return bi_v;
            }
            let h = BigInteger.bitLengthInternal(exponent);
            let bi_new = BigInteger.One;
            for (let i = 0; i < h; i++)
            {
                let e = 1 << i;
                if (e > 1)
                    bi_v = BigInteger.multiply(bi_v, bi_v);
                if ((exponent & e) != 0)
                    bi_new = BigInteger.multiply(bi_v, bi_new);
            }
            return bi_new;
        }

        public pow(exponent: number): BigInteger
        {
            return BigInteger.pow(this, exponent);
        }

        public static random(bitLength: number): BigInteger
        {
            if (bitLength == 0) return BigInteger.Zero;
            let bytes = new Uint8Array(Math.ceil(bitLength / 8));
            for (let i = 0; i < bytes.length; i++)
                bytes[i] = Math.random() * 256;
            bytes[bytes.length - 1] &= 0xff >>> (8 - bitLength % 8);
            return new BigInteger(bytes);
        }

        public static remainder(x: number | BigInteger, y: number | BigInteger): BigInteger
        {
            let bi_x = typeof x === "number" ? new BigInteger(x) : x;
            let bi_y = typeof y === "number" ? new BigInteger(y) : y;
            return BigInteger.divRem(bi_x, bi_y).remainder;
        }

        public remainder(other: number | BigInteger): BigInteger
        {
            return BigInteger.remainder(this, other);
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

        public subtract(other: number | BigInteger): BigInteger
        {
            return BigInteger.subtract(this, other);
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

        public testBit(n: number): boolean
        {
            let units = n >>> 5;
            n = n & 0x1f;
            if (this._bits == null)
            {
                if (units > 0 || n > 30) return false;
                return (Math.abs(this._sign) & (1 << n)) != 0;
            }
            else
            {
                return (this._bits[units] & (1 << n)) != 0;
            }
        }

        public toInt32(): number
        {
            if (this._bits == null)
                return this._sign;
            else
                return this._sign * (this._bits[0] & 0x7fffffff);
        }

        public toString(radix = 10): string
        {
            if (this._sign == 0) return "0";
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
