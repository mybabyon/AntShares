function InputEqueal(x: TransactionInput, y: TransactionInput)
{
    return x.txid == y.txid && x.vout == y.vout;
}

function CoinsIndexof(coins: CoinItem[], input: TransactionInput): number
{
    for (let i = 0; i < coins.length; i++)
    {
        if (InputEqueal(coins[i].Input, input))
            return i;
    }
    return -1;
}