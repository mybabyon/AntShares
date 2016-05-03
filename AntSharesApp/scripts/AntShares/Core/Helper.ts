function InputEqueal(x: AntShares.Core.TransactionInput, y: AntShares.Core.TransactionInput)
{
    return x.prevHash == y.prevHash && x.prevIndex == y.prevIndex;
}

function CoinsContains(coins: AntShares.Wallets.CoinItem[], input: AntShares.Core.TransactionInput)
{
    for (let i = 0; i < coins.length; i++)
    {
        if (InputEqueal(coins[i].Input, input))
            return true;
    }
    return false;
}