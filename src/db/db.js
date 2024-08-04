const fs = require('fs').promises;
const path = require('path');

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

async function saveData(data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}

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
  addAccount,
  getAllAccounts,
  addMoreAccounts,
  countAllAcounts,
};
