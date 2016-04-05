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

function Equeal(x: Uint8Array, y: Uint8Array): boolean {
    if (x.length != y.length)
        return false;
    for (let i = 0; i < x.length; i++)
        if (x[i] != y[i])
            return false;
    return true;
}

function ToPasswordKey(password: Uint8Array, callback: (key: Uint8Array) => any) {
    window.crypto.subtle.digest(
        {
            name: "SHA-256",
        },
        password
    )
        .then(p => {
            let hash = new Uint8Array(p);
            return window.crypto.subtle.digest(
                {
                    name: "SHA-256",
                },
                hash
            )
        })
        .then(p => {
            let hash2 = new Uint8Array(p);
            callback(hash2);
        })
}