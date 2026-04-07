<template>
  <div id="assetPage" class="page-content">
    <h1 class="page-title">资产负债总览</h1>
    <p class="page-subtitle">全方位掌握您的资产配置与负债情况，科学规划财务</p>
    
    <!-- 资产负债对比 -->
    <div class="balance-section">
      <div class="balance-header">
        <div class="balance-title"><i class="fas fa-chart-pie"></i> 资产负债概览</div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <span class="gold-price-display">
            <i class="fas fa-coins"></i> 当前金价: <span class="price">{{ formatCurrency(currentGoldPrice) }}/克</span>
          </span>
          <span id="debtRatioBadge" class="badge" :style="{ background: debtRatioColor, color: debtRatioTextColor }">
            资产负债率: {{ debtRatio }}%
          </span>
        </div>
      </div>
      <div class="balance-grid">
        <div class="balance-item">
          <div class="balance-item-label"><i class="fas fa-coins"></i> 总资产</div>
          <div class="balance-item-value assets">{{ formatCurrency(totalAssets) }}</div>
        </div>
        <div class="balance-item">
          <div class="balance-item-label"><i class="fas fa-credit-card"></i> 总负债</div>
          <div class="balance-item-value debts">{{ formatCurrency(totalDebts) }}</div>
        </div>
        <div class="balance-item">
          <div class="balance-item-label"><i class="fas fa-gem"></i> 净资产</div>
          <div class="balance-item-value net">{{ formatCurrency(netWorth) }}</div>
        </div>
      </div>
    </div>
    
    <!-- 资产统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card net-worth-card">
        <div class="stat-label"><i class="fas fa-gem"></i> 净资产</div>
        <div class="stat-value">{{ formatCurrency(netWorth) }}</div>
        <div class="stat-change">资产 - 负债</div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><i class="fas fa-coins"></i> 总资产</div>
        <div class="stat-value">{{ formatCurrency(totalAssets) }}</div>
        <div class="stat-change">净资产统计</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);">
        <div class="stat-label"><i class="fas fa-university"></i> 银行存款</div>
        <div class="stat-value">{{ formatCurrency(bankAssets) }}</div>
        <div class="stat-change">流动性资产</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #7d85af 0%, #8087ca 100%);">
        <div class="stat-label"><i class="fas fa-chart-line"></i> 基金投资</div>
        <div class="stat-value">{{ formatCurrency(fundAssets) }}</div>
        <div class="stat-change">收益计算中...</div>
      </div>
    </div>

    <!-- 负债统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card" style="background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);">
        <div class="stat-label"><i class="fas fa-credit-card"></i> 总负债</div>
        <div class="stat-value">{{ formatCurrency(totalDebts) }}</div>
        <div class="stat-change">需偿还债务</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%);">
        <div class="stat-label"><i class="fas fa-home"></i> 房贷</div>
        <div class="stat-value">{{ formatCurrency(mortgageDebt) }}</div>
        <div class="stat-change">长期负债</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);">
        <div class="stat-label"><i class="fas fa-car"></i> 车贷</div>
        <div class="stat-value">{{ formatCurrency(carDebt) }}</div>
        <div class="stat-change">车辆贷款</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #ecc94b 0%, #d69e2e 100%);">
        <div class="stat-label"><i class="fas fa-credit-card"></i> 信用卡/其他</div>
        <div class="stat-value">{{ formatCurrency(otherDebt) }}</div>
        <div class="stat-change">短期负债</div>
      </div>
    </div>

    <div class="chart-grid">
      <div class="chart-container">
        <canvas id="assetChart"></canvas>
      </div>
      <div class="chart-container">
        <canvas id="debtChart"></canvas>
      </div>
    </div>

    <!-- 视图切换工具栏 -->
    <div class="toolbar" style="justify-content: space-between; align-items: center;">
      <div style="display: flex; gap: 10px; align-items: center;">
        <button class="btn btn-primary" @click="openAccountModal">
          <i class="fas fa-university"></i> 创建账户
        </button>
        <button class="btn btn-success" @click="openAssetModal">
          <i class="fas fa-plus"></i> 新增资产
        </button>
        <button class="btn btn-warning" @click="openDebtModal">
          <i class="fas fa-plus"></i> 新增负债
        </button>
      </div>
      
      <div style="display: flex; gap: 10px; align-items: center;">
        <span style="color: #718096; font-size: 14px;">展示方式：</span>
        <div class="view-toggle">
          <button 
            class="view-toggle-btn" 
            :class="{ active: currentAssetView === 'type' }"
            @click="switchAssetView('type')"
          >
            <i class="fas fa-layer-group"></i> 按资产类型
          </button>
          <button 
            class="view-toggle-btn" 
            :class="{ active: currentAssetView === 'account' }"
            @click="switchAssetView('account')"
          >
            <i class="fas fa-university"></i> 按账户
          </button>
        </div>
        <button class="btn btn-primary" @click="loadData">
          <i class="fas fa-sync-alt"></i> 刷新
        </button>
      </div>
    </div>

    <!-- 按资产类型视图 -->
    <div id="assetViewByType" class="asset-view" v-if="currentAssetView === 'type'">
      <div class="asset-grid" id="assetList">
        <div 
          v-for="asset in assets" 
          :key="asset.id"
          class="asset-card"
        >
          <div class="asset-header">
            <div class="asset-name">{{ asset.name }}</div>
            <div class="asset-type">{{ getAssetTypeName(asset.subType) }}</div>
          </div>
          <div class="asset-value">{{ formatCurrency(asset.value) }}</div>
          <div class="asset-details">
            <div v-if="asset.rate" class="asset-detail-item">
              <span class="detail-label">利率:</span>
              <span class="detail-value">{{ asset.rate }}%</span>
            </div>
            <div v-if="asset.maturityDate" class="asset-detail-item">
              <span class="detail-label">到期日:</span>
              <span class="detail-value">{{ formatDate(asset.maturityDate) }}</span>
            </div>
            <div v-if="asset.remark" class="asset-detail-item">
              <span class="detail-label">备注:</span>
              <span class="detail-value">{{ asset.remark }}</span>
            </div>
          </div>
          <div class="asset-actions">
            <button class="btn btn-sm btn-primary" @click="editAsset(asset)">
              <i class="fas fa-edit"></i> 编辑
            </button>
            <button class="btn btn-sm btn-danger" @click="deleteAsset(asset.id)">
              <i class="fas fa-trash"></i> 删除
            </button>
          </div>
        </div>
        
        <!-- 黄金资产 -->
        <div 
          v-for="goldAsset in goldAssets" 
          :key="goldAsset.id"
          class="asset-card gold"
        >
          <div class="asset-header">
            <div class="asset-name">{{ goldAsset.name }}</div>
            <div class="asset-type">黄金</div>
          </div>
          <div class="asset-value">{{ formatCurrency(goldAsset.grams * currentGoldPrice) }}</div>
          <div class="asset-details">
            <div class="asset-detail-item">
              <span class="detail-label">持有克数:</span>
              <span class="detail-value">{{ goldAsset.grams }}克</span>
            </div>
            <div v-if="goldAsset.remark" class="asset-detail-item">
              <span class="detail-label">备注:</span>
              <span class="detail-value">{{ goldAsset.remark }}</span>
            </div>
          </div>
          <div class="asset-actions">
            <button class="btn btn-sm btn-primary" @click="editGoldAsset(goldAsset)">
              <i class="fas fa-edit"></i> 编辑
            </button>
            <button class="btn btn-sm btn-danger" @click="deleteGoldAsset(goldAsset.id)">
              <i class="fas fa-trash"></i> 删除
            </button>
          </div>
        </div>
        
        <div v-if="assets.length === 0 && goldAssets.length === 0" class="empty-state">
          <div class="empty-icon"><i class="fas fa-coins"></i></div>
          <div>暂无资产数据</div>
        </div>
      </div>
    </div>

    <!-- 按账户视图 -->
    <div id="assetViewByAccount" class="asset-view" v-if="currentAssetView === 'account'">
      <div id="accountList">
        <div 
          v-for="account in accounts" 
          :key="account.id"
          class="account-card"
        >
          <div class="account-header">
            <div class="account-name">{{ account.name }}</div>
            <div class="account-type">{{ getAccountTypeName(account.type) }}</div>
          </div>
          <div class="account-balance">{{ formatCurrency(account.balance) }}</div>
          <div class="account-assets">
            <div 
              v-for="asset in getAccountAssets(account.id)" 
              :key="asset.id"
              class="account-asset-item"
            >
              <div class="account-asset-name">{{ asset.name }}</div>
              <div class="account-asset-value">{{ formatCurrency(asset.value) }}</div>
            </div>
          </div>
        </div>
        
        <div v-if="accounts.length === 0" class="empty-state">
          <div class="empty-icon"><i class="fas fa-university"></i></div>
          <div>暂无账户数据</div>
        </div>
      </div>
    </div>
    
    <h2 style="margin-top: 30px; margin-bottom: 20px; color: #2d3748; font-size: 20px;"><i class="fas fa-list"></i> 负债明细</h2>
    <div class="asset-grid" id="debtList">
      <div 
        v-for="debt in debts" 
        :key="debt.id"
        class="debt-card"
      >
        <div class="debt-header">
          <div class="debt-name">{{ debt.name }}</div>
          <div class="debt-type">{{ getDebtTypeName(debt.type) }}</div>
        </div>
        <div class="debt-amount">{{ formatCurrency(debt.amount) }}</div>
        <div class="debt-details">
          <div v-if="debt.rate" class="debt-detail-item">
            <span class="detail-label">年利率:</span>
            <span class="detail-value">{{ debt.rate }}%</span>
          </div>
          <div v-if="debt.term" class="debt-detail-item">
            <span class="detail-label">剩余期限:</span>
            <span class="detail-value">{{ debt.term }}个月</span>
          </div>
          <div v-if="debt.monthly" class="debt-detail-item">
            <span class="detail-label">每月还款:</span>
            <span class="detail-value">{{ formatCurrency(debt.monthly) }}</span>
          </div>
          <div v-if="debt.remark" class="debt-detail-item">
            <span class="detail-label">备注:</span>
            <span class="detail-value">{{ debt.remark }}</span>
          </div>
        </div>
        <div class="debt-actions">
          <button class="btn btn-sm btn-primary" @click="editDebt(debt)">
            <i class="fas fa-edit"></i> 编辑
          </button>
          <button class="btn btn-sm btn-danger" @click="deleteDebt(debt.id)">
            <i class="fas fa-trash"></i> 删除
          </button>
        </div>
      </div>
      
      <div v-if="debts.length === 0" class="empty-state">
        <div class="empty-icon"><i class="fas fa-credit-card"></i></div>
        <div>暂无负债数据</div>
      </div>
    </div>

    <!-- 创建账户弹窗 -->
    <div class="modal" :class="{ active: showAccountModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title"><i class="fas fa-university"></i> 创建账户</h3>
          <p style="color: #718096; font-size: 13px;">创建银行卡、微信钱包、支付宝等账户</p>
        </div>
        <form @submit.prevent="saveAccount">
          <div class="form-group">
            <label>账户类型 *</label>
            <select v-model="accountForm.type" required>
              <option value="bank">银行卡</option>
              <option value="wechat">微信钱包</option>
              <option value="alipay">支付宝</option>
            </select>
          </div>
          <div class="form-group">
            <label>账户名称 *</label>
            <input type="text" v-model="accountForm.name" required placeholder="例如：招商银行、微信零钱">
          </div>
          <div class="form-group">
            <label>初始余额 *</label>
            <input type="number" v-model.number="accountForm.balance" step="0.01" required placeholder="0.00">
          </div>
          <div class="form-group">
            <label>备注</label>
            <input type="text" v-model="accountForm.remark" placeholder="可选填">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAccountModal">取消</button>
            <button type="submit" class="btn btn-primary">创建账户</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 新增资产弹窗 -->
    <div class="modal" :class="{ active: showAssetModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditingAsset ? '编辑资产' : '新增资产' }}</h3>
          <p style="color: #718096; font-size: 13px;">记录您的各类资产</p>
        </div>
        <form @submit.prevent="saveAsset">
          <input type="hidden" v-model="assetForm.id">
          <div class="form-group">
            <label>资产类型 *</label>
            <select v-model="assetForm.subType" required>
              <option value="current">活期存款</option>
              <option value="fixed">定期存款</option>
              <option value="fund">基金</option>
              <option value="money_market">货币基金</option>
              <option value="yuebao">余额宝</option>
              <option value="lingqianbao">零钱宝</option>
              <option value="wealth_mgmt">理财产品</option>
              <option value="stock">股票</option>
              <option value="bond">债券</option>
              <option value="insurance">保险</option>
              <option value="gold">黄金</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>所属账户 *</label>
            <select v-model="assetForm.accountId" required>
              <option value="">-- 选择账户 --</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>资产名称 *</label>
            <input type="text" v-model="assetForm.name" required placeholder="例如：定期存款、余额宝等">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>当前价值 *</label>
              <input type="number" v-model.number="assetForm.value" step="0.01" required placeholder="0.00">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>利率/收益率 (%)</label>
              <input type="number" v-model.number="assetForm.rate" step="0.01" placeholder="例如：3.5">
            </div>
            <div class="form-group">
              <label>到期日期</label>
              <input type="date" v-model="assetForm.maturityDate">
            </div>
          </div>
          <div class="form-group">
            <label>备注</label>
            <input type="text" v-model="assetForm.remark" placeholder="可选填">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAssetModal">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 新增负债弹窗 -->
    <div class="modal" :class="{ active: showDebtModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title"><i class="fas fa-credit-card"></i> {{ isEditingDebt ? '编辑负债' : '新增负债' }}</h3>
          <p style="color: #718096; font-size: 13px;">记录您的各类负债（贷款、信用卡等）</p>
        </div>
        <form @submit.prevent="saveDebt">
          <input type="hidden" v-model="debtForm.id">
          <div class="form-group">
            <label>负债名称 *</label>
            <input type="text" v-model="debtForm.name" required placeholder="例如：招商银行房贷">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>负债类型 *</label>
              <select v-model="debtForm.type" required>
                <option value="mortgage"><i class="fas fa-home"></i> 房贷</option>
                <option value="car_loan"><i class="fas fa-car"></i> 车贷</option>
                <option value="credit_card"><i class="fas fa-credit-card"></i> 信用卡</option>
                <option value="consumer_loan"><i class="fas fa-shopping-bag"></i> 消费贷</option>
                <option value="student_loan"><i class="fas fa-graduation-cap"></i> 助学贷款</option>
                <option value="personal_loan"><i class="fas fa-user"></i> 个人借款</option>
                <option value="other"><i class="fas fa-file-alt"></i> 其他负债</option>
              </select>
            </div>
            <div class="form-group">
              <label>负债金额 *</label>
              <input type="number" v-model.number="debtForm.amount" step="0.01" required placeholder="0.00">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>年利率 (%)</label>
              <input type="number" v-model.number="debtForm.rate" step="0.01" placeholder="例如：4.9">
            </div>
            <div class="form-group">
              <label>剩余期限（月）</label>
              <input type="number" v-model.number="debtForm.term" placeholder="例如：120">
            </div>
          </div>
          <div class="form-group">
            <label>每月还款额</label>
            <input type="number" v-model.number="debtForm.monthly" step="0.01" placeholder="0.00">
          </div>
          <div class="form-group">
            <label>备注</label>
            <input type="text" v-model="debtForm.remark" placeholder="可选填，如：还款日每月15号">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDebtModal">取消</button>
            <button type="submit" class="btn btn-warning"><i class="fas fa-save"></i> 保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  getAllAssets,
  saveAsset as saveAssetFromService,
  deleteAsset as deleteAssetFromService,
  getAllGoldAssets,
  saveGoldAsset as saveGoldAssetFromService,
  deleteGoldAsset as deleteGoldAssetFromService,
  getAllDebts,
  saveDebt as saveDebtFromService,
  deleteDebt as deleteDebtFromService,
  getAllAccounts,
  saveAccount as saveAccountFromService,
  generateId
} from '../services/dataService';

