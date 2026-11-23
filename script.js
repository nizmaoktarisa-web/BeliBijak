// ==========================================================
// Logika Aplikasi BelanjaCerdas / BeliBijak
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupCreateListForm();
});

/**
 * 1. Mengatur Navigasi Antar Tab (Beranda, Daftar, Riwayat)
 */
function navigateTo(targetViewId) {
  // Sembunyikan semua section
  const sections = document.querySelectorAll('.view-section');
  sections.forEach(sec => sec.classList.remove('active'));

  // Tampilkan section yang dipilih
  const targetSection = document.getElementById(targetViewId);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Perbarui state tab navigasi bawah
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    if (tab.getAttribute('data-target') === targetViewId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Perbarui judul di App Header
  const headerTitle = document.getElementById('headerTitle');
  if (targetViewId === 'viewBeranda') headerTitle.textContent = 'Beranda';
  if (targetViewId === 'viewDaftar') headerTitle.textContent = 'Daftar Belanja';
  if (targetViewId === 'viewRiwayat') headerTitle.textContent = 'Riwayat Belanja';
  
  // Scroll kembali ke atas saat ganti halaman
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupNavigation() {
  window.navigateTo = navigateTo;
}

/**
 * 2. Form Tambah Daftar Belanja Baru di Beranda
 */
function setupCreateListForm() {
  const btnOpen = document.getElementById('btnOpenCreateList');
  const btnCancel = document.getElementById('btnCancelList');
  const btnSave = document.getElementById('btnSaveList');
  const formCard = document.getElementById('createListForm');
  const inputName = document.getElementById('inputListName');
  const inputBudget = document.getElementById('inputListBudget');
  const valError = document.getElementById('formValidationError');
  const container = document.getElementById('activeListsContainer');
  const countBadge = document.getElementById('activeListCount');

  // Buka Form
  btnOpen.addEventListener('click', () => {
    formCard.classList.remove('hidden');
    inputName.focus();
  });

  // Batal Form
  btnCancel.addEventListener('click', () => {
    formCard.classList.add('hidden');
    valError.classList.add('hidden');
    inputName.value = '';
    inputBudget.value = '';
  });

  // Simpan Daftar Baru dengan Validasi
  btnSave.addEventListener('click', () => {
    const name = inputName.value.trim();
    const budgetVal = inputBudget.value.trim();

    if (!name || !budgetVal || isNaN(budgetVal) || Number(budgetVal) <= 0) {
      valError.classList.remove('hidden');
      return;
    }

    valError.classList.add('hidden');
    const formattedBudget = 'Rp ' + Number(budgetVal).toLocaleString('id-ID');

    // Buat elemen kartu baru
    const newCard = document.createElement('div');
    newCard.className = 'card card-item';
    newCard.onclick = () => navigateTo('viewDaftar');
    newCard.innerHTML = `
      <div class="card-item-body">
        <div>
          <h4 class="card-item-title">${escapeHTML(name)}</h4>
          <p class="card-item-sub">0 Barang</p>
        </div>
        <div class="card-item-right">
          <span class="badge badge-neutral">Siap Belanja</span>
          <span class="card-item-price">${formattedBudget}</span>
        </div>
      </div>
    `;

    // Sisipkan kartu di urutan teratas
    container.insertBefore(newCard, container.firstChild);

    // Perbarui jumlah daftar aktif
    const totalLists = container.querySelectorAll('.card-item').length;
    countBadge.textContent = `${totalLists} Daftar`;

    // Reset dan sembunyikan form
    inputName.value = '';
    inputBudget.value = '';
    formCard.classList.add('hidden');
  });
}

/**
 * 3. Logika Checklist Barang & Perhitungan Belanja (Layar 2)
 */
function handleItemToggle(checkbox) {
  const row = checkbox.closest('.item-row');
  if (checkbox.checked) {
    row.classList.add('purchased');
  } else {
    row.classList.remove('purchased');
  }

  updateShoppingCalculations();
}

function updateShoppingCalculations() {
  const allCheckboxes = document.querySelectorAll('#shoppingItemsList .item-checkbox');
  const totalItems = allCheckboxes.length;
  let checkedCount = 0;
  let checkedSubtotal = 0;

  allCheckboxes.forEach(cb => {
    if (cb.checked) {
      checkedCount++;
      checkedSubtotal += Number(cb.getAttribute('data-price') || 0);
    }
  });

  // Hitung persentase progress
  const percentage = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  // Perbarui UI Progress
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('itemsProgressBar');
  if (progressText) {
    progressText.textContent = `${checkedCount} dari ${totalItems} barang terbeli (${percentage}%)`;
  }
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
  }
}

// Helper untuk mencegah injeksi XSS pada input teks
function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
