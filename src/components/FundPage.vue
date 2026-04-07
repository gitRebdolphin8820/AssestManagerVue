<template>
  <div id="fundPage" class="page-content">
    <h1 class="page-title">基金管理系统</h1>
    <p class="page-subtitle">智能管理您的基金投资组合</p>
           
    <div class="toolbar">
      <div class="file-input-wrapper">
        <button class="btn btn-secondary" @click="document.getElementById('fileInput').click()">
          <i class="fas fa-file-import"></i> 导入Excel
        </button>
        <input type="file" id="fileInput" accept=".xlsx,.xls" @change="handleFileSelect">
      </div>
      
      <button class="btn btn-success" @click="openFundModal">
        <i class="fas fa-plus"></i> 新增基金
      </button>
      
      <button class="btn btn-primary" @click="updateAllNetValues">
        <i class="fas fa-sync-alt"></i> 更新净值
      </button>
      
      <button class="btn btn-secondary" @click="exportExcel">
        <i class="fas fa-file-export"></i> 导出Excel
      </button>
      
      <span class="sync-status">
        <span class="sync-dot"></span>
        自动同步准备就绪
      </span>
    </div>
    
    <!-- 筛选器 -->
    <div class="filter-container">
      <span class="filter-label">定投筛选：</span>
      <select id="fixedFilter" class="filter-select" v-model="filterState.fixed" @change="applyFilters">
        <option value="all">全部</option>
        <option value="fixed">定投</option>
        <option value="non-fixed">非定投</option>
      </select>
    </div>
    
    <div class="stats-cards" id="statsCards">
      <div class="stat-card">
        <div class="stat-label">总成本</div>
        <div class="stat-value">{{ formatCurrency(totalCost) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">当前市值</div>
        <div class="stat-value">{{ formatCurrency(totalValue) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">累计收益</div>
        <div class="stat-value">{{ formatCurrency(totalReturn) }}</div>
        <div class="stat-change" :class="{ positive: totalReturn >= 0, negative: totalReturn < 0 }">
          {{ returnRate }}%
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">持有基金数</div>
        <div class="stat-value">{{ fundCount }}</div>
      </div>
    </div>
    
    <div style="overflow-x: auto;">
      <table id="fundTable">
        <thead>
          <tr>
            <th>名称</th>
            <th>定投</th>
            <th>基金类型</th>
            <th @click="sortTable('costNav')">
              成本净值
              <span class="sort-indicator">
                <span class="up" :class="{ active: sortState.column === 'costNav' && sortState.direction === 'asc' }">▲</span>
                <span class="down" :class="{ active: sortState.column === 'costNav' && sortState.direction === 'desc' }">▼</span>
              </span>
            </th>
            <th @click="sortTable('shares')">
              持有份额
              <span class="sort-indicator">
                <span class="up" :class="{ active: sortState.column === 'shares' && sortState.direction === 'asc' }">▲</span>
                <span class="down" :class="{ active: sortState.column === 'shares' && sortState.direction === 'desc' }">▼</span>
              </span>
            </th>
            <th @click="sortTable('costAmount')">
              成本金额
              <span class="sort-indicator">
                <span class="up" :class="{ active: sortState.column === 'costAmount' && sortState.direction === 'asc' }">▲</span>
                <span class="down" :class="{ active: sortState.column === 'costAmount' && sortState.direction === 'desc' }">▼</span>
              </span>
            </th>
            <th @click="sortTable('currentNav')">
              当前净值
              <span class="sort-indicator">
                <span class="up" :class="{ active: sortState.column === 'currentNav' && sortState.direction === 'asc' }">▲</span>
                <span class="down" :class="{ active: sortState.column === 'currentNav' && sortState.direction === 'desc' }">▼</span>
              </span>
            </th>
            <th @click="sortTable('sellNav')">
              卖出净值
              <span class="sort-indicator">
                <span class="up" :class="{ active: sortState.column === 'sellNav' && sortState.direction === 'asc' }">▲</span>
                <span class="down" :class="{ active: sortState.column === 'sellNav' && sortState.direction === 'desc' }">▼</span>
              </span>
            </th>
            <th @click="sortTable('sellShares')">
              卖出份额
              <span class="sort-indicator">
                <span class="up" :class="{ active: sortState.column === 'sellShares' && sortState.direction === 'asc' }">▲</span>
                <span class="down" :class="{ active: sortState.column === 'sellShares' && sortState.direction === 'desc' }">▼</span>
              </span>
            </th>
            <th @click="sortTable('returnAmount')">
              收益
              <span class="sort-indicator">
                <span class="up" :class="{ active: sortState.column === 'returnAmount' && sortState.direction === 'asc' }">▲</span>
                <span class="down" :class="{ active: sortState.column === 'returnAmount' && sortState.direction === 'desc' }">▼</span>
              </span>
            </th>
            <th @click="sortTable('returnRate')">
              收益率
              <span class="sort-indicator">
                <span class="up" :class="{ active: sortState.column === 'returnRate' && sortState.direction === 'asc' }">▲</span>
                <span class="down" :class="{ active: sortState.column === 'returnRate' && sortState.direction === 'desc' }">▼</span>
              </span>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fund in filteredFunds" :key="fund.id">
            <td>{{ fund.name }}</td>
            <td>{{ fund.isFixed ? '是' : '否' }}</td>
            <td>{{ fund.type }}</td>
            <td>{{ fund.costNav.toFixed(4) }}</td>
            <td>{{ fund.shares.toFixed(4) }}</td>
            <td>{{ formatCurrency(fund.costAmount) }}</td>
            <td>{{ fund.currentNav.toFixed(4) }}</td>
            <td>{{ fund.sellNav ? fund.sellNav.toFixed(4) : '0.0000' }}</td>
            <td>{{ fund.sellShares ? fund.sellShares.toFixed(4) : '0.0000' }}</td>
            <td :class="fund.returnAmount >= 0 ? 'positive' : 'negative'">
              {{ formatCurrency(fund.returnAmount) }}
            </td>
            <td :class="fund.returnRate >= 0 ? 'positive' : 'negative'">
              {{ fund.returnRate.toFixed(2) }}%
            </td>
            <td>
              <button class="btn btn-sm btn-primary" @click="editFund(fund)">
                <i class="fas fa-edit"></i> 编辑
              </button>
              <button class="btn btn-sm btn-danger" @click="deleteFund(fund.id)">
                <i class="fas fa-trash"></i> 删除
              </button>
            </td>
          </tr>
          <tr v-if="filteredFunds.length === 0">
            <td colspan="13" class="empty-state">
              <div class="empty-icon"><i class="fas fa-chart-bar"></i></div>
              <div>暂无基金数据，请导入Excel或手动添加</div>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- 分页控件 -->
      <div id="fundPagination" class="transaction-pagination" v-if="filteredFunds.length > 0">
        <!-- 分页逻辑待实现 -->
      </div>
    </div>

    <!-- 基金模态框 -->
    <div class="modal" :class="{ active: showFundModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title"><i class="fas fa-chart-line"></i> {{ isEditingFund ? '编辑基金' : '新增基金' }}</h3>
          <p style="color: #718096; font-size: 13px;">填写基金详细信息</p>
        </div>
        <form @submit.prevent="saveFund">
          <input type="hidden" v-model="fundForm.id">
          <div class="form-group">
            <label>基金名称 *</label>
            <input type="text" v-model="fundForm.name" required placeholder="例如：易方达蓝筹精选混合">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>定投</label>
              <input type="checkbox" v-model="fundForm.isFixed">
            </div>
            <div class="form-group">
              <label>基金类型 *</label>
              <select v-model="fundForm.type" required>
                <option value="股票型">股票型</option>
                <option value="债券型">债券型</option>
                <option value="混合型">混合型</option>
                <option value="货币型">货币型</option>
                <option value="指数型">指数型</option>
                <option value="QDII">QDII</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>成本净值 *</label>
              <input type="number" v-model.number="fundForm.costNav" step="0.0001" required placeholder="0.0000">
            </div>
            <div class="form-group">
              <label>持有份额 *</label>
              <input type="number" v-model.number="fundForm.shares" step="0.0001" required placeholder="0.0000">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>当前净值 *</label>
              <input type="number" v-model.number="fundForm.currentNav" step="0.0001" required placeholder="0.0000">
            </div>
            <div class="form-group">
              <label>卖出净值</label>
              <input type="number" v-model.number="fundForm.sellNav" step="0.0001" placeholder="0.0000">
            </div>
          </div>
          <div class="form-group">
            <label>卖出份额</label>
            <input type="number" v-model.number="fundForm.sellShares" step="0.0001" placeholder="0.0000">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeFundModal">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  getAllFunds,
  saveFund as saveFundFromService,
  deleteFund as deleteFundFromService,
  generateId
} from '../services/dataService';

// 状态管理
const funds = ref([]);
const sortState = ref({ column: '', direction: 'asc' });
const filterState = ref({ fixed: 'all' });

// 弹窗状态
const showFundModal = ref(false);
const isEditingFund = ref(false);

// 表单数据
const fundForm = ref({
  id: '',
  name: '',
  isFixed: false,
  type: '股票型',
  costNav: 0,
  shares: 0,
  currentNav: 0,
  sellNav: 0,
  sellShares: 0
});

// 计算属性
const filteredFunds = computed(() => {
  let result = [...funds.value];
  
  // 应用定投筛选
  if (filterState.value.fixed === 'fixed') {
    result = result.filter(f => f.isFixed);
  } else if (filterState.value.fixed === 'non-fixed') {
    result = result.filter(f => !f.isFixed);
  }
  
  // 应用排序
  if (sortState.value.column) {
    result.sort((a, b) => {
      let aVal = a[sortState.value.column];
      let bVal = b[sortState.value.column];
      
      if (aVal < bVal) return sortState.value.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortState.value.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  return result;
});

const totalCost = computed(() => {
  return filteredFunds.value.reduce((sum, fund) => sum + (fund.costNav * fund.shares), 0);
});

const totalValue = computed(() => {
  return filteredFunds.value.reduce((sum, fund) => {
    const remainingShares = fund.shares - (fund.sellShares || 0);
    return sum + (fund.currentNav * remainingShares);
  }, 0);
});

const totalReturn = computed(() => {
  return totalValue.value - totalCost.value;
});

const returnRate = computed(() => {
  if (totalCost.value === 0) return 0;
  return (totalReturn.value / totalCost.value) * 100;
});

const fundCount = computed(() => filteredFunds.value.length);

// 方法
function loadData() {
  const allFunds = getAllFunds();
  // 计算每个基金的收益
  funds.value = allFunds.map(fund => {
    const costAmount = fund.costNav * fund.shares;
    const remainingShares = fund.shares - (fund.sellShares || 0);
    const currentValue = fund.currentNav * remainingShares;
    const returnAmount = currentValue - costAmount;
    const returnRate = costAmount === 0 ? 0 : (returnAmount / costAmount) * 100;
    
    return {
      ...fund,
      costAmount,
      returnAmount,
      returnRate
    };
  });
}

function sortTable(column) {
  if (sortState.value.column === column) {
    sortState.value.direction = sortState.value.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortState.value.column = column;
    sortState.direction = 'asc';
  }
}

function applyFilters() {
  // 筛选逻辑已在computed中处理
}

function openFundModal() {
  isEditingFund.value = false;
  fundForm.value = {
    id: '',
    name: '',
    isFixed: false,
    type: '股票型',
    costNav: 0,
    shares: 0,
    currentNav: 0,
    sellNav: 0,
    sellShares: 0
  };
  showFundModal.value = true;
}

function closeFundModal() {
  showFundModal.value = false;
}

function editFund(fund) {
  isEditingFund.value = true;
  fundForm.value = { ...fund };
  showFundModal.value = true;
}

function saveFund() {
  const fund = {
    ...fundForm.value,
    updatedAt: new Date().toISOString()
  };
  
  if (!fund.id) {
    fund.id = generateId();
    fund.createdAt = new Date().toISOString();
  }
  
  saveFundFromService(fund);
  loadData();
  closeFundModal();
}

function deleteFund(fundId) {
  if (confirm('确定要删除这个基金吗？')) {
    deleteFundFromService(fundId);
    loadData();
  }
}

function updateAllNetValues() {
  // 更新净值功能待实现
  console.log('更新所有基金净值');
}

function handleFileSelect(event) {
  // Excel导入功能待实现
  console.log('导入Excel文件:', event.target.files[0]);
}

function exportExcel() {
  // Excel导出功能待实现
  console.log('导出Excel文件');
}

// 工具函数
function formatCurrency(amount) {
  return '¥' + parseFloat(amount || 0).toFixed(2);
}

// 生命周期
onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* 组件样式已在全局style.css中定义 */
</style>