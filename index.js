import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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
    fundForm.addEventListener('submit', async function(e) {
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
      
      try {
        await addDoc(fundsCollection, {
          donorName,
          amount,
          date,
          description: description || 'N/A',
          createdAt: serverTimestamp()
        });
        alert('Fund contribution submitted successfully!');
        fundForm.reset();
      } catch (error) {
        console.error('Error saving fund entry:', error);
        alert('Unable to submit fund right now. Please try again.');
      }
    });
  }
});


