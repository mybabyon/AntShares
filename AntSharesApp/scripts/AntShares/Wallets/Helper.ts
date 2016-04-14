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

function formIsValid(formId: string): boolean {
    console.clear();
    let demo = $('#' + formId) as any;
    if (!demo.valid()) {
        console.log("表单验证未通过");
        return false;
    }
    else {
        console.log("表单验证通过");
        return true;
    }
}

/**
 * 创建一个新的钱包对象用于验证钱包密码是否正确
 * @param walletName 用户选择的钱包名称。
 * @param inputID 用户输入的钱包密码的文本框ID。
 * @param errorID 显示密码错误的ID。
 */
function verifyPassword(walletName: string, inputID: string, errorID: string)
{
    let wallet = new AntShares.Wallets.Wallet();
    wallet.OpenDB(walletName,
    ()=> {
        wallet.VerifyPassword(
            toUint8Array($('#' + inputID).val()),
            () => { $('#' + errorID).hide(); },
            () => { $('#' + errorID).show(); }
        );

    });
    
}