// 状态管理
const assets = ref([]);
const goldAssets = ref([]);
const debts = ref([]);
const accounts = ref([]);
const currentAssetView = ref('type');
const currentGoldPrice = ref(1000);

// 弹窗状态
const showAccountModal = ref(false);
const showAssetModal = ref(false);
const showDebtModal = ref(false);
const isEditingAsset = ref(false);
const isEditingDebt = ref(false);

// 表单数据
const accountForm = ref({
  name: '',
  type: 'bank',
  balance: 0,
  remark: ''
});

const assetForm = ref({
  id: '',
  name: '',
  subType: 'current',
  accountId: '',
  value: 0,
  rate: '',
  maturityDate: '',
  remark: ''
});

const debtForm = ref({
  id: '',
  name: '',
  type: 'mortgage',
  amount: 0,
  rate: '',
  term: '',
  monthly: '',
  remark: ''
});

// 资产类型配置
const assetSubTypes = {
  current: { name: '活期存款', tag: '活期', tagClass: 'tag-current' },
  fixed: { name: '定期存款', tag: '定期', tagClass: 'tag-fixed' },
  fund: { name: '基金', tag: '基金', tagClass: 'tag-fund' },
  money_market: { name: '货币基金', tag: '货基', tagClass: 'tag-money-market' },
  yuebao: { name: '余额宝', tag: '余额宝', tagClass: 'tag-money-market' },
  lingqianbao: { name: '零钱宝', tag: '零钱宝', tagClass: 'tag-money-market' },
  wealth_mgmt: { name: '理财产品', tag: '理财', tagClass: 'tag-money-market' },
  stock: { name: '股票', tag: '股票', tagClass: 'tag-stock' },
  bond: { name: '债券', tag: '债券', tagClass: 'tag-bond' },
  insurance: { name: '保险', tag: '保险', tagClass: 'tag-insurance' },
  gold: { name: '黄金', tag: '黄金', tagClass: 'tag-gold' },
  other: { name: '其他', tag: '其他', tagClass: '' }
};

