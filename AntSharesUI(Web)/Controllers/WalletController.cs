using System.Linq;
using Microsoft.AspNet.Mvc;
using Microsoft.AspNet.Mvc.Rendering;
using Microsoft.Data.Entity;
using AntSharesUI_Web_.Models;
using Microsoft.AspNet.Http;
using Microsoft.Net.Http.Headers;
using System.Threading.Tasks;

namespace AntSharesUI_Web_.Controllers
{
    public class WalletController : Controller
    {
        // GET: Wallet/MyWallet
        public IActionResult MyWallet()
        {
            ViewBag.Addresses = new string[] { "AbcdXweW6trsVwcBSUYrK69u4cBhDg4ZJF", "Abcdm9wpAgyYr3KHvKweGov5U3VJLmtB8W", "ANttyFkVZxGh93TmjgkiFe1TgS3csGfhJD" };
            return View();
        }

        //http://www.cnblogs.com/redmoon/p/4601133.html
        [HttpPost]
        public async Task<IActionResult> Upload(IFormFile wallet, string Password)
        {            
            if (wallet != null)
            {
                var fileName = ContentDispositionHeaderValue.Parse(wallet.ContentDisposition).FileName.Trim('"');
                if (fileName.EndsWith(".db3"))// 只保存db3文件
                {
                    if (Password.Length > 3)//验证密码正确性
                    {
                        var filePath = "WalletFile.db3";
                        await wallet.SaveAsAsync(filePath);
                        return RedirectToAction("MyWallet");
                    }
                    else
                    {
                        return RedirectToAction("Error");
                    }
                }
            }
            
            return RedirectToAction("Open");
        }

        // GET: Wallet/Open
        public IActionResult Open()
        {
            return View();
        }

        // GET: Wallet/Error
        public IActionResult Error()
        {
            return View();
        }

        // GET: Wallet/Create
        public IActionResult Create()
        {
            return View();
        }

        // GET: Wallet/ChangePassword
        public IActionResult ChangePassword()
        {
            return View();
        }

        // GET: Wallet/Address?id=1
        public IActionResult Address(int id)
        {
            return View();
        }
    }
}
