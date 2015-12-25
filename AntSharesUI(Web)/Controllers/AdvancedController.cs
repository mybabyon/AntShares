using System.Linq;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Mvc.Rendering;
using Microsoft.Data.Entity;
using AntSharesUI_Web_.Models;

namespace AntSharesUI_Web_.Controllers
{
    public class AdvancedController : Controller
    {

        // GET: Advanced/Sign
        public IActionResult Sign()
        {
            return View();
        }
    }
}
