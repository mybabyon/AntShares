function encodeUTF8(str: string): string {
    let temp = "", rs = "";
    for (let i = 0, len = str.length; i < len; i++) {
        temp = str.charCodeAt(i).toString(16);
        rs += "\\u" + new Array(5 - temp.length).join("0") + temp;
    }
    return rs;
}
function toUint8Array(str: string): Uint8Array {
    var uint8array = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
        uint8array[i] = str.charCodeAt(i);
    }
    return uint8array;
}

//参照AntShares.Cryptography.ECC.ECPoint的对应方法
function EncodePoint(publicKey: ECPoint, commpressed: boolean): Uint8Array {
    let data;
    if (commpressed) {
        data = new Uint8Array(33);
    }
    else {
        data = new Uint8Array(65);
        let yBytes = publicKey.Y.reverse();
        data.set(publicKey.Y, 33);
    }
    let xBytes = publicKey.X.reverse();

    data.set(publicKey.X, 1);
    data[0] = commpressed ? IsEven(publicKey.Y) ? 0x02 : 0x03 : 0x04;
    return data;
}

function IsEven(array: Uint8Array): boolean {
    return array[0] / 2 == 0;
}

//参照AntShares.Core.Scripts.Helper的对应方法
function ToScriptHash(EncodedPoint: Uint8Array, callback: (scriptHash: ArrayBuffer) => any) {
    let scriptHash;
    window.crypto.subtle.digest(
        {
            name: "SHA-256",
        },
        EncodedPoint
    )
        .then(hash => {
            callback(AntShares.Cryptography.RIPEMD160.computeHash(new Uint8Array(hash)));
        })
}
