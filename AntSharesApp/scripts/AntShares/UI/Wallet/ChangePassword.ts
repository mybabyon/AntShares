namespace AntShares.UI.Wallet
{
    export class ChangePassword extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("button").click(this.OnChangePasswordButtonClick);
            $(this.target).find("#old_password").change(() => { this.vertifyPassword() });
            $(this.target).find("#list_wallet_name2 input[name='wallet2']").change(() => { this.vertifyPassword() });
        }

        private vertifyPassword()
        {
            verifyPassword(
                $('#list_wallet_name2 input[name="wallet2"]:checked').val(),
                "old_password",
                "change_error")
        }

        protected onload(): void
        {
            let master = AntShares.Wallets.Master.GetInstance();
            master.OpenDB(
                () =>
                {
                    master.GetWalletNameList(listWallet)
                }
            );
        }

        private OnChangePasswordButtonClick()
        {
            if (formIsValid("form_change_password"))
            {
                let wallet = new AntShares.Wallets.Wallet();
                let walletName = $('#list_wallet_name2 input[name="wallet"]:checked ').val();
                wallet.OpenDB(walletName,
                    () =>
                    {
                        wallet.VerifyPassword(toUint8Array($("#old_password").val()),
                            () =>
                            {
                                $("#change_error").hide();
                                wallet.ChangePassword(
                                    toUint8Array($("#old_password").val()),
                                    toUint8Array($("#new_password").val()),
                                    () => { alert("修改钱包密码成功"); }
                                );
                            },
                            () =>
                            {
                                $("#change_error").show();
                            }
                        );
                    });
            }
        }
    }

    function listWallet(walletNameList: Array<string>)
    {
        if (walletNameList.length == 0)
        {
            $("#list_wallet_name2").hide();
            $("#input_wallet_name2").show();
        }
        else
        {
            $("#input_wallet_name2").hide();
            $("#list_wallet_name2").show();
            let ul = $("#list_wallet_name2");
            ul.find("li:visible").remove();
            for (let i = 0; i < walletNameList.length; i++)
            {
                let liTemplet = ul.find("li:eq(0)");
                let li = liTemplet.clone();
                li.removeAttr("style");
                li.find("input").val(walletNameList[i]);
                li.find("span").text(walletNameList[i]);
                if (i == 0) //第一个默认选中
                {
                    li.find("input").attr("checked", 'checked');
                }
                ul.append(li);
            }
        }
    }
}