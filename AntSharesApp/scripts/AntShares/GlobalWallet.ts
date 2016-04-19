class GlobalWallet
{
    private static wallets = Array<AntShares.Wallets.Wallet>();
    private static currentWalletIndex = 0;

    /**
     * 获取当前钱包实例
     */
    public static GetCurrentWallet(): AntShares.Wallets.Wallet
    {
        if (this.wallets.length == 0 || this.wallets.length < this.currentWalletIndex)
        {
            this.wallets.push(new AntShares.Wallets.Wallet());
        }
        return this.wallets[this.currentWalletIndex];
    }

    /**
     * 每次打开一个新钱包时新建一个钱包实例
     *
     */
    public static NewWallet(): AntShares.Wallets.Wallet
    {
        if (this.wallets.length == 0)
            return this.GetCurrentWallet();
        this.wallets.push(new AntShares.Wallets.Wallet());
        this.currentWalletIndex++;
        return this.wallets[this.currentWalletIndex];
    }
}