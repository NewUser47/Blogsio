/* eslint-disable no-undef */
/*global document*/
/* eslint-disable prettier/prettier */

const resetPassword = document.querySelector('#resetpw');

const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
const showAlert = (type, msg, time = 7) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, time * 1000);
};

resetPassword.addEventListener('click', async (event) => {
  event.preventDefault();
  const token = document.querySelector('#token');
  const password = document.querySelector('#password');
  const confirmPassword = document.querySelector('#cnfpassword');
  const resetPw = await fetch(`/api/v1/users/resetPassword/${token.value}`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    },
    method: 'PATCH',
    credentials: 'include',
    body: JSON.stringify({
      password: password.value,
      confirmPassword: confirmPassword.value,
    }),
  });
  const response = await resetPw.json();
  console.log(response);
  if (response.status === 'success') {
    await showAlert('success', 'Your password has been reset! Login..');
    window.setTimeout(() => {
      window.location.href = '/login.html';
    }, 3000);
  } else if (response.status === 'fail') {
    await showAlert('error', `Failed to login! ${response.message}.`);
    window.setTimeout(() => {
      localStorage.clear();
      window.location.href = '/login.html';
    }, 3000);
  }
});
