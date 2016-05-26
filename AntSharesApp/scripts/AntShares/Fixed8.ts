namespace AntShares
{
    export class Fixed8
    {
        private low: number;
        private high: number;

        public from32(low: number, high: number)
        {
            this.low = low;
            this.high = high;
            if (low < 0 && high == 0)
                this.high = -1;
        }

        public from64(low: number, high: number)
        {
            this.low = low;
            this.high = high;
        }

        public fromString(str: string)
        {

        }

        public serialize(): Uint8Array
        {
            let array = new Array<Uint8Array>();
            array.push(this.low.serialize(4));
            array.push(this.high.serialize(4));
            return ToUint8Array(array);
        }
    }
}