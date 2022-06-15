/* eslint-disable no-undef */
/*global document*/
/* eslint-disable prettier/prettier */

const email = document.querySelector('#email');
const password = document.querySelector('#password');
const loginbtn = document.querySelector('#login');
const forgotBtn = document.querySelector('#forgotpw');

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

loginbtn.addEventListener('click', async (event) => {
  event.preventDefault();
  const loggedin = await fetch('/api/v1/users/login', {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    },
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      email: email.value,
      password: password.value,
    }),
  });
  const response = await loggedin.json();
  window.localStorage.setItem('jwt', response.token);
  if (response.status === 'success') {
    await showAlert('success', 'Logged In Successfully');
    window.setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  } else if (response.status === 'fail') {
    await showAlert('error', `Failed to login! ${response.message}.`);
    window.setTimeout(() => {
      localStorage.clear();
      window.location.href = '/login.html';
    }, 2000);
  }
});

forgotBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  console.log(event.type);
  let forgotPassword;
  if (!email.value) {
    await showAlert('error', 'Please enter your email', 2);
  } else {
    await showAlert('success', 'Token being sent', 1);
    forgotPassword = await fetch('/api/v1/users/forgotPassword', {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
      },
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        email: email.value,
      }),
    });
  }
  const response = await forgotPassword.json();
  console.log(response);
  if (response.status === 'success') {
    await showAlert('success', `${response.message} Kindly check.`);
    window.setTimeout(() => {
      window.location.href = '/resetPassword.html';
    }, 3000);
  } else if (response.status === 'fail') {
    await showAlert('error', `Error occured! ${response.message}`);
    window.setTimeout(() => {
      window.location.href = '/login.html';
    }, 3000);
  }
});
