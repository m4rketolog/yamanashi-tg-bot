const { 
  addAccount, 
  getAllAccounts, 
  addMoreAccounts, 
  countAllAcounts,
  createWorker, 
  getAccountsWork, 
  postDailyAccounts,
} = require('../db/db');
require('dotenv').config();

const requiredChannel = process.env.CHANNEL_USERNAME

function filterInputData(data) {
  const lines = data.trim().split('\n').filter(line => line.trim() !== '');
  const res = lines.map((line)=> {
    if (line[0] === "@") {
      const [login, password, email, emailPassword] = line.split(':');

      const region = null;
          return {
              region,
              login,
              password,
              email,
              emailPassword, 
          };
    }else {
      const [region, login, password, email, emailPassword] = line.split(':');
  
      return {
          region,
          login,
          password,
          email,
          emailPassword
      };
    }
  })
  return res;
}
function filterPostAccounts(data) {
  const lines = data.trim().split('\n').filter(line => line.trim() !== '');
  console.log(lines);
  return lines;
}

async function isAdmin(ctx) {
  const chatMember = await ctx.telegram.getChatMember(requiredChannel, ctx.message.from.id);
  
  if (chatMember.status === 'administrator' || chatMember.status === 'creator') {
    return true;
  } else {
    return false;
  }
}

async function handleAddAccount(ctx) {
  if (!await isAdmin(ctx)) {
    return ctx.reply('У вас нет прав для этой команды.');
  }

  const messageText = ctx.message.text;
  const accountDetails = filterInputData(messageText);
  if (!accountDetails[0].login && !!accountDetails[0].email) {
    return ctx.reply('Отошлите данные от аккаунта в формате: addaccount мой_пароль/мой_логин');
  }

  addAccount(accountDetails[0], ctx);
}

async function handleManyAccounts(ctx) {
  if (!await isAdmin(ctx)) {
    return ctx.reply('У вас нет прав для этой команды.');
  }
  const messageText = ctx.message.text;
  const accountsDetails = filterInputData(messageText);
  if (!accountsDetails) {
    return ctx.reply('Отошлите данные от аккаунта в формате: addaccount мой_пароль/мой_логин');
  }

  addMoreAccounts(accountsDetails, ctx);
}

async function handleListAccounts(ctx) {
  if (!await isAdmin(ctx)) {
    return ctx.reply('У вас нет прав для этой команды.');
  }

  const accounts = await getAllAccounts();
  ctx.reply(accounts.join('\n') || 'Нет аккаунтов в базе.');
}

async function handleCountAccounts(ctx) {
  const count = await countAllAcounts();
  ctx.reply(`Всего в базе аккаунтов: ${count}` || 'Всего 0 аккаунтов.');
}

async function handleGetAccountsWork(ctx) {
  
  const userId = ctx.from.id.toString();
  const dailyAccounts = await getAccountsWork(userId);
  console.log(dailyAccounts, "daile")
  if (dailyAccounts.error) {
    console.log("error")
    return ctx.reply(`${dailyAccounts.error}`)
  }
  
  const res = dailyAccounts.map((account) => {
    if (account.region) {
      return (`${account.region}${account.login}:${account.password}:${account.email}:${account.emailPassword} \n`);
    
    } else if (account.region === null) {
      
      return (`${account.login}:${account.password}:${account.email}:${account.emailPassword} \n`);
    }
  })
  ctx.reply(res.join('\n') || 'Нет аккаунтов в базе.')
}

async function handleCreateWorker(ctx) {
  const userId = ctx.from.id.toString();
  await createWorker(userId);
}

async function handleDailyAccountsPost(ctx) {
  const userId = ctx.from.id.toString();
  const messageText = filterPostAccounts(ctx.message.text);
  
  const res = await postDailyAccounts(messageText, userId);
  if (res.error) {
    return ctx.reply(res.error);
  }
  return ctx.reply(res.message);
}

module.exports = {
  handleAddAccount,
  handleListAccounts,
  handleManyAccounts,
  handleCountAccounts,
  handleCreateWorker,
  handleGetAccountsWork,
  handleDailyAccountsPost,
};
