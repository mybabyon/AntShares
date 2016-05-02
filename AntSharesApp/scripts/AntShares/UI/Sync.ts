namespace AntShares.UI
{
    export class Sync
    {
        private started = false;

        public getblockcount = () =>
        {
            let rpc = new AntShares.Network.RPC.RpcClient("http://seed1.antshares.org:20332/");

            rpc.call("getblockcount", [],
                (result) =>
                {
                    $("#remote_height").text(result - 1);

                    setTimeout(this.getblockcount, 5000);
                },
                (error) =>
                {
                    setTimeout(this.getblockcount, 5000);
                }
            );
        }

        /**
         * 在线更新钱包中的未花费的币
         * 打开钱包后调用
         */
        public startSyncWallet()
        {
            if (!this.started)
            {
                this.syncWallet();
                this.started = true;
            }
        }

        private syncWallet = () =>
        {
            GlobalWallet.GetCurrentWallet().GetDataByKey(StoreName.Key, "Height",
                (height: AntShares.Wallets.KeyStore) =>
                {
                    $("#local_height").text(height.Value - 1);
                    let rpc = new AntShares.Network.RPC.RpcClient("http://seed1.antshares.org:20332/");
                    //根据指定的高度（索引），返回对应区块的散列值
                    rpc.call("getblockhash", [height.Value as number],
                        (hash) =>
                        {
                            //根据指定的散列值，返回对应的区块信息
                            rpc.call("getblock", [hash],
                                (block: Core.Block) =>
                                {
                                    if (block.tx.length <= 1)
                                    {
                                        GlobalWallet.GetCurrentWallet().HeightPlusOne(this.syncWallet());
                                    }
                                    else
                                    {
                                        this.processNewBlock(block);
                                    }
                                },
                                (err) =>
                                {
                                    this.started = false;
                                    console.log(err.message);
                                }
                            );
                        },
                        (err) =>
                        {
                            this.started = false;
                            console.log(err.message);
                        }
                    );
                });
        }

        /**
         * 参考项目中的 Wallet.cs 中的 ProcessNewBlock()
         */
        private processNewBlock = (block: Core.Block) =>
        {
            for (let i = 0; i < block.tx.length; i++)
            {
                for (let index = 0; index < block.tx[i].vout.length; index++)
                {
                    let out = block.tx[i].vout[index] as Core.TransactionOutput;
                    let input = block.tx[i].vin[index] as Core.TransactionInput;
                    let wallet = GlobalWallet.GetCurrentWallet();
                    let contains = false;
                    let existed = false;
                    for (let c = 0; c < wallet.contracts.length; c++)
                    {
                        if (Equeal(wallet.contracts[c].ScriptHash, out.address))
                        {
                            contains = true;
                        }
                    }
                    if (contains)
                    {
                        for (let c = 0; c < wallet.coins.length; c++)
                        {
                            let coin = wallet.coins[c];
                            if (coin.Input.txid == input.txid && coin.Input.vout == input.vout)
                            {
                                existed = true;
                            }
                        }
                    }
                    if (contains && !existed)
                    {
                        wallet.AddCoin(new CoinStore(input.txid, index, out.asset, out.value, out.address, Core.CoinState.Unspent));
                    }
                }
            }
            //尚未经过测试
        }
    }
}