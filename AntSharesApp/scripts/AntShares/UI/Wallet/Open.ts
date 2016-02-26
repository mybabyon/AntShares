namespace AntShares.UI.Wallet
{
    export class Open extends TabBase
    {
        protected init(target: Element): void
        {
            $(target).find("button").click(this.OnOpenButtonClick);
        }

        private OnOpenButtonClick()
        {
            //TODO:
        }
    }
}