// 账户类型配置
const accountTypes = {
  bank: { name: '银行卡', icon: 'fa-university', color: '#667eea', headerClass: '' },
  wechat: { name: '微信钱包', icon: 'fa-comment', color: '#07c160', headerClass: 'wechat' },
  alipay: { name: '支付宝', icon: 'fa-alipay', color: '#1677ff', headerClass: 'alipay' }
};

// 负债类型配置
const debtTypes = {
  mortgage: '房贷',
  car_loan: '车贷',
  credit_card: '信用卡',
  consumer_loan: '消费贷',
  student_loan: '助学贷款',
  personal_loan: '个人借款',
  other: '其他负债'
};

// 计算属性
const totalAssets = computed(() => {
  const assetValue = assets.value.reduce((sum, asset) => sum + parseFloat(asset.value || 0), 0);
  const goldValue = goldAssets.value.reduce((sum, gold) => sum + (gold.grams * currentGoldPrice.value), 0);
  return assetValue + goldValue;
});

const totalDebts = computed(() => {
  return debts.value.reduce((sum, debt) => sum + parseFloat(debt.amount || 0), 0);
});

const netWorth = computed(() => totalAssets.value - totalDebts.value);

const debtRatio = computed(() => {
  if (totalAssets.value === 0) return 0;
  return Math.round((totalDebts.value / totalAssets.value) * 100);
});

