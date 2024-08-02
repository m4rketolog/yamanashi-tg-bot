const { addAccount, getAllAccounts, addMoreAccounts, countAllAcounts } = require('../db/db');
require('dotenv').config();

const requiredChannel = process.env.CHANNEL_USERNAME

function filterInputData(data) {
  const lines = data.trim().split('\n').filter(line => line.trim() !== '');

  const res = lines.map(line => {
    const [prefix, login, password, email, emailPassword] = line.split(':');

    return {
        login,
        password,
        email,
        emailPassword
    };
  });
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
  if (!accountDetails[0].login) {
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
