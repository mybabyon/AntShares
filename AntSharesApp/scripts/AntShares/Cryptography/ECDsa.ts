namespace AntShares.Cryptography
{
    type Signature = { r: BigInteger, s: BigInteger };

    export class ECDsa
    {
        private privateKey: Uint8Array;
        private publicKey: ECPoint;
        private curve: ECCurve;

        constructor(key: Uint8Array | ECPoint, curve?: ECCurve)
        {
            if (key instanceof Uint8Array)
            {
                if (key.length == 32)
                {
                    this.privateKey = key;
                    this.publicKey = ECPoint.multiply(curve.G, key);
                }
                else
                {
                    this.publicKey = ECPoint.fromUint8Array(key, curve);
                }
                this.curve = curve;
            }
            else if (key instanceof ECPoint)
            {
                this.publicKey = key;
                this.curve = key.curve;
            }
        }

        private static calculateE(n: BigInteger, message: Uint8Array): BigInteger
        {
            let messageBitLength = message.length * 8;
            let trunc = BigInteger.fromUint8Array(message, 1, false);
            if (n.bitLength() < messageBitLength)
            {
                trunc = trunc.rightShift(messageBitLength - n.bitLength());
            }
            return trunc;
        }

        public sign(message: Uint8Array): Signature
        {
            if (this.privateKey == null) throw new Error();
            let e = ECDsa.calculateE(this.curve.N, message);
            let d = BigInteger.fromUint8Array(this.privateKey, 1, false);
            let r: BigInteger, s: BigInteger;
            do
            {
                let k: BigInteger;
                do
                {
                    do
                    {
                        k = BigInteger.random(this.curve.N.bitLength(), window.crypto);
                    }
                    while (k.sign() == 0 || k.compare(this.curve.N) >= 0);
                    let p = ECPoint.multiply(this.curve.G, k);
                    let x = p.x.value;
                    r = x.mod(this.curve.N);
                }
                while (r.sign() == 0);
                s = k.modInverse(this.curve.N).multiply(e.add(d.multiply(r))).mod(this.curve.N);
                if (s.compare(this.curve.N.divide(2)) > 0)
                {
                    s = this.curve.N.subtract(s);
                }
            }
            while (s.sign() == 0);
            return { r: r, s: s };
        }

        private static sumOfTwoMultiplies(P: ECPoint, k: BigInteger, Q: ECPoint, l: BigInteger): ECPoint
        {
            let m = Math.max(k.bitLength(), l.bitLength());
            let Z = ECPoint.add(P, Q);
            let R = P.curve.Infinity;
            for (let i = m - 1; i >= 0; --i)
            {
                R = R.twice();
                if (k.testBit(i))
                {
                    if (l.testBit(i))
                        R = ECPoint.add(R, Z);
                    else
                        R = ECPoint.add(R, P);
                }
                else
                {
                    if (l.testBit(i))
                        R = ECPoint.add(R, Q);
                }
            }
            return R;
        }

        public verify(message: Uint8Array, r: BigInteger, s: BigInteger): boolean
        {
            if (r.sign() < 1 || s.sign() < 1 || r.compare(this.curve.N) >= 0 || s.compare(this.curve.N) >= 0)
                return false;
            let e = ECDsa.calculateE(this.curve.N, message);
            let c = s.modInverse(this.curve.N);
            let u1 = e.multiply(c).mod(this.curve.N);
            let u2 = r.multiply(c).mod(this.curve.N);
            let point = ECDsa.sumOfTwoMultiplies(this.curve.G, u1, this.publicKey, u2);
            let v = point.x.value.mod(this.curve.N);
            return v.equals(r);
        }
    }
}
