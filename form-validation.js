document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  const status = form.querySelector('.form-status');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (status) status.textContent = 'Thanks — we will be in touch shortly.';
    form.reset();
  });
});
