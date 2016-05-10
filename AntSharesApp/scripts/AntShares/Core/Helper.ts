function InputEqueal(x: TransactionInput, y: TransactionInput)
{
    return x.prevHash == y.prevHash && x.prevIndex == y.prevIndex;
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