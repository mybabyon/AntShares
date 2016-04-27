namespace AntShares.UI.Contract
{
    export class Index extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("#create_account").click(this.OnCreateButtonClick);
        }

        protected onload(): void
        {
            let wallet = GlobalWallet.GetCurrentWallet();
            wallet.TraversalData(StoreName.Contract,
                (rawData: Array<ContractStore>) =>
                {
                    for (let i = 0; i < rawData.length; i++)
                    {
                        addContractList(rawData[i])
                    }

                }
            );
        }

        private OnCreateButtonClick()
        {
            TabBase.showTab("#Tab_Account_Details");
            //if (formIsValid("form_account_list")) {

            //}
        }

    }

    function addContractList(i: ContractStore)
    {
        let ul = $("#form_contract_list").find("ul:eq(1)");
        ul.find("li:visible").remove();
        let liTemplet = ul.find("li:eq(0)");
        let li = liTemplet.clone(true);
        li.removeAttr("style");
        let span = li.find("span");
        let a = li.find("a");

        a.click(() =>
        {
            TabBase.showTab("#Tab_Contract_Details", i);
        });

        toAddress(i.ScriptHash, (addr) => { span.text(addr) });
        
        ul.append(li);
    }

}