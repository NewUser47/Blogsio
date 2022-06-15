/* eslint-disable no-undef */
/*global document*/
/* eslint-disable prettier/prettier */

const blogSection = document.querySelector('#blog-section');
console.log(window.location.search.substring(1));

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

const getReview = (blogResult) => {
  const reviewForm = document.querySelector('.reviewForm');
  const reviewBtn = document.querySelector('#addreview');

  reviewBtn.addEventListener('click', (event) => {
    reviewForm.classList.toggle('activeForm');
    const review = document.querySelector('#review');
    const rating = document.querySelector('#stars');
    const postReview = document.querySelector('#postreview');
    ///api/v1/blogs/6289ba6d3595a43514f402f4/reviews
    postReview.addEventListener('click', async (e) => {
      e.preventDefault();
      const reviewRes = await fetch(
        `/api/v1/blogs/${blogResult.blog._id}/reviews`,
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'access-control-allow-origin': '*',
          },
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            review: review.value,
            rating: rating.value,
          }),
        }
      );
      const response = await reviewRes.json();
      console.log(response);
      if (response.status === 'success') {
        await showAlert('success', 'Review added successfully!');
        window.setTimeout(() => {
          window.location.href = `/blog.html?${window.location.search.substring(
            1
          )}`;
        }, 2000);
      } else if (
        response.status === 'error' &&
        response.message.startsWith('E11000')
      ) {
        await showAlert('error', `Only 1 review allowed per person!`);
        window.setTimeout(() => {
          window.location.href = `/blog.html?${window.location.search.substring(
            1
          )}`;
        }, 2000);
      } else {
        await showAlert('error', `Something went wrong! ${response.message}`);
        window.setTimeout(() => {
          window.location.href = `/blog.html?${window.location.search.substring(
            1
          )}`;
        }, 3000);
      }
    });
  });
};

