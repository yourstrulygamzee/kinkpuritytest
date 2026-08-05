(function () {
  function getCheckboxes() {
    return Array.from(document.querySelectorAll('input[type="checkbox"]'));
  }

  async function submitData(purityScore, answers) {
    const payload = {
      purityScore,
      answers,
      timestamp: new Date().toISOString(),
      attemptId: crypto.randomUUID()
    };

    try {
      const response = await fetch("https://ricepuritytest.com/prod/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
    } catch (error) {
      // Keep the score flow working even if the submission endpoint is unavailable.
    }

    window.location.href = `./score.html?score=${purityScore}`;
  }

  function init() {
    const submitButton = document.getElementById('submit');
    const resetButton = document.getElementById('reset');

    if (!submitButton || !resetButton) {
      return;
    }

    submitButton.addEventListener('click', async function (event) {
      event.preventDefault();
      submitButton.disabled = true;

      const answers = getCheckboxes().map(cb => cb.checked ? 1 : 0);
      const sins = answers.reduce((sum, value) => sum + value, 0);
      const purity = 100 - sins;

      sessionStorage.setItem('score', String(purity));
      await submitData(purity, answers);
    });

    resetButton.addEventListener('click', function (event) {
      event.preventDefault();
      getCheckboxes().forEach((checkbox) => {
        if (!checkbox.disabled) {
          checkbox.checked = false;
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();