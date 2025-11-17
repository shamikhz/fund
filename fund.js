import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, deleteDoc, doc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCrInzMyfWuDBxSK3SVGJq1gilxb4Z6Tfw",
  authDomain: "fund-c9c9e.firebaseapp.com",
  projectId: "fund-c9c9e",
  storageBucket: "fund-c9c9e.firebasestorage.app",
  messagingSenderId: "293603215710",
  appId: "1:293603215710:web:b23d190fdd60e2d52527cf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const fundsCollection = collection(db, 'funds');
const ACCESS_PASSWORD = 'fundLock@123';
let actionsUnlocked = false;
let fundsCache = [];

// Display all fund records in the table
document.addEventListener('DOMContentLoaded', function() {
  setupActionsLock();
  loadFundsTable();
});

function setupActionsLock() {
  const passwordInput = document.getElementById('actions-password');
  const unlockBtn = document.getElementById('unlock-actions-btn');
  const lockStatus = document.getElementById('actions-lock-status');

  if (!passwordInput || !unlockBtn) {
    return;
  }

  function updateStatus(message, isError = false) {
    if (!lockStatus) return;
    lockStatus.textContent = message;
    lockStatus.classList.toggle('error', isError);
    lockStatus.classList.toggle('unlocked', !isError && actionsUnlocked);
  }

  async function tryUnlock() {
    if (passwordInput.value === ACCESS_PASSWORD) {
      actionsUnlocked = true;
      passwordInput.value = '';
      passwordInput.disabled = true;
      unlockBtn.disabled = true;
      updateStatus('Actions unlocked. You can edit or delete entries now.');
      await loadFundsTable();
    } else {
      updateStatus('Incorrect password. Actions remain locked.', true);
    }
  }

  unlockBtn.addEventListener('click', tryUnlock);
  passwordInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      tryUnlock();
    }
  });
}

async function loadFundsTable() {
  const tableBody = document.getElementById('fund-table-body');
  const noDataMessage = document.getElementById('no-data-message');
  
  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

  try {
    const fundsQuery = query(fundsCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(fundsQuery);
    fundsCache = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    updateTotalFund(fundsCache);
    tableBody.innerHTML = '';

    if (fundsCache.length === 0) {
      if (noDataMessage) {
        noDataMessage.style.display = 'block';
      }
      return;
    }

    if (noDataMessage) {
      noDataMessage.style.display = 'none';
    }

    const lockAttributes = actionsUnlocked ? '' : 'disabled title="Enter password to unlock actions"';

    fundsCache.forEach(function(fund) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(fund.donorName || '')}</td>
        <td>${formatCurrency(fund.amount)}</td>
        <td>${formatDate(fund.date)}</td>
        <td>${escapeHtml(fund.description || '')}</td>
        <td class="action-buttons">
          <button class="edit-btn" onclick="editFund('${fund.id}')" ${lockAttributes}>Edit</button>
          <button class="delete-btn" onclick="deleteFund('${fund.id}')" ${lockAttributes}>Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading funds:', error);
    tableBody.innerHTML = '<tr><td colspan="5">Failed to load funds. Please refresh.</td></tr>';
    if (noDataMessage) {
      noDataMessage.style.display = 'block';
    }
  }
}

async function editFund(id) {
  if (!actionsUnlocked) {
    alert('Please unlock the actions with the password before editing.');
    return;
  }
  const fund = fundsCache.find(f => f.id === id);
  
  if (!fund) {
    alert('Fund record not found.');
    return;
  }
  
  const newDonorName = prompt('Enter donor name:', fund.donorName || '');
  if (newDonorName === null) return;
  
  const newAmount = prompt('Enter amount:', fund.amount);
  if (newAmount === null) return;
  
  const newDate = prompt('Enter date (YYYY-MM-DD):', fund.date);
  if (newDate === null) return;
  
  const newDescription = prompt('Enter description:', fund.description || '');
  if (newDescription === null) return;
  
  if (!newDonorName.trim() || !newAmount || !newDate) {
    alert('Please fill in all required fields.');
    return;
  }
  
  try {
    const fundRef = doc(db, 'funds', id);
    await updateDoc(fundRef, {
      donorName: newDonorName.trim(),
      amount: parseFloat(newAmount),
      date: newDate,
      description: newDescription.trim() || 'N/A'
    });
    alert('Fund record updated successfully!');
    await loadFundsTable();
  } catch (error) {
    console.error('Error updating fund:', error);
    alert('Unable to update this record. Please try again.');
  }
}

async function deleteFund(id) {
  if (!actionsUnlocked) {
    alert('Please unlock the actions with the password before deleting.');
    return;
  }
  if (!confirm('Are you sure you want to delete this fund record?')) {
    return;
  }
  
  try {
    await deleteDoc(doc(db, 'funds', id));
    alert('Fund record deleted successfully!');
    await loadFundsTable();
  } catch (error) {
    console.error('Error deleting fund:', error);
    alert('Unable to delete this record. Please try again.');
  }
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
  if (typeof text !== 'string') {
    return '';
  }
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) {
    return '-';
  }
  const date = new Date(dateString + 'T00:00:00');
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatCurrency(amount) {
  const value = parseFloat(amount) || 0;
  return value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  });
}

function updateTotalFund(funds) {
  const totalAmountElement = document.getElementById('total-amount');
  if (!totalAmountElement) {
    return;
  }
  const total = funds.reduce((sum, fund) => {
    const value = parseFloat(fund.amount);
    return sum + (isNaN(value) ? 0 : value);
  }, 0);
  totalAmountElement.textContent = formatCurrency(total);
}

window.editFund = editFund;
window.deleteFund = deleteFund;