let blogResult = '';
let html = '';
window.onload = async () => {
  const blogs = await fetch(
    `/api/v1/blogs/${window.location.search.substring(1)}`,
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
      },
      method: 'GET',
      credentials: 'include',
    }
  );
  blogResult = await blogs.json();
  const blogObj = blogResult.blog;
  const blogReviews = blogObj.reviews;
  console.log(blogObj);
  console.log(blogReviews);
  const paragraphs = blogObj.content.split('\n');
  html = `<section class="section-header">
<div class="header__hero">
    <div class="header__hero-overlay">&nbsp;</div><img class="header__hero-img" src=${
      blogObj.imageCover
    } alt="Blog Img" />
</div>
<div class="heading-box">
    <h1 class="heading-primary"><span>${blogResult.title}</span></h1>
    <div class="heading-box__group">
        <div class="heading-box__detail"><svg class="heading-box__icon">
                <use xlink:href="/img/icons.svg#icon-clock"></use>
            </svg><span class="heading-box__text">${
              Math.round(blogObj.content.split(' ').length / 2.3) / 100
            }  minute read</span></div>
        <div class="heading-box__detail"><svg class="heading-box__icon">
                <use xlink:href="/img/icons.svg#icon-user"></use>
            </svg><span class="heading-box__text">${
              blogObj.author.name
            }</span></div>
    </div>
</div>
</section>
<section class="section-description">
<div class="description-box">
    <h2 class="heading-secondary ma-bt-lg">About ${blogObj.title} in field of ${
    blogObj.domain
  }</h2>`;
  paragraphs.forEach((para) => {
    html += `<p class="description__text">${para}</p>`;
  });

  html += `  </div>
  </section><section class="section-pictures">
  <div class="picture-box"><img class="picture-box__img picture-box__img--1" src=${blogObj.image1} alt="Display Image 1" /></div>
  <div class="picture-box"><img class="picture-box__img picture-box__img--2" src=${blogObj.image2}  alt="Display Image 2" /></div>
  <div class="picture-box"><img class="picture-box__img picture-box__img--3" src=${blogObj.image3}  alt="Display Image 3" /></div>
</section>
<section class="section-reviews">
    <div class="reviews">`;

  console.log(blogReviews.length);
  if (blogReviews.length > 0) {
    blogReviews.forEach((review) => {
      html += `<div class="reviews__card">
      <div class="reviews__avatar">
          <img class="reviews__avatar-img" src="/img/users/user-7.jpg" alt="Jim Brown" />
          <h6 class="reviews__user">${review.user.name}</h6>
      </div>
      <p class="reviews__text">${review.review}</p>
      <div class="reviews__rating">`;

      let stars = review.rating;
      let greyStars = 5 - Math.ceil(stars);
      console.log(stars, greyStars);
      while (stars >= 1) {
        html += `<svg class="reviews__star reviews__star--active">
        <use xlink:href="/img/icons.svg#icon-star"></use>
    </svg>`;
        stars -= 1;
      }
      if (stars > 0 && stars < 1) {
        html += `<svg class="reviews__star reviews__star--halfactive"><use xlink:href="/img/icons.svg#icon-star"></use>
        <defs>
                <linearGradient id="grad">
                  <stop offset="50%" stop-color="#55c57a"/>
                  <stop offset="50%" stop-color="#bbb"/>
                </linearGradient>
              </defs>
    </svg>`;
      }
      while (greyStars > 0) {
        html += `<svg class="reviews__star reviews__star--inactive">
              <use xlink:href="/img/icons.svg#icon-star"></use>
          </svg>`;
        greyStars -= 1;
      }
      html += `</div></div>`;
    });
  } else {
    html += `<div class="reviews__card">
    <div class="reviews__avatar">
        <!-- <img class="reviews__avatar-img" src="/img/users/user-7.jpg" alt="Jim Brown" /> -->
        <h6 class="reviews__user">Reviews</h6>
    </div>
    <p class="reviews__text">Be the first one to add a review!</p>
    <div class="reviews__rating"><svg class="reviews__star reviews__star--active">
            <use xlink:href="/img/icons.svg#icon-star"></use>
        </svg><svg class="reviews__star reviews__star--active">
            <use xlink:href="/img/icons.svg#icon-star"></use>
        </svg><svg class="reviews__star reviews__star--active">
            <use xlink:href="/img/icons.svg#icon-star"></use>
        </svg><svg class="reviews__star reviews__star--active">
            <use xlink:href="/img/icons.svg#icon-star"></use>
        </svg><svg class="reviews__star reviews__star--active">
            <use xlink:href="/img/icons.svg#icon-star"></use>
        </svg></div>
    </div>`;
  }
  html += `</div><button class="btn btn--green span-all-rows" style="font-size: 15px;
  width: 15%;
  height: 45%;
  margin-left: 42%;
  margin-top: 20px;
  position: sticky;
  background-color: #1d1d1d;
  float: left; " id="addreview">Add your own review</button>
</section>
<section class="reviewForm">`;

  if (localStorage.getItem('jwt')) {
    html += `<div class="login-form" style="margin-bottom: 240px;">
    <h2 class="heading-secondary ma-bt-lg">Add your review</h2>
    <form>
        <div class="form__group">
            <label class="form__label" for="review">Review <span style="color:red;">*</span></label>
            <input class="form__input" id="review" type="text" placeholder="Your review" required="required" />
        </div>
        <div class="form__group">
            <label class="form__label" for="review">Rating out of 5 <span style="color:red;">*</span></label>
            <input class="form__input" id="stars" type="text" placeholder="Your rating (Min: 1, Max: 5)" required="required" />
        </div>
        <div class="form__group"><button class="btn btn--green" id="postreview">Post Review</button></div>
    </form>
</div>`;
  } else {
    html += `<div class="login-form" style="margin-bottom: 240px;">
  <h2 class="heading-secondary ma-bt-lg">Add your review</h2>
  <form>
      <div class="form__group">
          <label class="form__label" for="review">Review <span style="color:red;">*</span></label>
          <input class="form__input" id="review" type="text" placeholder="Your need to be logged in to post a review" required="required" disabled/>
      </div>
      <div class="form__group"><a href='/login.html' class="btn btn--green" style="font-weight:bold;"> Go to login</a></div>
  </form>
</div>`;
  }

  html += `</section>
<section class="section-cta">
  <div class="cta">
      <div class="cta__img cta__img--logo"><img src="/img/logofav.png" alt="Blogsio logo" style="filter: brightness(0) invert(1);"/></div>
      <img class="cta__img cta__img--2" src=${blogObj.imageCover} alt="" />
      <div class="cta__content">
          <h2 class="heading-secondary">Continue Exploring</h2>
          <p class="cta__text">Hope you enjoyed the blog! Make sure to add your feedback.</p><a href='/' style='text-decoration: none; font-weight: bold;' class="btn btn--green span-all-rows">Go to home page</a>
      </div>
  </div>
</section>
`;
  blogSection.innerHTML = html;
  getReview(blogResult);
};