const debtRatioColor = computed(() => {
  if (debtRatio.value < 30) return '#c6f6d5';
  if (debtRatio.value < 60) return '#feebc8';
  return '#fed7d7';
});

const debtRatioTextColor = computed(() => {
  if (debtRatio.value < 30) return '#22543d';
  if (debtRatio.value < 60) return '#c05621';
  return '#742a2a';
});

const bankAssets = computed(() => {
  return assets.value
    .filter(asset => asset.subType === 'current' || asset.subType === 'fixed')
    .reduce((sum, asset) => sum + parseFloat(asset.value || 0), 0);
});

const fundAssets = computed(() => {
  return assets.value
    .filter(asset => asset.subType === 'fund' || asset.subType === 'money_market' || asset.subType === 'yuebao' || asset.subType === 'lingqianbao')
    .reduce((sum, asset) => sum + parseFloat(asset.value || 0), 0);
});

const mortgageDebt = computed(() => {
  return debts.value
    .filter(debt => debt.type === 'mortgage')
    .reduce((sum, debt) => sum + parseFloat(debt.amount || 0), 0);
});

const carDebt = computed(() => {
  return debts.value
    .filter(debt => debt.type === 'car_loan')
    .reduce((sum, debt) => sum + parseFloat(debt.amount || 0), 0);
});

