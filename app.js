/* ==========================================
   FinFlow - Application Logic & Storage
   ========================================== */

// 1. Configuration & Constants
const CATEGORY_MAP = {
  // Expenses (Pengeluaran)
  'Makanan & Minuman': { icon: 'fa-solid fa-utensils', color: '#f87171' },
  'Transportasi': { icon: 'fa-solid fa-car', color: '#60a5fa' },
  'Hiburan': { icon: 'fa-solid fa-gamepad', color: '#c084fc' },
  'Belanja': { icon: 'fa-solid fa-bag-shopping', color: '#fb7185' },
  'Tagihan & Listrik': { icon: 'fa-solid fa-bolt', color: '#fbbf24' },
  'Kesehatan': { icon: 'fa-solid fa-heart-pulse', color: '#34d399' },
  'Edukasi': { icon: 'fa-solid fa-graduation-cap', color: '#2dd4bf' },
  // Income (Pemasukan)
  'Gaji': { icon: 'fa-solid fa-money-check-dollar', color: '#10b981' },
  'Uang Saku': { icon: 'fa-solid fa-hand-holding-dollar', color: '#4ade80' },
  'Investasi': { icon: 'fa-solid fa-chart-line', color: '#06b6d4' },
  'Freelance': { icon: 'fa-solid fa-laptop-code', color: '#a78bfa' },
  'Hadiah': { icon: 'fa-solid fa-gift', color: '#f472b6' },
  // Fallback
  'Lain-lain': { icon: 'fa-solid fa-circle-question', color: '#9ca3af' }
};

const EXPENSE_CATEGORIES = ['Makanan & Minuman', 'Transportasi', 'Hiburan', 'Belanja', 'Tagihan & Listrik', 'Kesehatan', 'Edukasi', 'Lain-lain'];
const INCOME_CATEGORIES = ['Gaji', 'Uang Saku', 'Investasi', 'Freelance', 'Hadiah', 'Lain-lain'];

// 2. Application State
let state = {
  transactions: []
};

let expenseChartObj = null;

// 3. Helper Functions
function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Convert Date from YYYY-MM-DD to readable format: "DD MMMM YYYY" (Indonesian)
function formatDateString(dateStr) {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj)) return dateStr;
  
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  
  return `${day} ${month} ${year}`;
}

// Load state from localStorage
function loadState() {
  const localData = localStorage.getItem('finflow_state');
  if (localData) {
    try {
      state = JSON.parse(localData);
      // Fallback if structure is wrong
      if (!Array.isArray(state.transactions)) {
        state.transactions = [];
      }
    } catch (e) {
      console.error('Gagal memuat data dari LocalStorage:', e);
      state.transactions = [];
    }
  } else {
    // Inject some sample transactions for a beautiful first look
    state.transactions = [
      { id: '1', type: 'income', amount: 3000000, category: 'Gaji', date: getTodayDateString(-5), note: 'Gaji Bulanan Utama' },
      { id: '2', type: 'expense', amount: 50000, category: 'Makanan & Minuman', date: getTodayDateString(-3), note: 'Makan Siang Nasi Padang' },
      { id: '3', type: 'expense', amount: 150000, category: 'Hiburan', date: getTodayDateString(-2), note: 'Nonton Bioskop & Snack' },
      { id: '4', type: 'expense', amount: 200000, category: 'Belanja', date: getTodayDateString(-1), note: 'Beli Kaos Baru' },
      { id: '5', type: 'income', amount: 250000, category: 'Freelance', date: getTodayDateString(0), note: 'Membuat Logo Klien' }
    ];
    saveState();
  }
}

// Helper to get date strings relative to today
function getTodayDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Save state to localStorage
function saveState() {
  localStorage.setItem('finflow_state', JSON.stringify(state));
}

