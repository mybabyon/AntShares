//class ECPoint1 {
//    constructor(x: Uint8Array, y: Uint8Array) {
//        this.X = x;
//        this.Y = y;
//    }
//    X: Uint8Array;
//    Y: Uint8Array;

//    //参照AntShares.Cryptography.ECC.ECPoint的对应方法
//    public static EncodePoint(publicKey: ECPoint, commpressed: boolean): Uint8Array {
//        let data;
//        if (commpressed) {
//            data = new Uint8Array(33);
//        }
//        else {
//            data = new Uint8Array(65);
//            let yBytes = publicKey.Y.reverse();
//            data.set(publicKey.Y, 33);
//        }
//        let xBytes = publicKey.X.reverse();

//        data.set(publicKey.X, 1);
//        data[0] = commpressed ? IsEven(publicKey.Y) ? 0x02 : 0x03 : 0x04;
//        return data;
//    }
//}