namespace AntShares.UI.Account
{
    export class Import extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("#import_prikey").click(this.OnImportButtonClick);
        }

        protected onload(): void
        {

        }

        private OnImportButtonClick()
        {
            if (formIsValid("form_create_wallet"))
            {
                let wif = $("#import_prikey_input").val()
                checkPrivateKeyWIF(wif, (prikey) =>
                {
                    //用私钥生成Account，加密后存到IDB中
                    let publicKey = Cryptography.ECPoint.multiply(Cryptography.ECCurve.secp256r1.G, prikey);
                    
                    //GlobalWallet.GetCurrentWallet().AddAccount(new AccountStore());
                },
                (msg) =>
                {

                });
                
            }
        }

    }

    export function checkPrivateKeyWIF(wif: string, success: (prikey: Uint8Array) => any, error: (msg: string) => any)
    {

        let decode = wif.base58Decode();
        if (decode[0] != 0x80 || decode[33] != 0x10)
            error("格式错误");
        let checkA = decode.subarray(34, 38);

        let data = new Uint8Array(38);
        decode = decode.subarray(0, 34);
        sha256Twice(decode,
            (result) =>
            {
                let checkB = result.subarray(0, 4);
                if (Equeal(checkA, checkB))
                {
                    let prikey = decode.subarray(1, 33);
                    success(prikey);
                }
            })
    }
    
}