// Custom Toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  toast.className = 'toast'; // Reset
  toast.classList.add(type);
  
  let iconHtml = '<i class="fa-solid fa-circle-info"></i>';
  if (type === 'success') {
    iconHtml = '<i class="fa-solid fa-circle-check" style="color: var(--color-income);"></i>';
  } else if (type === 'error') {
    iconHtml = '<i class="fa-solid fa-circle-exclamation" style="color: var(--color-expense);"></i>';
  }
  
  toastMessage.innerHTML = `${iconHtml} <span>${message}</span>`;
  toast.classList.remove('hidden');
  
  if (toast.timeoutId) {
    clearTimeout(toast.timeoutId);
  }
  
  toast.timeoutId = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

// Dynamic dropdown category populate
function populateCategoryOptions(type) {
  const categorySelect = document.getElementById('category');
  categorySelect.innerHTML = '';
  
  const list = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  
  list.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

// Populate filters category list (includes both expense and income categories)
function populateFilterCategories() {
  const filterCat = document.getElementById('filter-category');
  filterCat.innerHTML = '<option value="all">Semua Kategori</option>';
  
  const allCategories = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];
  allCategories.sort().forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    filterCat.appendChild(opt);
  });
}

// Update the entire dashboard stats (Balance, Income, Expense, Indicator)
function updateDashboard() {
  let incomeTotal = 0;
  let expenseTotal = 0;
  
  state.transactions.forEach(t => {
    if (t.type === 'income') {
      incomeTotal += t.amount;
    } else {
      expenseTotal += t.amount;
    }
  });
  
  const balance = incomeTotal - expenseTotal;
  
  // Set elements content
  document.getElementById('total-balance').textContent = formatRupiah(balance);
  document.getElementById('total-income').textContent = formatRupiah(incomeTotal);
  document.getElementById('total-expense').textContent = formatRupiah(expenseTotal);
  
  // Set balance indicator
  const indicatorDot = document.querySelector('.indicator-dot');
  const statusText = document.getElementById('balance-status-text');
  
  indicatorDot.className = 'indicator-dot'; // Reset
  
  if (balance < 0) {
    indicatorDot.classList.add('red');
    statusText.textContent = 'Status Keuangan: Defisit (Pengeluaran > Pemasukan)';
  } else if (balance === 0 && incomeTotal === 0) {
    indicatorDot.classList.add('orange');
    statusText.textContent = 'Status Keuangan: Belum Ada Data';
  } else if (balance < incomeTotal * 0.1) {
    indicatorDot.classList.add('orange');
    statusText.textContent = 'Status Keuangan: Kritis (Tabungan < 10%)';
  } else {
    indicatorDot.classList.add('green');
    statusText.textContent = 'Status Keuangan: Sehat & Stabil';
  }
}

// Render dynamic doughnut chart via Chart.js
function updateChart() {
  const expenseTransactions = state.transactions.filter(t => t.type === 'expense');
  
  const chartCanvas = document.getElementById('expense-chart');
  const chartPlaceholder = document.getElementById('chart-placeholder');
  
  if (expenseTransactions.length === 0) {
    chartCanvas.style.display = 'none';
    chartPlaceholder.style.display = 'flex';
    if (expenseChartObj) {
      expenseChartObj.destroy();
      expenseChartObj = null;
    }
    return;
  }
  
  chartCanvas.style.display = 'block';
  chartPlaceholder.style.display = 'none';
  
  // Sum expense by category
  const categoriesData = {};
  expenseTransactions.forEach(t => {
    categoriesData[t.category] = (categoriesData[t.category] || 0) + t.amount;
  });
  
  const labels = Object.keys(categoriesData);
  const data = Object.values(categoriesData);
  const colors = labels.map(label => CATEGORY_MAP[label]?.color || '#9ca3af');
  
  const ctx = chartCanvas.getContext('2d');
  
  if (expenseChartObj) {
    expenseChartObj.data.labels = labels;
    expenseChartObj.data.datasets[0].data = data;
    expenseChartObj.data.datasets[0].backgroundColor = colors;
    expenseChartObj.update();
  } else {
    expenseChartObj = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#111827',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#e2e8f0',
              font: {
                family: 'Plus Jakarta Sans',
                size: 11,
                weight: '600'
              },
              padding: 12,
              boxWidth: 12
            }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#e2e8f0',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed !== null) {
                  label += formatRupiah(context.parsed);
                }
                return label;
              }
            }
          }
        },
        cutout: '70%'
      }
    });
  }
}

