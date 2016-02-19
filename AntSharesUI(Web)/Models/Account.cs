using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace AntSharesUI_Web_.Models
{
    public class Account
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "账户名不能为空")]
        public string Name { get; set; }

        [Required(ErrorMessage = "私钥不能为空")]
        public string PrivateKey { get; set; }
    }
}
