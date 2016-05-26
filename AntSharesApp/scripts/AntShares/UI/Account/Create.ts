namespace AntShares.UI.Account {
    export class Create extends TabBase {
        private CurrentHeight: number;

        protected oncreate(): void {
            $(this.target).find("#create_account_action").click(this.OnCreateButtonClick);
            $(this.target).find("#test").click(this.OnTestClick);
        }

        protected onload(args: any[]): void {
            
        }

        private OnCreateButtonClick() {
            //if (formIsValid("form_create_account")) {

            //}

            let account = new Wallets.Account();
            let wallet = GlobalWallet.GetCurrentWallet();
            wallet.CreateECDSAKey('我的账户3', account, (pAccount) => {
                console.log(1);
                wallet.CreateContract(pAccount.publicKeyHash, pAccount.publicECPoint, this.CurrentHeight, (pWallet) => {
                    console.log(2);
                    pWallet.LoadAccounts(() => {
                        console.log(3);
                        pWallet.LoadContracts(() => {
                            console.log(4);
                            pWallet.LoadCoins(() => {
                                alert("创建账户成功");
                                //新建账户成功后跳转至账户管理页面
                                TabBase.showTab("#Tab_Account_Index");
                            })
                        })
                    });
                });
            });


        }

        

        private OnTestClick() {

            function getUserInput(name, gender, callback) {
                let x = name + " is " + gender;
                if (typeof callback === "function") {
                    callback(x);
                }
            }

            var el = document.getElementById('contentssss');
            var test = new Test(el);

            getUserInput("Michael", "Man", (param1) => {
                test.add(param1);
                getUserInput("Michael", "Man", (param2) => {
                    test.add(param2);
                    getUserInput("Michael", "Man", (param3) => {
                        test.add(param3);
                        getUserInput("Michael", "Man", (param4) => {
                            test.add(param4);
                            getUserInput("Michael", "Man", (param5) => {
                                test.add(param5);
                            })
                        })
                    })
                })
            });
        }

    }

    export class Test {
        element: HTMLElement;

        constructor(element: HTMLElement) {
            this.element = element;
        }

        add(str: string) {
            this.element.innerHTML += str + "</br>";
        }
    }
}