// Render filtered transaction list
function renderTransactions() {
  const listEl = document.getElementById('transaction-list');
  const listEmptyEl = document.getElementById('list-empty');
  
  const searchVal = document.getElementById('search').value.toLowerCase().trim();
  const filterType = document.getElementById('filter-type').value;
  const filterCat = document.getElementById('filter-category').value;
  
  // Filter core logic
  const filtered = state.transactions.filter(t => {
    const matchesSearch = t.note.toLowerCase().includes(searchVal) || t.category.toLowerCase().includes(searchVal);
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCat === 'all' || t.category === filterCat;
    
    return matchesSearch && matchesType && matchesCategory;
  });
  
  // Sort by date descending, then ID descending
  filtered.sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date);
    if (dateDiff !== 0) return dateDiff;
    return b.id.localeCompare(a.id);
  });
  
  // Update counts
  document.getElementById('transaction-count').textContent = `${filtered.length} item`;
  
  // Render list
  listEl.innerHTML = '';
  
  if (filtered.length === 0) {
    listEmptyEl.classList.remove('hidden');
    listEl.style.display = 'none';
  } else {
    listEmptyEl.classList.add('hidden');
    listEl.style.display = 'flex';
    
    filtered.forEach(t => {
      const itemMap = CATEGORY_MAP[t.category] || CATEGORY_MAP['Lain-lain'];
      
      const li = document.createElement('li');
      li.className = `tx-item ${t.type}-type`;
      
      const sign = t.type === 'income' ? '+' : '-';
      const formattedAmt = `${sign} ${formatRupiah(t.amount)}`;
      
      li.innerHTML = `
        <div class="tx-left">
          <div class="tx-icon" style="background-color: ${itemMap.color}15; color: ${itemMap.color};">
            <i class="${itemMap.icon}"></i>
          </div>
          <div class="tx-info">
            <span class="tx-category">${t.category}</span>
            <div class="tx-meta">
              <span class="tx-date">${formatDateString(t.date)}</span>
              ${t.note ? `<span class="tx-separator">•</span><span class="tx-note" title="${t.note}">${t.note}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="tx-right">
          <span class="tx-amount">${formattedAmt}</span>
          <button class="btn-delete-tx" data-id="${t.id}" title="Hapus transaksi">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `;
      
      // Delete listener
      li.querySelector('.btn-delete-tx').addEventListener('click', (e) => {
        const idToDelete = e.currentTarget.getAttribute('data-id');
        deleteTransaction(idToDelete);
      });
      
      listEl.appendChild(li);
    });
  }
}

// Add a transaction
function addTransaction(type, amount, category, date, note) {
  const newTx = {
    id: Date.now().toString(),
    type,
    amount,
    category,
    date,
    note: note.trim()
  };
  
  state.transactions.push(newTx);
  saveState();
  
  updateDashboard();
  updateChart();
  renderTransactions();
  
  showToast('Transaksi berhasil ditambahkan!', 'success');
}

// Delete single transaction
function deleteTransaction(id) {
  const txIndex = state.transactions.findIndex(t => t.id === id);
  if (txIndex > -1) {
    const tx = state.transactions[txIndex];
    state.transactions.splice(txIndex, 1);
    saveState();
    
    updateDashboard();
    updateChart();
    renderTransactions();
    
    showToast(`Transaksi "${tx.category}" berhasil dihapus.`, 'success');
  }
}

// Confirmation Modals Controller
const confirmModal = document.getElementById('confirm-modal');
let onConfirmAction = null;

function showConfirmModal(message, onConfirm) {
  document.getElementById('confirm-message').textContent = message;
  confirmModal.classList.remove('hidden');
  onConfirmAction = onConfirm;
}

function hideConfirmModal() {
  confirmModal.classList.add('hidden');
  onConfirmAction = null;
}

// Export/Import JSON helpers
function exportData() {
  if (state.transactions.length === 0) {
    showToast('Tidak ada transaksi untuk diekspor.', 'error');
    return;
  }
  
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  
  const dateStamp = new Date().toISOString().slice(0,10);
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `FinFlow_Data_${dateStamp}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  
  showToast('Data berhasil diekspor ke JSON!', 'success');
}

function importData(fileEvent) {
  const file = fileEvent.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && Array.isArray(parsed.transactions)) {
        state.transactions = parsed.transactions;
        saveState();
        
        updateDashboard();
        updateChart();
        renderTransactions();
        
        showToast('Data berhasil diimpor dari file JSON!', 'success');
      } else {
        showToast('Struktur file JSON tidak valid.', 'error');
      }
    } catch (err) {
      showToast('Gagal membaca file JSON. Pastikan file valid.', 'error');
    }
  };
  reader.readAsText(file);
  
  // Clear input
  fileEvent.target.value = '';
}

