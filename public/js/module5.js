(function () {
  // Smooth-scroll to result when server renders one
  const result = document.querySelector('.quiz-result');
  if (result) {
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Prevent submitting with no selection
  const form = document.getElementById('quiz-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    const chosen = form.querySelector('input[name="answer"]:checked');
    if (!chosen) {
      e.preventDefault();
      alert('Please choose an answer before submitting.');
    }
  });
})();
