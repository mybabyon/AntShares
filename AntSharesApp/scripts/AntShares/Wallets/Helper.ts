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