const otherDebt = computed(() => {
  return debts.value
    .filter(debt => debt.type !== 'mortgage' && debt.type !== 'car_loan')
    .reduce((sum, debt) => sum + parseFloat(debt.amount || 0), 0);
});

// 方法
function loadData() {
  assets.value = getAllAssets();
  goldAssets.value = getAllGoldAssets();
  debts.value = getAllDebts();
  accounts.value = getAllAccounts();
}

function switchAssetView(view) {
  currentAssetView.value = view;
}

function getAssetTypeName(subType) {
  return assetSubTypes[subType]?.name || '其他';
}

function getAccountTypeName(type) {
  return accountTypes[type]?.name || '其他';
}

function getDebtTypeName(type) {
  return debtTypes[type] || '其他';
}

function getAccountAssets(accountId) {
  return assets.value.filter(asset => asset.accountId === accountId);
}

// 账户管理
function openAccountModal() {
  accountForm.value = {
    name: '',
    type: 'bank',
    balance: 0,
    remark: ''
  };
  showAccountModal.value = true;
}

function closeAccountModal() {
  showAccountModal.value = false;
}

function saveAccount() {
  const account = {
    id: generateId(),
    name: accountForm.value.name,
    type: accountForm.value.type,
    balance: accountForm.value.balance,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    remark: accountForm.value.remark
  };
  
  saveAccountFromService(account);
  loadData();
  closeAccountModal();
}

