using System.Linq;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Mvc.Rendering;
using Microsoft.Data.Entity;
using AntSharesUI_Web_.Models;

namespace AntSharesUI_Web_.Controllers
{
    public class ContractsController : Controller
    {

        // GET: Contracts/ContractList
        public IActionResult ContractList()
        {
            return View();
        }

        // GET: Contracts/Contract?id=1
        public IActionResult Contract(int id)
        {
            return View();
        }
    }
}
