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

/**
 * 在线同步区块高度
 */
function getblockcount()
{
    let rpc = new AntShares.Network.RPC.RpcClient("http://seed1.antshares.org:20332/");

    rpc.call("getblockcount", [],
        (result) =>
        {
            $("#lbl_height").text(result - 1);

            setTimeout(getblockcount, 5000);
        },
        (error) =>
        {
            setTimeout(getblockcount, 5000);
        }
    );
}

/**
 * 在线更新钱包中的未花费的币
 * 打开钱包后调用
 */
function syncWallet()
{
    GlobalWallet.GetCurrentWallet().GetDataByKey(StoreName.Key, "Height",
        (height: AntShares.Wallets.KeyStore) =>
        {
            let rpc = new AntShares.Network.RPC.RpcClient("http://seed1.antshares.org:20332/");
            //根据指定的高度（索引），返回对应区块的散列值 
            rpc.call("getblockhash", [height.Value as number],
                (hash) =>
                {
                    //根据指定的散列值，返回对应的区块信息
                    rpc.call("getblock", [hash],
                        (block) =>
                        {
                            //以下函数相当于一个for循环,所有异步执行完毕才进入回调函数，读取下一个区块的数据。
                            getAllTransactions(block.tx, 0,
                                () =>
                                {
                                    //TODO:将钱包中的Height（标记同步区块的高度的字段）+1;
                                    //同步完一个区块后立即同步下一个区块
                                    
                                    GlobalWallet.GetCurrentWallet().HeightPlusOne(syncWallet());
                                    
                                });
                           
                        },
                        (err) => { console.log(err); }
                    );
                },
                (err) => { console.log(err); }
            );
        });
    
}
function getAllTransactions(transactions: Array<any>, i: number, callback)
{
    if (i >= transactions.length)
    {
        callback();
        return;
    }
    let rpc = new AntShares.Network.RPC.RpcClient("http://seed1.antshares.org:20332/");
    //根据指定的散列值，返回对应的交易信息
    rpc.call("getrawtransaction", [transactions[i].id],
        (tx) =>
        {
            //TODO:读取交易数据，在本地存储UnSpentCoin

            getAllTransactions(transactions, ++i, callback);
        },
        (err) => { console.log(err); }
    );
}
