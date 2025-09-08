/**
 * @typedef {import('./functions.js').FullInfoMovies} FullInfoMovies
 * @typedef {import('./functions.js').MoviesSearch} MoviesSearch
 * @typedef {import('./functions.js').MovieDescriptions} MovieDescriptions
 * @typedef {import('./functions.js').Movies} Movies
 */

import {scrollBtnToggle, renderMessage, getMovieHtml, getMoviesInWatchlistFromLocalStorage} from './functions.js'

const movieSearchForm = document.getElementById('movies-search-form')
const moviesSection = document.getElementById('movies-section')
const scrollToTopBtn = document.getElementById('scroll-to-top-btn')

/** @type {FullInfoMovies} */
let moviesInWatchlist = getMoviesInWatchlistFromLocalStorage()

/** @type {MoviesSearch} */
let nextPageMovieSearch;

/** @type {MovieDescriptions} */
let movieDescriptions = []

let maxPages = 1
let isErrorRenderMovies = false

window.addEventListener('scroll', ()=>{
    scrollBtnToggle(scrollToTopBtn)
})

window.addEventListener('storage', ()=>{
    const disabledBtns = document.querySelectorAll('button.modify-watchlist[disabled]')
    moviesInWatchlist = getMoviesInWatchlistFromLocalStorage()
    disabledBtns.forEach(disabledBtn=>{
        if(moviesInWatchlist.filter(movie=>movie.id === disabledBtn.dataset.id).length === 0){
            disabledBtn.disabled = false
        }
    })
})

document.addEventListener('click', e=>{
    if(e.target.classList.contains('read-more')){
        renderFullMovieDescription(e.target.dataset.id)
    }
    
    else if(e.target.classList.contains('show-less')){
        renderPartOfMovieDescription(e.target.dataset.id)
    }

    else if(e.target.classList.contains('modify-watchlist')){
        addMovieToWatchList(e.target.dataset.id)
    }

    else if(e.target.parentNode.classList.contains('modify-watchlist')){
        addMovieToWatchList(e.target.parentNode.dataset.id)
    }

    else if(e.target.id === 'show-more-movies-btn'){
        const showMoreMoviesBtn = document.getElementById(e.target.id)
        removeButton(showMoreMoviesBtn)

        getSearchResults(nextPageMovieSearch)
            .then(data => {
                if(!data.Error){
                    nextPageMovieSearch.page += 1
                    renderMoreMovies(data.Search)
                }
            })
    }

    else if(e.target.parentNode.id === 'scroll-to-top-btn' || e.target.id === 'scroll-to-top-btn'){
        window.scroll({
            top: 0,
            behavior: "smooth"
        })
    }
})

/**
 * Renders the full movie description for the movie that has the inputed imdbID to the page.
 * 
 * @param {String} id The imdbID for the movie
 */
function renderFullMovieDescription(id){
    const descriptionEl = getDescriptionEl(id)
    const fullDescription = movieDescriptions.filter(movieDescription => movieDescription.id === id)[0].description
    descriptionEl.innerHTML = `${fullDescription} <button class="modify-txt-btn show-less" data-id=${id}>Show less</button>`
}

/**
 * Renders the first 132 characters of the movie description that has the inputed imdbID to the page.
 * 
 * @param {String} id The imdbID for the movie
 */
function renderPartOfMovieDescription(id){
    const descriptionEl = getDescriptionEl(id)
    const condensedDescription = descriptionEl.textContent.slice(0, 132)
    descriptionEl.innerHTML = `${condensedDescription}... <button class="modify-txt-btn read-more" data-id=${id}>Read more</button>`
}

/**
 * Gets the DOM element for the movie with the inputted imdbID.
 * 
 * @param {String} id The imdbID for the movie
 * @returns {?Element}
 */
function getDescriptionEl(id){
    return document.querySelector(`article[data-id="${id}"]>.movie-description`)
}

/**
 * Adds the movie to localStorage at the key of 'moviesInWatchList' to add the movie to the
 * users watchlist.
 * 
 * @param {String} movieId 
 */
function addMovieToWatchList(movieId){
    const article = document.querySelector(`article[data-id="${movieId}"]`)
    const movieObj = {
        id: movieId,
        img: article.querySelector('img.movie-img') ? article.querySelector('img.movie-img').src : 'N/A',
        title: article.querySelector('.movie-title').textContent,
        rating: article.querySelector('.movie-rating>p').textContent,
        runtime: article.querySelector('.movie-runtime').textContent,
        category: article.querySelector('.movie-category').textContent,
        description: movieDescriptions.filter(movie=>movie.id===`${movieId}`)[0].description
    }

    moviesInWatchlist.push(movieObj)
    localStorage.setItem('moviesInWatchlist', JSON.stringify(moviesInWatchlist))
    article.querySelector('button.modify-watchlist').disabled = true
}

/**
 * Renders more movies to the HTML page and removes the show more results button if it reaches the maximum amount of pages
 * for the search.
 * 
 * @param {Element} btn The button DOM element that triggered the event
 * @param {Movies} moviesArr Movies returned from the OMDb API when searched by movie title at a specific page
 */
function renderMoreMovies(moviesArr){
    getMoviesHtml(moviesArr)
        .then(moviesHtml=>{
            if(nextPageMovieSearch.page <= maxPages && !isErrorRenderMovies){
                moviesHtml += getShowMoreBtnHtml()
            }
            
            moviesSection.children[0].innerHTML += moviesHtml
        })
}

