using Microsoft.AspNet.Mvc;

namespace AntSharesUI_Web_.Controllers
{
    public class ContractController : Controller
    {

        // GET: Contract/Index
        public IActionResult Index()
        {
            return View();
        }

        // GET: Contract/Contract?id=1
        public IActionResult Contract(int id)
        {
            return View();
        }
    }
}
