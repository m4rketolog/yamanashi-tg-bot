const fs = require('fs').promises;
const { error } = require('console');
const path = require('path');
const { threadId } = require('worker_threads');

const file = path.join(__dirname, 'db.json');

async function loadData() {
  
  try {
    const data = await fs.readFile(file, 'utf-8');
    
    return JSON.parse(data);
  } catch (error) {

    if (error.code === 'ENOENT') {
      return { accounts: [] };
    } else {
      throw error;
    }
  }
}

async function findAccountByLogin(login) {
  
  const data = await loadData();
  const res = data.accounts.find(account => account.login === login);

  return res ? true : false;
}

async function findCompletedByLogin(login) {
  const data = await loadData();
  const res = data.completedAccounts.find(account => account.login === login);

  return res ? true : false;
}

async function saveData(data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}

async function findWorkerById(userId) {
  const data = await loadData();

  const res = data.workers.find(worker => worker.userId === userId);
  return res;
}

// Добавляет один аккаунт в список (поддерживает только старое регулярное выражение)
async function addAccount({region, login, password, email, emailPassword}, ctx) {
  
  if (await findAccountByLogin(login)) {
    return ctx.reply("Аккаунт уже создан");
  }
  
  const data = await loadData();
  
  data.accounts.push({
     id: Date.now(), 
     region: region,
     login: login, 
     password: password, 
     email: email, 
     emailPassword: emailPassword
    });

  data.completedAccounts.push({
      id: Date.now(),
      login: login, 
      status: "uncompleted",
    });

  await saveData(data);
}

async function addMoreAccounts(accounts, ctx) {
  
  const data = await loadData();

  await Promise.all(accounts.map( async (account) => {
    if (await findAccountByLogin(account.login)) {
      return ctx.reply("Аккаунт уже создан");
    }
    
    data.accounts.push({
       id: Date.now(), 
       region: account.region,
       login: account.login, 
       password: account.password, 
       email: account.email, 
       emailPassword: account.emailPassword
      });
  }))

  await saveData(data);
}

async function createWorker(userId) {
  const data = await loadData();

  if (await findWorkerById(userId)) {
    throw new error("Пользователь уже создан");
  }

  data.workers.push({

    userId: userId,
    getAccountsTimeout: null,
    postAccountsTimeout: null,
    takenAccounts: [],
  })

  await saveData(data);
}

async function getAccountsWork(userId, ctx) {
  
  const data = await loadData();

  const user = data.workers.find(worker => worker.userId === userId);

  if (!user) {
    await createWorker(userId);
  }

  let today = new Date();

  if (user.getAccountsTimeout != null) {
    return {error: "Вы уже использовали эту команду сегодня. (Лимит на использование - раз в сутки)"};
  }

  const selectedAccounts = await data.accounts.splice(0, 3);
  
  if (selectedAccounts.length < 3) {
    return {error: "Нет достаточного кол-ва аккаунтов"};
  }

  // обновляем аккаунт
  user.getAccountsTimeout = today.toISOString().split('T')[0];
  user.takenAccounts = selectedAccounts;

  console.log(user,"- user");

  // добавляем выданые аккаунты в базу для выполненых аккаунтов с статусом “uncompleted”
  await Promise.all(selectedAccounts.map( async (account) => {
    if (await findCompletedByLogin(account.login)) {
      return ctx.reply("Аккаунт уже создан");
    }
    
    data.completedAccounts.push({
       id: Date.now(), 
       login: account.login,
       status:"uncompleted",
       worker: user.userId
      });
  }))

  await saveData(data);
  return selectedAccounts;
}

async function getAllAccounts() {
  const data = await loadData();
  return data.accounts.map((account) => {
    if (account.region) {
      return `${account.region}${account.login}:${account.password}:${account.email}:${account.emailPassword} \n`
    } else if (account.region === null){
      return `${account.login}:${account.password}:${account.email}:${account.emailPassword} \n`
    }
  });
}

async function countAllAcounts() {
  const data = await loadData();
  return data.accounts.length;
}

module.exports = {
  createWorker,
  addAccount,
  getAllAccounts,
  addMoreAccounts,
  countAllAcounts,
  getAccountsWork,
};
