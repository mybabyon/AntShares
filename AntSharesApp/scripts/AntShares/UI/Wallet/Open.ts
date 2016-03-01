namespace AntShares.UI.Wallet
{
    export class Open extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("button").click(this.OnOpenButtonClick);
        }

        protected onload(): void
        {
            
        }

        private OnOpenButtonClick()
        {
            //TODO:
        }
    }
}
