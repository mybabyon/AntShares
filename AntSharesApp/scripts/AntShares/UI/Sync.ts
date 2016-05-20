namespace AntShares.UI
{
    import CoinItem = AntShares.Wallets.CoinItem;
    import CoinStore = AntShares.Wallets.CoinStore;

    export class Sync
    {
        static started = false;
        static resetHeight = false;
        static stop = true;
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
            if (!Sync.started)
            {
                Sync.started = true;
                this.syncWallet();
                $('#testbutton1').show();
                //测试用，重新设置钱包本地同步的高度
                $('#testbutton1').click(() => { Sync.resetHeight = true; });
            }
        }
        public stopSyncWallet = () =>
        {
            if (Sync.started)
            {
                $('#testbutton1').hide();
                $("#local_height").text(0);
                Sync.started = false;
            }
        }

        private syncWallet = () =>
        {
            let wallet = GlobalWallet.GetCurrentWallet();
            if (Sync.resetHeight)
            {
                wallet.SetHeight(113415, () =>  //108678  113415   113480
                {
                    //wallet.ClearObjectStore(StoreName.Coin);
                    //wallet.coins = new Array<CoinItem>();
                    wallet.GetDataByKey(StoreName.Key, "Height",
                        (height: AntShares.Wallets.KeyStore) =>
                        {
                            console.log("已从高度" + height.Value + "重建钱包");
                            $("#local_height").text(height.Value);
                            Sync.resetHeight = false;
                        });
                });
            }
            if (!Sync.started)
            {
                console.log("钱包同步已停止");
                return;
            }
            wallet.GetDataByKey(StoreName.Key, "Height",
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
                                            wallet.SetHeight(++height.Value, this.syncWallet);
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
                                                wallet.SetHeight(++height.Value, this.syncWallet);
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
                                    Sync.started = false;
                                    console.log(err.message);
                                }
                            );
                        },
                        (err) =>
                        {
                            Sync.started = false;
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
                if (tx.txid == "2b0ff191ff706aa07789b3abce6b913e3857edec7181088ebef667b1fba9d3f0")
                {
                    let add9200 = 0;
                }
                if (tx.txid == "1ea41b588bfa16931cbf945b2f619a778dafbe9ce3a1118586ab5537b32b0315")
                {
                    let sub100 = 0;
                }
                if (tx.txid == "e10cf5d60a089713b57469cda43806f17b5053cba4aa6fd3ca40bbd8aa9675f2")
                {
                    let sub100 = 0;
                }
                for (let index = 0; index < tx.vout.length; index++) //549
                {
                    let out = tx.vout[index] as Core.TransactionOutput;
                    let input = new Core.TransactionInput(tx.txid, index);
                    let contains = false;
                    for (let c of wallet.contracts) //552
                    {
                        if (c.Address == out.address)
                        {
                            contains = true;
                            break;
                        }
                    }
                    if (contains)
                    {
                        let c = CoinsIndexof(wallet.coins, input);
                        if (c > 0)
                        {
                            //将更新后的Coin的State写入数据库
                            wallet.UpdateDataByKey(StoreName.Coin, wallet.coins[c].toKey(),
                                new CoinStore(wallet.coins[c].Input, wallet.coins[c].AssetId, wallet.coins[c].Value, wallet.coins[c].Address, Core.CoinState.Unspent));
                            wallet.coins[c].State = Core.CoinState.Unspent;
                        }
                        else
                        {
                            wallet.coins.push(new CoinItem(input, out.address, Core.CoinState.Unspent, out.asset, out.value));
                            wallet.AddCoin(new CoinStore(input, out.asset, out.value, out.address, Core.CoinState.Unspent));
                        }
                    }
                }
            }
            let allInputs = new Array<Core.TransactionInput>(); //573
            for (let i = 0; i < block.tx.length; i++)
            {
                allInputs = allInputs.concat(block.tx[i].vin);
            }
            for (let input of allInputs)
            {
                let i = CoinsIndexof(wallet.coins, input);
                if (i >= 0) //575
                {
                    if (wallet.coins[i].AssetId == AntShare.AssetId)
                    {
                        //将更新后的Coin的State写入数据库
                        wallet.UpdateDataByKey(StoreName.Coin, wallet.coins[i].toKey(),
                            new CoinStore(wallet.coins[i].Input, wallet.coins[i].AssetId, wallet.coins[i].Value, wallet.coins[i].Address, Core.CoinState.Spent));
                        wallet.coins[i].State = Core.CoinState.Spent;
                    }
                    else
                    {
                        wallet.coins.splice(i);
                        wallet.DeleteDataByKey(StoreName.Coin, wallet.coins[i].toKey());
                    }
                }
            }
            let claims = new Array<Core.TransactionInput>(); //583
            for (let i = 0; i < block.tx.length; i++)
            {
                if (block.tx[i].type == Core.TransactionType.ClaimTransaction)
                    claims = claims.concat(block.tx[i].vin);
            }
            for (let claim of claims)
            {
                let i = CoinsIndexof(wallet.coins, claim);
                if (i > 0) //585
                {
                    wallet.coins.splice(i);
                    wallet.DeleteDataByKey(StoreName.Coin, wallet.coins[i].toKey());
                }
            }

            callback();
        }
    }
}