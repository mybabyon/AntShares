using System.Linq;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Mvc.Rendering;
using Microsoft.Data.Entity;
using AntSharesUI_Web_.Models;

namespace AntSharesUI_Web_.Controllers
{
    public class AccountsController : Controller
    {


        // GET: Accounts/AccountList
        public IActionResult AccountList()
        {
            ViewBag.Accounts = new string[] { "我常用的账户", "私人账户", "公司账户" };
            return View();
        }

        // GET: Accounts/Account?id=1
        public IActionResult Account(int id)
        {
            return View();
        }

        // GET: Accounts/Create
        public IActionResult Create(int id)
        {
            return View();
        }
    }
}
