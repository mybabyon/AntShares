using Microsoft.AspNet.Mvc;

namespace AntSharesUI_Web_.Controllers
{
    public class AccountController : Controller
    {


        // GET: Account/Index
        public IActionResult Index()
        {
            ViewBag.Accounts = new string[] { "我常用的账户", "私人账户", "公司账户" };
            return View();
        }

        // GET: Account/Account?id=1
        public IActionResult Account(int id)
        {
            return View();
        }

        // GET: Account/Create
        public IActionResult Create()
        {
            return View();
        }

        // GET: Account/Import
        public IActionResult Import()
        {
            return View();
        }

        // GET: Account/Certification?id=1
        public IActionResult Certification(int id)
        {
            return View();
        }
    }
}
