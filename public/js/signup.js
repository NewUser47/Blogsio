/* eslint-disable no-undef */
/*global document*/

const signup = document.querySelector('#signup');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const nameuser = document.querySelector('#name');
const confirmPassword = document.querySelector('#cnfpassword');

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

signup.addEventListener('click', async (event) => {
  event.preventDefault();
  const signedup = await fetch('/api/v1/users/signup', {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    },
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      name: nameuser.value,
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    }),
  });
  const response = await signedup.json();
  console.log(response);
  if (response.status === 'success') {
    await showAlert('success', 'Signed Up Successfully!');
    window.setTimeout(() => {
      window.location.href = '/login.html';
    }, 2000);
  } else if (response.status === 'fail' || response.status === 'error') {
    const msg = response.message;
    if (msg.startsWith('E11000')) {
      await showAlert('error', `User already exists. Go to login!`);
      localStorage.clear();
      window.setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    } else if (
      msg === 'User validation failed: confirmPassword: Passwords do not match'
    ) {
      await showAlert('error', `Failed to signup. Passwords do not match`);
      localStorage.clear();
      window.setTimeout(() => {
        window.location.href = '/signup.html';
      }, 2000);
    } else {
      await showAlert('error', `Failed to signup. ${msg}`);
      localStorage.clear();
      window.setTimeout(() => {
        window.location.href = '/signup.html';
      }, 2000);
    }
  }
});
