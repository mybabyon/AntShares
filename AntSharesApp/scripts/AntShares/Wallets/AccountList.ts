class AccountList {
    public static List = new Array<AccountItem>();
}

class AccountItem {
    PublicKeyHash: Uint8Array;
    PrivateKey: Uint8Array;
    PublicKey: Uint8Array;
}