namespace AntShares.UI.Account
{
    export class Details extends TabBase
    {
        protected oncreate(): void
        {

        }

        protected onload(args: any[]): void
        {
            let wallet = GlobalWallet.GetCurrentWallet();
            let i = args[0] as number;
            let x = wallet.accounts[i].PublicKey.subarray(0, 32);
            let y = wallet.accounts[i].PublicKey.subarray(32, 64);
            let ecpoint = new Cryptography.ECPoint(
                new Cryptography.ECFieldElement(new BigInteger(x), Cryptography.ECCurve.secp256r1),
                new Cryptography.ECFieldElement(new AntShares.BigInteger(y), Cryptography.ECCurve.secp256r1),
                Cryptography.ECCurve.secp256r1);
            $("#public_key").text(ecpoint.encodePoint(true).toHexString());
            Export(wallet.accounts[i].PrivateKey, (wif) =>
            {
                $("#privatekey_export").text(wif);
            });
            $("#privatekey_hex").text(wallet.accounts[i].PrivateKey.toHexString());
        }
    }
}