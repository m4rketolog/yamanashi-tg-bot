const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
const { 
  handleAddAccount, 
  handleListAccounts,
  handleManyAccounts,
  handleCountAccounts,
} = require('./src/commands/commands');
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

// On START MESSANGE
bot.start((ctx) => ctx.reply('Чтоб добавить аккаунт - /addaccount, Получить список всех аккаунтов - /listaccounts'))

bot.command('start', async (ctx) => {
    ctx.reply('Добро пожаловать, вы авторизированы!');
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
bot.command("count", handleCountAccounts)

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))