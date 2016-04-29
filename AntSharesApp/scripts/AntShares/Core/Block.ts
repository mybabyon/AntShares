namespace AntShares.Core
{
    export class Block
    {
        public hash: string;
        public version: number;
        public previousblockhash: string;
        public merkleroot: string;
        public time: number;
        public height: number;
        public nonce: number;
        public nextminer: string;
        public script: Script;
        public tx: Array<Transaction>;
    }
}

