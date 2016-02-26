namespace AntShares.UI
{
    export abstract class TabBase
    {
        protected target: Element;

        protected init(target: Element, args?: any[]): void
        {
            this.target = target;
        }

        public static showTab(id: string, ...args): void
        {
            $('.content>.tab-content>.tab-pane').removeClass("active");
            $(id).addClass("active");
            let className = id.replace("#Tab_", "AntShares.UI.").replace('_', '.');
            let t: () => void;
            try { t = eval(className); } catch (ex) { }
            if (t == null) return;
            let tab = new t() as TabBase;
            tab.init($(id)[0], args);
        }
    }

    $('.tab-trigger').click(function ()
    {
        event.preventDefault();
        TabBase.showTab($(this).attr("href"), $(this).data("args"));
    });

    $(function ()
    {
        TabBase.showTab('#' + $('.content>.tab-content>.tab-pane.active').attr("id"));
    });
}
