const ACCESS_PASSWORD = 'fundLock@123';

// Handle fund form submission
document.addEventListener('DOMContentLoaded', function() {
  const fundForm = document.getElementById('fund-form');
  const submitBtn = document.getElementById('submit-btn');
  const formPasswordInput = document.getElementById('form-password');
  const unlockFormBtn = document.getElementById('unlock-form-btn');
  const formLockStatus = document.getElementById('form-lock-status');
  let formUnlocked = false;

  function updateStatus(message, isError = false) {
    if (!formLockStatus) return;
    formLockStatus.textContent = message;
    formLockStatus.classList.toggle('error', isError);
    formLockStatus.classList.toggle('unlocked', !isError && formUnlocked);
  }

  function tryUnlockForm() {
    if (!formPasswordInput || !submitBtn) return;
    if (formPasswordInput.value === ACCESS_PASSWORD) {
      formUnlocked = true;
      submitBtn.disabled = false;
      formPasswordInput.value = '';
      formPasswordInput.disabled = true;
      unlockFormBtn.disabled = true;
      updateStatus('Form unlocked. You can submit entries now.');
    } else {
      updateStatus('Incorrect password. Form remains locked.', true);
    }
  }

  if (unlockFormBtn && formPasswordInput) {
    unlockFormBtn.addEventListener('click', tryUnlockForm);
    formPasswordInput.addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        tryUnlockForm();
      }
    });
  }
  
  if (fundForm) {
    fundForm.addEventListener('submit', function(e) {
      e.preventDefault();

      if (!formUnlocked) {
        alert('Please unlock the form with the password before submitting.');
        return;
      }
      
      // Get form values
      const donorName = document.getElementById('donor-name').value.trim();
      const amount = parseFloat(document.getElementById('amount').value);
      const date = document.getElementById('date').value;
      const description = document.getElementById('description').value.trim();
      
      // Validate form
      if (!donorName || !amount || !date) {
        alert('Please fill in all required fields.');
        return;
      }
      
      // Get existing funds from localStorage
      let funds = JSON.parse(localStorage.getItem('funds')) || [];
      
      // Create new fund entry
      const newFund = {
        id: Date.now(), // Simple ID generation using timestamp
        donorName: donorName,
        amount: amount,
        date: date,
        description: description || 'N/A'
      };
      
      // Add to array
      funds.push(newFund);
      
      // Save to localStorage
      localStorage.setItem('funds', JSON.stringify(funds));
      
      // Show success message
      alert('Fund contribution submitted successfully!');
      
      // Reset form
      fundForm.reset();
    });
  }
});

