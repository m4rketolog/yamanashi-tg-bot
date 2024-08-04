const { addAccount, getAllAccounts, addMoreAccounts, countAllAcounts } = require('../db/db');
require('dotenv').config();

const requiredChannel = process.env.CHANNEL_USERNAME

function filterInputData(data) {
  const lines = data.trim().split('\n').filter(line => line.trim() !== '');
  console.log(lines);
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

module.exports = {
  handleAddAccount,
  handleListAccounts,
  handleManyAccounts,
  handleCountAccounts,
};
