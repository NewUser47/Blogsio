/* eslint-disable no-undef */
/*global document*/
/* eslint-disable prettier/prettier */
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
const createbtn = document.querySelector('#createblog');
let currentUser;
let user;
window.onload = async () => {
  const token = localStorage.getItem('jwt');
  if (!token) {
    showAlert('error', 'You are not signed in! Please sign in to post a blog.');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 3000);
  } else {
    currentUser = await fetch(`/api/v1/users/me`, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
      },
      method: 'GET',
      credentials: 'include',
    });
    user = await currentUser.json();
  }
};

createbtn.addEventListener('click', async (event) => {
  event.preventDefault();
  const title = document.querySelector('#title');
  const domain = document.querySelector('#domain');
  const summary = document.querySelector('#summary');
  const content = document.querySelector('#content');
  const coverImage = document.querySelector('#coverimg');
  const displayImage1 = document.querySelector('#displayimg1');
  const displayImage2 = document.querySelector('#displayimg2');
  const displayImage3 = document.querySelector('#displayimg3');

  console.log(
    'here',
    coverImage.files,
    displayImage1.files,
    displayImage2.files,
    displayImage3.files
  );
  // const formData = new FormData();
  // formData.append('title', title.value);
  // formData.append('domain', domain.value);
  // formData.append('summary', summary.value);
  // formData.append('content', content.value);
  // formData.append('coverImage', coverImage.files);
  // formData.append('displayImage1', displayImage1.files);
  // formData.append('displayImage2', displayImage2.files);
  // formData.append('displayImage3', displayImage3.files);
  // formData.append('author', user.data.data._id);

  const sendBody = {
    title: title.value,
    domain: domain.value,
    summary: summary.value,
    content: content.value,
    coverImage: coverImage.files,
    image1: displayImage1.files,
    image2: displayImage2.files,
    image3: displayImage3.files,
    author: user.data.data._id,
  };
  // console.log(formData);
  console.log(sendBody);
  try {
    const createBlog = await fetch('/api/v1/blogs/', {
      headers: {
        'access-control-allow-origin': '*',
      },
      method: 'POST',
      credentials: 'include',
      // body: formData,
      body: sendBody,
    });
    const response = await createBlog.json();
    console.log(response);
    if (response.status === 'success') {
      await showAlert('success', 'Created New Blog! Redirecting to Home..');
      window.setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } else if (response.status === 'fail' || response.status === 'error') {
      await showAlert(
        'error',
        `Error! ${response.message.split(':')[2]}. Retry.`
      );
      window.setTimeout(() => {
        //   window.location.href = '/createblog.html';
      }, 10000);
    }
  } catch (err) {
    showAlert('error', 'Failed to create Blog!', 1);
    showAlert('error', `${err}`, 3);
  }
});
