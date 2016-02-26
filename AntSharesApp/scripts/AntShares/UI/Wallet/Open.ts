namespace AntShares.UI.Wallet
{
    export class Open extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("button").click(this.OnOpenButtonClick);
        }

        private OnOpenButtonClick()
        {
            //TODO:
        }
    }
}
