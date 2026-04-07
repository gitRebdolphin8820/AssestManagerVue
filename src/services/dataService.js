// 存储键值常量
const STORAGE_KEYS = {
  ACCOUNTS: 'accounts',
  ASSETS: 'assets',
  TRANSACTIONS: 'transactions',
  GOLD_ASSETS: 'goldAssets',
  DEBTS: 'debts',
  FUNDS: 'fundData',
  SETTINGS: 'settings'
};

// 初始化数据
export function initData() {
  const initialData = {
    accounts: [],
    assets: [],
    transactions: [],
    goldAssets: [],
    debts: [],
    fundData: [],
    settings: {
      currentGoldPrice: 1000.00,
      defaultAccountId: null,
      currency: 'CNY',
      theme: 'light'
    }
  };
  
  // 检查本地存储是否存在数据
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(initialData[key.toLowerCase()] || []));
    }
  });
}

// 通用存储操作
export function getLocalStorage(key, defaultValue = []) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('读取本地存储失败:', error);
    return defaultValue;
  }
}

export function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('写入本地存储失败:', error);
  }
}

// 账户管理
export function getAllAccounts() {
  const accounts = getLocalStorage(STORAGE_KEYS.ACCOUNTS);
  if (accounts.length === 0) {
    // 从资产中提取账户信息（兼容旧数据）
    const assets = getLocalStorage(STORAGE_KEYS.ASSETS);
    const assetAccounts = assets.filter(a => a.accountId === a.id);
    return assetAccounts.map(a => ({
      id: a.id,
      name: a.accountName || a.name,
      type: a.accountType || 'bank',
      balance: a.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      remark: a.remark
    }));
  }
  return accounts;
}

export function saveAccount(account) {
  const accounts = getAllAccounts();
  const index = accounts.findIndex(a => a.id === account.id);
  
  if (index !== -1) {
    accounts[index] = account;
  } else {
    accounts.push(account);
  }
  
  setLocalStorage(STORAGE_KEYS.ACCOUNTS, accounts);
  return account;
}

export function deleteAccount(accountId) {
  const accounts = getAllAccounts().filter(a => a.id !== accountId);
  setLocalStorage(STORAGE_KEYS.ACCOUNTS, accounts);
}

// 资产管理
export function getAllAssets() {
  return getLocalStorage(STORAGE_KEYS.ASSETS);
}

export function saveAsset(asset) {
  const assets = getAllAssets();
  const index = assets.findIndex(a => a.id === asset.id);
  
  if (index !== -1) {
    assets[index] = asset;
  } else {
    assets.push(asset);
  }
  
  setLocalStorage(STORAGE_KEYS.ASSETS, assets);
  return asset;
}

export function deleteAsset(assetId) {
  const assets = getAllAssets().filter(a => a.id !== assetId);
  setLocalStorage(STORAGE_KEYS.ASSETS, assets);
}

// 黄金资产管理
export function getAllGoldAssets() {
  return getLocalStorage(STORAGE_KEYS.GOLD_ASSETS);
}

export function saveGoldAsset(goldAsset) {
  const goldAssets = getAllGoldAssets();
  const index = goldAssets.findIndex(g => g.id === goldAsset.id);
  
  if (index !== -1) {
    goldAssets[index] = goldAsset;
  } else {
    goldAssets.push(goldAsset);
  }
  
  setLocalStorage(STORAGE_KEYS.GOLD_ASSETS, goldAssets);
  return goldAsset;
}

export function deleteGoldAsset(goldId) {
  const goldAssets = getAllGoldAssets().filter(g => g.id !== goldId);
  setLocalStorage(STORAGE_KEYS.GOLD_ASSETS, goldAssets);
}

// 交易管理
export function getAllTransactions() {
  return getLocalStorage(STORAGE_KEYS.TRANSACTIONS);
}

export function saveTransaction(transaction) {
  const transactions = getAllTransactions();
  const index = transactions.findIndex(t => t.id === transaction.id);
  
  if (index !== -1) {
    transactions[index] = transaction;
  } else {
    transactions.push(transaction);
  }
  
  setLocalStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
  return transaction;
}

export function deleteTransaction(transactionId) {
  const transactions = getAllTransactions().filter(t => t.id !== transactionId);
  setLocalStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
}

// 负债管理
export function getAllDebts() {
  return getLocalStorage(STORAGE_KEYS.DEBTS);
}

export function saveDebt(debt) {
  const debts = getAllDebts();
  const index = debts.findIndex(d => d.id === debt.id);
  
  if (index !== -1) {
    debts[index] = debt;
  } else {
    debts.push(debt);
  }
  
  setLocalStorage(STORAGE_KEYS.DEBTS, debts);
  return debt;
}

export function deleteDebt(debtId) {
  const debts = getAllDebts().filter(d => d.id !== debtId);
  setLocalStorage(STORAGE_KEYS.DEBTS, debts);
}

// 基金管理
export function getAllFunds() {
  return getLocalStorage(STORAGE_KEYS.FUNDS);
}

