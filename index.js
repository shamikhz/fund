// Handle fund form submission
document.addEventListener('DOMContentLoaded', function() {
  const fundForm = document.getElementById('fund-form');
  
  if (fundForm) {
    fundForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
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
      
      // Optional: Redirect to fund.html to see the entry
      // window.location.href = 'fund.html';
    });
  }
});

