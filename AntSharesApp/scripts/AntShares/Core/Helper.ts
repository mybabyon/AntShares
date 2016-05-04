function InputEqueal(x: AntShares.Core.TransactionInput, y: AntShares.Core.TransactionInput)
{
    return x.prevHash == y.prevHash && x.prevIndex == y.prevIndex;
}

function CoinsIndexof(coins: AntShares.Wallets.CoinItem[], input: AntShares.Core.TransactionInput): number
{
    for (let i = 0; i < coins.length; i++)
    {
        if (InputEqueal(coins[i].Input, input))
            return i;
    }
    return -1;
}