const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
const cron = require('node-cron');
const { 
  handleAddAccount, 
  handleListAccounts,
  handleManyAccounts,
  handleCountAccounts,
  handleGetAccountsWork,
  handleDailyAccountsPost,
  
} = require('./src/commands/commands');
const {
  resetUsersTimeouts,
  refreshCompletedAccounts,
} = require("./src/db/db");

require('dotenv').config();

const bot = new Telegraf(`${process.env.BOT_TOKEN}`)

const requiredChannel = process.env.CHANNEL_USERNAME

bot.use(async (ctx, next) => {
    if (ctx.message && ctx.message.from) {
      try {
        const chatMember = await ctx.telegram.getChatMember(requiredChannel, ctx.message.from.id);
        if (chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator') {
          return next();
        } else {
          ctx.reply(`Чтоб пользоватся ботом вы должны состаять в группе: ${requiredChannel}`);
        }
      } catch (error) {
        console.error('Error checking channel membership:', error);
        ctx.reply(`Не удалось проверить вашу подписку на ${requiredChannel}`);
      }
    }
});

bot.start((ctx) => ctx.reply('Чтоб добавить аккаунт - /addaccount, Получить список всех аккаунтов - /listaccounts'))

bot.command('start', async (ctx) => {
    ctx.reply('Добро пожаловать, вы авторизированы!');
});

// cron.schedule('0 0 * * *', async () => {
//   console.log('Scheduled reset task executed');

//   await refreshCompletedAccounts();
//   await resetUsersTimeouts();

//   console.log("==========================\n");
//   console.log("All data been refreshed!");
// });


cron.schedule('*/2 * * * *', async () => {
  console.log('Scheduled reset task executed');

  await refreshCompletedAccounts();
  await resetUsersTimeouts();

  console.log("==========================\n");
  console.log("All data been refreshed!");
});

bot.launch()
    .then(() => {
      console.log('Bot is up and running!');
    })
    .catch((error) => {
      console.error('Error launching bot:', error);
    }
);

bot.command('addaccount', handleAddAccount);
bot.command('list', handleListAccounts);
bot.command('more', handleManyAccounts);
bot.command("count", handleCountAccounts);
bot.command("work", handleGetAccountsWork);
bot.command("post", handleDailyAccountsPost);

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))