/**
 * Removes a inputted button from the HTML page.
 * 
 * @param {Element} btn The button DOM element to remove
 */
function removeButton(btn){
    btn.remove(btn)
}

movieSearchForm.addEventListener('submit', searchForMovies)

/**
 * Function to search for movies by movie title from the OMDb API.
 * 
 * @param {Event} e 
 */
function searchForMovies(e){
    e.preventDefault()

    isErrorRenderMovies = false

    const movieSearchFormData = new FormData(movieSearchForm)
    const movieTitleSearched = movieSearchFormData.get('movie-title-searched')

    getSearchResults({
        titleSearched: movieTitleSearched,
        page: 1
    })
        .then(data=>{
            movieDescriptions = []
            if(data.Error === 'Movie not found!'){
                renderMessage(moviesSection, '<p>Unable to find what you\'re looking for. Please try another search.</p>')
            }
            else if(data.Error){
                renderMessage(moviesSection, `<p>Error: ${data.Error}</p>`)
            }
            else if(Number(data.totalResults) > 10){
                maxPages = Math.ceil(data.totalResults / 10)
                nextPageMovieSearch = {
                    titleSearched: String(movieTitleSearched),
                    page: 2
                }

                renderFirstMovies(data.Search)
                    .then(()=>{
                        if(moviesSection.children[0].innerText !== 'Error: Can not get movies at the moment.'
                            && nextPageMovieSearch.page !== 1
                        ){
                            moviesSection.children[0].innerHTML += getShowMoreBtnHtml()
                        }
                    })
            }
            else{
                nextPageMovieSearch = null
                maxPages = 1
                renderFirstMovies(data.Search)
            }
        })

    movieSearchForm.reset()
}

/**
 * Searches for movies by movie title at a certain page in the OMDb API.
 * 
 * @param {MoviesSearch} searchObj Object that defines what movie title to search for in the OMDb API
 * and at the page number it should return.
 * 
 * @returns {Promise} A Promise for the completion of fetching the data from the OMDb API with the data
 */
function getSearchResults(searchObj){
    return fetch(`/.netlify/functions/script/?s=${searchObj.titleSearched}&page=${searchObj.page}`)
        .then(response => {
            if(response.ok){
                return response.json()
            }
            else {
                return{
                    Error: "Could not get movies at the moment."
                }
            }
        })
}


/**
 * Renders the first movies that the search results by movie title from OMDb API return to the page
 * 
 * @param {Movies} moviesArr The data from OMDb API
 * @returns {Promise<void>} A Promise for the completion of rendering all the movies in `moviesArr` with no return value
 */
function renderFirstMovies(moviesArr){
    moviesSection.innerHTML = ''
    const div = document.createElement('div')
    div.classList.add('container', 'movies-container')

    const promise = getMoviesHtml(moviesArr)

    return promise.then(moviesHtml=>{
        if(moviesHtml === ''){
            renderMessage(moviesSection, "<p>Error: Can not get movies at the moment.</p>")
        }

        else{
            div.innerHTML = moviesHtml
            moviesSection.append(div)
        }
    })
}

/**
 * Gets the HTML code for all the movies in the given array.
 * 
 * @param {Movies} moviesArr The data from OMDb API
 * @returns {Promise<String>} A Promise for the completion of fetching all the movies in `moviesArr` with the HTML code
*/
function getMoviesHtml(moviesArr){
    let moviesHtml = ''
    const allPromises = moviesArr.map((movie)=>{
        return fetch(`/.netlify/functions/script/?i=${movie.imdbID}`)
        .then(response=>{
            if(response.ok){
                return response.json()
            }
            else{
                throw "Could not get movies at the moment."
            }
        })
        .then(movieData=>{
            const id = movieData.imdbID
            if(movieDescriptions.filter(movieDescription=>movieDescription.id===id).length===0){
                movieDescriptions.push({
                    id: id,
                    description: movieData.Plot
                })

                const modifyWatchListBtn = moviesInWatchlist.filter(movie=>movie.id===id).length===0 ?
                    `<button class="modify-watchlist" data-id=${id}>
                        <i class="fa-solid fa-circle-plus"></i>
                        <p>Watchlist</p>
                    </button>` :
                    `<button class="modify-watchlist" data-id=${id} disabled>
                        <i class="fa-solid fa-circle-plus"></i>
                        <p>Watchlist</p>
                    </button>`

                moviesHtml += getMovieHtml(
                    movieData.Poster, id, movieData.Title, movieData.imdbRating,
                    movieData.Runtime, movieData.Genre, movieData.Plot, modifyWatchListBtn
                )
            }
        })
        .catch(()=>{
            moviesHtml = moviesHtml
            if(nextPageMovieSearch.page === 2){
                nextPageMovieSearch.page = 1
            }
            else{
                isErrorRenderMovies = true
            }
        })
    })

    return Promise.all(allPromises).then(()=>moviesHtml)
}

/**
 * Gets the HTML code for the show more button.
 * 
 * @returns {String} HTML code for the show more button
 */
function getShowMoreBtnHtml(){
    return `
        <button class="show-more-btn" id="show-more-movies-btn">Show more results</button>
    `
}