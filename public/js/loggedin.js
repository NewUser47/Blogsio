/* eslint-disable no-undef */
/*global document*/
/* eslint-disable prettier/prettier */

const loggedin = document.querySelector('#logged-in');
const login = document.querySelector('#log-in');
const btnlogin = document.querySelector('#buttonlog');
const token = localStorage.getItem('jwt');

let result = '';
// console.log(token);
const getAll = async () => {
  const blogs = await fetch('/api/v1/blogs', {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      jwt: token,
    },
    method: 'GET',
    credentials: 'include',
  });
  result = await blogs.json();
  if (token) {
    login.style.display = 'none';
    loggedin.style.display = 'block';
    loggedin.innerHTML = `<a href="/useraccount.html" class="nav__el">
    <img src="img/defaultuser.png" alt="User photo" class="nav__user-img" />
    <span style="padding-top: 20px;">${result.user.name.split(' ')[0]}</span>
  </a><a href="createblog.html" style="text-decoration: none; margin-left: 15px;">
  <button class="glow-on-hover">Create Blog</button>
</a>`;
  } else {
    login.style.display = 'block';
    loggedin.style.display = 'none';
  }
};
getAll();
