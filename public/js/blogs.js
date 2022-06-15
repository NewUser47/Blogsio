/* eslint-disable no-undef */
/*global document*/

const cardContainer = document.querySelector('.card-container');

// document.addEventListener('load', () => {

// });
let blogResult = '';
let html = '';
window.onload = async () => {
  const blogs = await fetch('/api/v1/blogs', {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    },
    method: 'GET',
    credentials: 'include',
  });
  blogResult = await blogs.json();
  const blogsArray = blogResult.data.data;
  console.log(blogsArray);
  //   console.log(blogsArray[0].createdAt.split('-')[1]);
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  blogsArray.forEach((blog) => {
    html += `<div class="card">
    <div class="card__header">
      <div class="card__picture">
        <div class="card__picture-overlay">&nbsp;</div>
        <img
          src=${blog.imageCover};
          alt=${blog.title}
          class="card__picture-img"
        />
      </div>
    
      <h3 class="heading-tertirary">
        <span>${blog.title}</span>
      </h3>
    </div>
    
    <div class="card__details">
      <h4 class="card__sub-heading">Blog in ${blog.domain}</h4>
      <p class="card__text">
      ${blog.summary}
      </p>
      <div class="card__data">
        <svg class="card__icon">
          <use xlink:href="img/icons.svg#icon-calendar"></use>
        </svg>
        <span>${monthNames[blogsArray[0].createdAt.split('-')[1] * 1 - 1]} ${
      blogsArray[0].createdAt.split('-')[0]
    }</span>
      </div>
      <div class="card__data">
        <svg class="card__icon">
          <use xlink:href="img/icons.svg#icon-info"></use>
        </svg>
        <span>${blog.content.split(' ').length} words</span>
      </div>
      <div class="card__data">
        <svg class="card__icon">
          <use xlink:href="img/icons.svg#icon-user"></use>
        </svg>
        <span>${blog.author.name}</span>
      </div>
    </div>
    
    <div class="card__footer">
      <p>
        <span class="card__footer-value">${
          Math.round(blog.content.split(' ').length / 2.3) / 100
        } </span>
        <span class="card__footer-text">minute read</span>
      </p>
      <p class="card__ratings">
        <span class="card__footer-value">${blog.reviewAverage}</span>
        <span class="card__footer-text">rating {${blog.reviewQuantity})</span>
      </p>
      <a href="/blog.html?${blog.slug}" class="btn btn--green btn--small">
      Read More</a>
  
    </div>
    </div>`;
  });
  cardContainer.innerHTML = html;
};
