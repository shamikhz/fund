// Display all fund records in the table
document.addEventListener('DOMContentLoaded', function() {
  loadFundsTable();
});

function loadFundsTable() {
  const funds = JSON.parse(localStorage.getItem('funds')) || [];
  const tableBody = document.getElementById('fund-table-body');
  const noDataMessage = document.getElementById('no-data-message');
  
  // Clear existing rows
  tableBody.innerHTML = '';
  
  if (funds.length === 0) {
    // Show no data message
    if (noDataMessage) {
      noDataMessage.style.display = 'block';
    }
    return;
  }
  
  // Hide no data message
  if (noDataMessage) {
    noDataMessage.style.display = 'none';
  }
  
  // Populate table with fund data
  funds.forEach(function(fund) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(fund.donorName)}</td>
      <td>${fund.amount.toFixed(2)}</td>
      <td>${formatDate(fund.date)}</td>
      <td>${escapeHtml(fund.description)}</td>
      <td class="action-buttons">
        <button class="edit-btn" onclick="editFund(${fund.id})">Edit</button>
        <button class="delete-btn" onclick="deleteFund(${fund.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function editFund(id) {
  const funds = JSON.parse(localStorage.getItem('funds')) || [];
  const fund = funds.find(f => f.id === id);
  
  if (!fund) {
    alert('Fund record not found.');
    return;
  }
  
  // Prompt for new values
  const newDonorName = prompt('Enter donor name:', fund.donorName);
  if (newDonorName === null) return; // User cancelled
  
  const newAmount = prompt('Enter amount:', fund.amount);
  if (newAmount === null) return; // User cancelled
  
  const newDate = prompt('Enter date (YYYY-MM-DD):', fund.date);
  if (newDate === null) return; // User cancelled
  
  const newDescription = prompt('Enter description:', fund.description);
  if (newDescription === null) return; // User cancelled
  
  // Validate
  if (!newDonorName.trim() || !newAmount || !newDate) {
    alert('Please fill in all required fields.');
    return;
  }
  
  // Update fund
  fund.donorName = newDonorName.trim();
  fund.amount = parseFloat(newAmount);
  fund.date = newDate;
  fund.description = newDescription.trim() || 'N/A';
  
  // Save back to localStorage
  localStorage.setItem('funds', JSON.stringify(funds));
  
  // Reload table
  loadFundsTable();
  
  alert('Fund record updated successfully!');
}

function deleteFund(id) {
  if (!confirm('Are you sure you want to delete this fund record?')) {
    return;
  }
  
  const funds = JSON.parse(localStorage.getItem('funds')) || [];
  const filteredFunds = funds.filter(f => f.id !== id);
  
  // Save back to localStorage
  localStorage.setItem('funds', JSON.stringify(filteredFunds));
  
  // Reload table
  loadFundsTable();
  
  alert('Fund record deleted successfully!');
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
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
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