export function saveFund(fund) {
  const funds = getAllFunds();
  const index = funds.findIndex(f => f.id === fund.id);
  
  if (index !== -1) {
    funds[index] = fund;
  } else {
    funds.push(fund);
  }
  
  setLocalStorage(STORAGE_KEYS.FUNDS, funds);
  return fund;
}

export function deleteFund(fundId) {
  const funds = getAllFunds().filter(f => f.id !== fundId);
  setLocalStorage(STORAGE_KEYS.FUNDS, funds);
}

// 数据联动：执行交易并更新相关资产
export function executeTransaction(transaction) {
  // 保存交易
  const savedTransaction = saveTransaction(transaction);
  
  // 根据交易类型更新资产
  switch (transaction.type) {
    case 'income':
      // 收入：增加目标资产价值
      if (transaction.toAssetId) {
        const assets = getAllAssets();
        const targetAsset = assets.find(a => a.id === transaction.toAssetId);
        if (targetAsset) {
          targetAsset.value = safeNumber(targetAsset.value) + safeNumber(transaction.amount);
          saveAsset(targetAsset);
        }
      }
      break;
      
    case 'expense':
      // 支出：减少来源资产价值
      if (transaction.fromAssetId) {
        const assets = getAllAssets();
        const sourceAsset = assets.find(a => a.id === transaction.fromAssetId);
        if (sourceAsset) {
          sourceAsset.value = safeNumber(sourceAsset.value) - safeNumber(transaction.amount);
          saveAsset(sourceAsset);
        }
      }
      break;
      
    case 'invest_buy':
      // 投资购买：减少来源资产，增加目标资产
      if (transaction.fromAssetId && transaction.toAssetId) {
        const assets = getAllAssets();
        const sourceAsset = assets.find(a => a.id === transaction.fromAssetId);
        const targetAsset = assets.find(a => a.id === transaction.toAssetId);
        
        if (sourceAsset) {
          sourceAsset.value = safeNumber(sourceAsset.value) - safeNumber(transaction.amount);
          saveAsset(sourceAsset);
        }
        
        if (targetAsset) {
          targetAsset.value = safeNumber(transaction.amount);
          saveAsset(targetAsset);
        }
      }
      break;
      
    case 'invest_sell':
      // 投资赎回：减少来源资产，增加目标资产
      if (transaction.fromAssetId && transaction.toAssetId) {
        const assets = getAllAssets();
        const sourceAsset = assets.find(a => a.id === transaction.fromAssetId);
        const targetAsset = assets.find(a => a.id === transaction.toAssetId);
        
        if (sourceAsset) {
          sourceAsset.value = 0; // 清空投资资产
          saveAsset(sourceAsset);
        }
        
        if (targetAsset) {
          targetAsset.value = safeNumber(targetAsset.value) + safeNumber(transaction.amount);
          saveAsset(targetAsset);
        }
      }
      break;
      
    case 'deposit':
      // 定期存入：减少来源资产，增加定期资产
      if (transaction.fromAssetId && transaction.toAssetId) {
        const assets = getAllAssets();
        const sourceAsset = assets.find(a => a.id === transaction.fromAssetId);
        const targetAsset = assets.find(a => a.id === transaction.toAssetId);
        
        if (sourceAsset) {
          sourceAsset.value = safeNumber(sourceAsset.value) - safeNumber(transaction.amount);
          saveAsset(sourceAsset);
        }
        
        if (targetAsset) {
          targetAsset.value = safeNumber(transaction.amount);
          saveAsset(targetAsset);
        }
      }
      break;
      
    case 'withdraw':
      // 定期取出：减少定期资产，增加来源资产
      if (transaction.fromAssetId && transaction.toAssetId) {
        const assets = getAllAssets();
        const sourceAsset = assets.find(a => a.id === transaction.fromAssetId);
        const targetAsset = assets.find(a => a.id === transaction.toAssetId);
        
        if (sourceAsset) {
          sourceAsset.value = 0; // 清空定期资产
          saveAsset(sourceAsset);
        }
        
        if (targetAsset) {
          targetAsset.value = safeNumber(targetAsset.value) + safeNumber(transaction.amount);
          saveAsset(targetAsset);
        }
      }
      break;
      
    case 'transfer':
      // 转账：减少来源资产，增加目标资产
      if (transaction.fromAssetId && transaction.toAssetId) {
        const assets = getAllAssets();
        const sourceAsset = assets.find(a => a.id === transaction.fromAssetId);
        const targetAsset = assets.find(a => a.id === transaction.toAssetId);
        
        if (sourceAsset) {
          sourceAsset.value = safeNumber(sourceAsset.value) - safeNumber(transaction.amount);
          saveAsset(sourceAsset);
        }
        
        if (targetAsset) {
          targetAsset.value = safeNumber(targetAsset.value) + safeNumber(transaction.amount);
          saveAsset(targetAsset);
        }
      }
      break;
  }
  
  return savedTransaction;
}

// 工具函数：安全数字转换
export function safeNumber(value) {
  return parseFloat(value) || 0;
}

// 工具函数：生成唯一ID
export function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export { STORAGE_KEYS };