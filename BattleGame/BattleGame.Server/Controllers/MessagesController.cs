using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using BattleGame.Server.Models;
using System.Text;
using BattleGame.Server.Persisters;

namespace BattleGame.Server.Controllers
{
    public class MessagesController : BaseApiController
    {
        [HttpGet]
        [ActionName("all")]
        public HttpResponseMessage GetAllMessages(string sessionKey)
        {
            var responseMsg = this.PerformOperation(() =>
            {
                var userId = UserDataPersister.LoginUser(sessionKey);
                var messages = MessagesDataPersister.GetAllMessages(userId);
                return messages;

            });
            return responseMsg;
        }

        [HttpGet]
        [ActionName("unread")]
        public HttpResponseMessage GetUnreadMessages(string sessionKey)
        {
            var responseMsg = this.PerformOperation(() =>
            {
                var userId = UserDataPersister.LoginUser(sessionKey);
                var messages = MessagesDataPersister.GetUnreadMessages(userId);
                return messages;
            });
            return responseMsg;
        }
    }
}