namespace AntShares.UI.Wallet
{
    export class ChangePassword extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("button").click(this.OnChangePasswordButtonClick);
            $(this.target).find("#old_password").change(() => { this.vertifyPassword() });
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
            let wallet = GlobalWallet.GetCurrentWallet();
            if (wallet.accounts.length <= 0)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            $("#change_wallet_name").text(wallet.dbName);
        }

        private OnChangePasswordButtonClick()
        {
            let wallet = GlobalWallet.GetCurrentWallet();
            if (formIsValid("form_change_password"))
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
            }
        }
    }
}