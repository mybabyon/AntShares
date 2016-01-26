using System.Linq;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Mvc.Rendering;
using Microsoft.Data.Entity;
using AntSharesUI_Web_.Models;

namespace AntSharesUI_Web_.Controllers
{
    public class AssetController : Controller
    {

        // GET: Asset/MyAsset
        public IActionResult MyAsset()
        {
            return View();
        }

        // GET: Asset/ANS
        public IActionResult ANS()
        {
            return View();
        }

        // GET: Asset/ANC
        public IActionResult ANC()
        {
            return View();
        }

        // GET: Asset/Equity
        public IActionResult Equity()
        {
            return View();
        }

        // GET: Asset/Coin
        public IActionResult Coin()
        {
            return View();
        }

        // GET: Asset/Others
        public IActionResult Others()
        {
            return View();
        }
        // GET: Asset/Transfer
        public IActionResult Transfer()
        {
            return View();
        }
    }
}
