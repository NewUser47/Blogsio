/* eslint-disable no-undef */
/*global document*/
/* eslint-disable prettier/prettier */

const email = document.getElementById('email');
const nameUser = document.getElementById('name');
const saveSettings = document.getElementById('savebtn');
const updatePassword = document.getElementById('updatePw');
const adminNav = document.querySelector('.admin-nav');
const logoutBtn = document.querySelector('#logout');
const choosepic = document.querySelector('#choosepic');

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

let currentUser;
let user;

window.onload = async () => {
  currentUser = await fetch(`/api/v1/users/me`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    },
    method: 'GET',
    credentials: 'include',
  });
  user = await currentUser.json();
  console.log(user);
  if (user.data.data.role !== 'admin') {
    adminNav.style.display = 'none';
  }
  email.value = user.data.data.email;
  nameUser.value = user.data.data.name;
};

saveSettings.addEventListener('click', async (event) => {
  event.preventDefault();
  const newName = document.getElementById('name');
  if (newName.value !== user.data.data.name) {
    const updateUser = await fetch('/api/v1/users/updateMe', {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
      },
      method: 'PATCH',
      credentials: 'include',
      body: JSON.stringify({
        name: newName.value,
      }),
    });
    const response = await updateUser.json();
    console.log(response);
    if (response.status === 'success') {
      await showAlert('success', 'Details updated successfully!', 3);
      window.setTimeout(() => {
        window.location.href = '/useraccount.html';
      }, 2000);
    } else if (response.status === 'fail' || response.status === 'error') {
      await showAlert(
        'error',
        `Failed to update details! ${response.message}.`,
        3
      );
      window.setTimeout(() => {
        window.location.href = '/useraccount.html';
      }, 2000);
    }
  } else {
    showAlert('error', 'New name cannot be the same as before!', 3);
  }
});

updatePassword.addEventListener('click', async (event) => {
  event.preventDefault();
  const passwordCurrent = document.getElementById('password-current');
  const password = document.getElementById('password');
  const passwordConfirm = document.getElementById('password-confirm');
  const changePassword = await fetch('/api/v1/users/updateMyPassword', {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    },
    method: 'PATCH',
    credentials: 'include',
    body: JSON.stringify({
      password: password.value,
      passwordCurrent: passwordCurrent.value,
      confirmPassword: passwordConfirm.value,
    }),
  });
  const response = await changePassword.json();
  console.log(response);
  if (response.status === 'success') {
    await showAlert('success', 'Password updated successfully!', 3);
    window.setTimeout(() => {
      localStorage.clear();
      window.location.href = '/login.html';
    }, 2000);
  } else if (response.status === 'fail' || response.status === 'error') {
    await showAlert(
      'error',
      `Failed to update details! ${response.message.split(':')[2]}.`,
      3
    );
    window.setTimeout(() => {
      localStorage.clear();
      window.location.href = '/login.html';
    }, 2000);
  }
});

logoutBtn.addEventListener('click', async () => {
  await showAlert('success', 'Logged Out Successfully!', 2);
  localStorage.clear();
  window.setTimeout(() => {
    window.location.href = '/';
  }, 2000);
});

// choosepic.addEventListener('click', async ()=>{

// })