// 4. Initialisation & DOM Event Bindings
document.addEventListener('DOMContentLoaded', () => {
  // Load data
  loadState();
  
  // Default values setup
  document.getElementById('date').value = getTodayDateString(0);
  populateCategoryOptions('expense'); // start tab active type
  populateFilterCategories();
  
  // First Render
  updateDashboard();
  updateChart();
  renderTransactions();
  
  // Form Type Switcher tabs
  const typeTabs = document.querySelectorAll('.type-tab');
  typeTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      typeTabs.forEach(t => t.classList.remove('active'));
      const clickedTab = e.currentTarget;
      clickedTab.classList.add('active');
      
      const type = clickedTab.getAttribute('data-type');
      const radioBtn = clickedTab.querySelector('input[type="radio"]');
      radioBtn.checked = true;
      
      populateCategoryOptions(type);
    });
  });
  
  // Input Amount dynamic digit formatting as user types
  const amountInput = document.getElementById('amount');
  amountInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val) {
      e.target.value = new Intl.NumberFormat('id-ID').format(parseInt(val));
    } else {
      e.target.value = '';
    }
  });
  
  // Form Submit Action
  const form = document.getElementById('transaction-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const type = form.elements['tx-type'].value;
    const amountRaw = amountInput.value.replace(/\./g, '');
    const amount = parseInt(amountRaw);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const note = document.getElementById('note').value;
    
    if (isNaN(amount) || amount <= 0) {
      showToast('Masukkan nominal transaksi yang valid.', 'error');
      return;
    }
    
    addTransaction(type, amount, category, date, note);
    
    // Clear inputs except date
    amountInput.value = '';
    document.getElementById('note').value = '';
  });
  
  // Filters Event Listeners
  document.getElementById('search').addEventListener('input', renderTransactions);
  document.getElementById('filter-type').addEventListener('change', renderTransactions);
  document.getElementById('filter-category').addEventListener('change', renderTransactions);
  
  // Action Buttons Listeners
  document.getElementById('btn-export').addEventListener('click', exportData);
  
  const importInput = document.getElementById('import-file');
  document.getElementById('btn-import').addEventListener('click', () => {
    importInput.click();
  });
  importInput.addEventListener('change', importData);
  
  // Reset Button Modal Actions
  document.getElementById('btn-reset').addEventListener('click', () => {
    showConfirmModal('Apakah Anda yakin ingin menghapus semua data transaksi? Tindakan ini tidak bisa dibatalkan.', () => {
      state.transactions = [];
      saveState();
      updateDashboard();
      updateChart();
      renderTransactions();
      showToast('Semua data berhasil dibersihkan.', 'success');
    });
  });
  
  // Modals Actions
  document.getElementById('btn-confirm-cancel').addEventListener('click', hideConfirmModal);
  document.getElementById('btn-confirm-ok').addEventListener('click', () => {
    if (typeof onConfirmAction === 'function') {
      onConfirmAction();
    }
    hideConfirmModal();
  });
});
