namespace AntShares.UI
{
    export class Sync
    {
        private started = false;
        private synced = false;

        public getblockcount = () =>
        {
            let rpc = new RpcClient("http://seed1.antshares.org:20332/");

            rpc.call("getblockcount", [],
                (count) =>
                {
                    let height = count - 1;
                    $("#remote_height").text(height);
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
        public startSyncWallet = () =>
        {
            if (!this.started)
            {
                this.syncWallet();
                this.started = true;
                $('#testbutton1').show();
                //测试用
                $('#testbutton1').click(() =>
                {
                    let wallet = GlobalWallet.GetCurrentWallet();
                    wallet.UpdateDataByKey(StoreName.Key, "Height", new Wallets.KeyStore("Height", 110000));
                    wallet.ClearObjectStore(StoreName.Coin);
                    wallet.coins = new Array<CoinItem>();
                    console.log("reset success");

                    this.syncWallet();
                });
            }
        }

        private syncWallet = () =>
        {
            GlobalWallet.GetCurrentWallet().GetDataByKey(StoreName.Key, "Height",
                (height: AntShares.Wallets.KeyStore) =>
                {
                    $("#local_height").text(height.Value);
                    let remote_height = $("#remote_height").text();
                    let rpc = new RpcClient("http://seed1.antshares.org:20332/");
                    //根据指定的高度（索引），返回对应区块的散列值
                    rpc.call("getblockhash", [height.Value],
                        (hash) =>
                        {
                            //根据指定的散列值，返回对应的区块信息
                            rpc.call("getblock", [hash],
                                (block: Core.Block) =>
                                {
                                    if (block.tx.length <= 1)
                                    {
                                        if (height.Value as any < $("#remote_height").text())
                                        {
                                            height.Value++;
                                            GlobalWallet.GetCurrentWallet().UpdateDataByKey(StoreName.Key, "Height", height, this.syncWallet);
                                        }
                                        else
                                        {
                                            setTimeout(this.syncWallet, 5000);
                                        }
                                    }
                                    else
                                    {
                                        this.processNewBlock(block, () =>
                                        {
                                            if (height.Value as any < $("#remote_height").text())
                                            {
                                                height.Value++;
                                                GlobalWallet.GetCurrentWallet().UpdateDataByKey(StoreName.Key, "Height", height, this.syncWallet);
                                            }
                                            else
                                            {
                                                setTimeout(this.syncWallet, 5000);
                                            }
                                        });
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
                            setTimeout(this.syncWallet, 5000);
                        }
                    );
                });
        }

        /**
         * 参考项目中的 Wallet.cs 中的 ProcessNewBlock()
         */
        private processNewBlock = (block: Core.Block, callback) =>
        {
            let wallet = GlobalWallet.GetCurrentWallet();
            for (let tx of block.tx) //547
            {
                for (let index = 0; index < tx.vout.length; index++) //549
                {
                    let out = tx.vout[index] as Core.TransactionOutput;
                    let input = new Core.TransactionInput(tx.txid, index);
                    if (wallet.contracts.ToList<Wallets.ContractItem>().Select(p => p.Address).Contains(out.address)) //552
                    {
                        let c = CoinsIndexof(wallet.coins, input);
                        if (c > 0)
                        {
                            wallet.coins[c].State = Core.CoinState.Unspent;
                        }
                        else
                        {
                            wallet.AddCoin(new CoinStore(input, out.asset, out.value, out.address, Core.CoinState.Unspent), () =>
                            {
                                console.log("添加coin成功");
                                //重新把coin加载到内存中
                                wallet.LoadCoins(() => { });
                            });
                        }
                    }
                }
            }
            let allInputs = new Array<Core.TransactionInput>(); //573
            for (let i = 0; i < block.tx.length; i++)
            {
                allInputs.concat(block.tx[i].vin);
            }
            for (let input of allInputs)
            {
                let i = CoinsIndexof(wallet.coins, input);
                if (i > 0) //575
                {
                    //字符串为小蚁股的Hash，临时这么写，以后估计要改
                    if (Equeal(wallet.coins[i].AssetId, "2a3e45c2a344660cbd7daf638292c5afed64960c39681dcb4258dde731ac2a3d".hexToBytes()))
                    {
                        wallet.coins[i].State = Core.CoinState.Spent;
                    }
                    else
                    {
                        wallet.coins.splice(i);
                    }
                }
            }
            let claims = new Array<Core.TransactionInput>(); //583
            for (let i = 0; i < block.tx.length; i++)
            {
                if (block.tx[i].type == Core.TransactionType.ClaimTransaction)
                    claims.concat(block.tx[i].vin);
            }
            for (let claim of claims)
            {
                let i = CoinsIndexof(wallet.coins, claim);
                if (i > 0) //585
                {
                    wallet.coins.splice(i);
                }
            }

            callback();
        }
    }
}