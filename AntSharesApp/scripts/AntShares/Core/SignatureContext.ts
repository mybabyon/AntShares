﻿namespace AntShares.Core
{
    export class SignatureContext
    {
        public ScriptHashes: Uint8Array[];
        public Signable: ISignable;
        private redeemScripts: Uint8Array[];
        private signatures: SignatureDictionary[];
        private completed: boolean[];

        public Add(contract: Wallets.ContractItem, pubkey: Uint8Array, signature: Uint8Array): boolean
        {
            let publicECPoint = Cryptography.ECPoint.fromUint8Array(pubkey, Cryptography.ECCurve.secp256r1);
            for (let i = 0; i < this.ScriptHashes.length; i++)
            {
                if (this.ScriptHashes[i] == contract.ScriptHash)
                {
                    if (this.redeemScripts[i] == null)
                        this.redeemScripts[i] = contract.RedeemScript;
                    if (this.signatures[i] == null)
                        this.signatures[i] = new SignatureDictionary();
                    if (this.signatures[i].ContainsKey(publicECPoint))
                        this.signatures[i].Set(publicECPoint, signature);
                    else
                        this.signatures[i].Add(publicECPoint, signature);
                    this.Check(contract);
                    return true;
                }
            }
            return false;
        };

        public Check(contract: Wallets.ContractItem)
        {
            for (let i = 0; i < this.ScriptHashes.length; i++)
            {
                if (this.ScriptHashes[i] == contract.ScriptHash)
                {
                    this.completed[i] = contract.IsCompleted(this.signatures[i].GetKeys());
                    break;
                }
            }
        }

    }
}