// 资产管理
function openAssetModal() {
  isEditingAsset.value = false;
  assetForm.value = {
    id: '',
    name: '',
    subType: 'current',
    accountId: accounts.value[0]?.id || '',
    value: 0,
    rate: '',
    maturityDate: '',
    remark: ''
  };
  showAssetModal.value = true;
}

function closeAssetModal() {
  showAssetModal.value = false;
}

function editAsset(asset) {
  isEditingAsset.value = true;
  assetForm.value = { ...asset };
  showAssetModal.value = true;
}

function saveAsset() {
  const asset = {
    ...assetForm.value,
    updatedAt: new Date().toISOString()
  };
  
  if (!asset.id) {
    asset.id = generateId();
    asset.createdAt = new Date().toISOString();
  }
  
  saveAssetFromService(asset);
  loadData();
  closeAssetModal();
}

function deleteAsset(assetId) {
  if (confirm('确定要删除这个资产吗？')) {
    deleteAssetFromService(assetId);
    loadData();
  }
}

// 黄金资产管理
function editGoldAsset(goldAsset) {
  // 黄金资产编辑功能待实现
  console.log('编辑黄金资产:', goldAsset);
}

function deleteGoldAsset(goldId) {
  if (confirm('确定要删除这个黄金资产吗？')) {
    deleteGoldAssetFromService(goldId);
    loadData();
  }
}

// 负债管理
function openDebtModal() {
  isEditingDebt.value = false;
  debtForm.value = {
    id: '',
    name: '',
    type: 'mortgage',
    amount: 0,
    rate: '',
    term: '',
    monthly: '',
    remark: ''
  };
  showDebtModal.value = true;
}

function closeDebtModal() {
  showDebtModal.value = false;
}

function editDebt(debt) {
  isEditingDebt.value = true;
  debtForm.value = { ...debt };
  showDebtModal.value = true;
}

function saveDebt() {
  const debt = {
    ...debtForm.value,
    updatedAt: new Date().toISOString()
  };
  
  if (!debt.id) {
    debt.id = generateId();
    debt.createdAt = new Date().toISOString();
  }
  
  saveDebtFromService(debt);
  loadData();
  closeDebtModal();
}

function deleteDebt(debtId) {
  if (confirm('确定要删除这个负债吗？')) {
    deleteDebtFromService(debtId);
    loadData();
  }
}

// 工具函数
function formatCurrency(amount) {
  return '¥' + parseFloat(amount || 0).toFixed(2);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
}

// 生命周期
onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* 组件样式已在全局style.css中定义 */
</style>