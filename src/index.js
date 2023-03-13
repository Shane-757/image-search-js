import axios from "axios";
import Notiflix from "notiflix";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css"

const API_KEY = '34086149-ce97166a0a74463c53bfd7508';
const BASE_URL = 'https://pixabay.com/api/';
const PER_PAGE = 40;

let currentPage = 1;
let currentQuery = '';
let totalHits = 0;
let imageLinks = [];

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

loadMoreBtn.style.display = 'none';
searchForm.addEventListener('submit', onSubmitSearchForm);
loadMoreBtn.addEventListener('click', onLoadMore);

function onSubmitSearchForm(event) {
  imageLinks = [];
  event.preventDefault();
  currentPage = 1;
  currentQuery = event.target.searchQuery.value.trim();
    gallery.innerHTML = '';
    loadMoreBtn.style.display = 'none'; 
  searchImages();
}

async function searchImages() { 
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: currentQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: PER_PAGE,
      },
    });
    const data = response.data;
    
    if (data.hits.length > 0) {
      totalHits = data.totalHits;

      const fragment = document.createDocumentFragment();

      data.hits.forEach((hit) => {
        const photoCard = createPhotoCard(hit);
        fragment.appendChild(photoCard);
      });

      gallery.appendChild(fragment);

      if (currentPage === 1) {
        loadMoreBtn.style.display = 'block';
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      } else {
        Notiflix.Notify.success(`We found ${totalHits} images in total.`);
      }

      if (currentPage === 13 || data.hits.length < PER_PAGE) {
        loadMoreBtn.style.display = 'none';
         Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      } else {
        loadMoreBtn.style.display = 'block'; 
      }
      const newLightbox = new SimpleLightbox(imageLinks, { captionsData: 'data-lb-caption' });
      //newLightbox.refresh();

      const { height: cardHeight } = document
      .querySelector(".gallery")
      .firstElementChild.getBoundingClientRect();
      window.scrollBy({ top: cardHeight * 4, behavior: 'smooth' }); 
      
    } else {
      Notiflix.Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
  } catch (error) {
    Notiflix.Notify.failure('Something went wrong. Please try again later.');
    console.error(error);
  }
}

function onLoadMore() {
  currentPage += 1;
  searchImages();
}

function createPhotoCard(hit) {
  const photoCard = document.createElement('div');
  photoCard.classList.add('photo-card');

  const link = document.createElement('a');
  link.href = hit.largeImageURL;
  link.setAttribute('data-lb-caption', hit.tags);

  const img = document.createElement('img');
  img.src = hit.webformatURL;
  img.alt = hit.tags;
  img.loading = 'lazy';
  img.width = 400;
  img.height = 240;

   link.appendChild(img);
  photoCard.appendChild(link);

  const info = document.createElement('div');
  info.classList.add('info');

  const likes = document.createElement('p');
  likes.classList.add('info-item');
  likes.innerHTML = `<b>Likes</b>${hit.likes}`;
  info.appendChild(likes);

  const views = document.createElement('p');
  views.classList.add('info-item');
  views.innerHTML = `<b>Views</b>${hit.views}`;
  info.appendChild(views);

  const comments = document.createElement('p');
  comments.classList.add('info-item');
  comments.innerHTML = `<b>Comments</b>${hit.comments}`;
  info.appendChild(comments);

  const downloads = document.createElement('p');
  downloads.classList.add('info-item');
  downloads.innerHTML = `<b>Downloads</b>${hit.downloads}`;
  info.appendChild(downloads);

  photoCard.appendChild(info);

  imageLinks.push(link);

  return photoCard;
}