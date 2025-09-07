import { getMoviesInWatchlistFromLocalStorage, getMovieHtml, renderMessage, scrollBtnToggle } from "./functions.js"

const moviesSection = document.getElementById('movies-section')
const scrollToTopBtn = document.getElementById("scroll-to-top-btn")

/** @type {import("./functions.js").FullInfoMovies} */
let moviesInWatchlist = getMoviesInWatchlistFromLocalStorage()

renderMovieSectionContents()

window.addEventListener('scroll', ()=>{
    scrollBtnToggle(scrollToTopBtn)
})

window.addEventListener('storage', ()=>{
    moviesInWatchlist = getMoviesInWatchlistFromLocalStorage()
    renderMovieSectionContents()
})

document.addEventListener('click', (e)=>{
    if(e.target.classList.contains('read-more')){
        showFullMovieDescription(e.target.dataset.id)
    }
    
    else if(e.target.classList.contains('show-less')){
        showPartialMovieDescription(e.target.dataset.id)
    }
    
    else if(e.target.classList.contains('modify-watchlist')){
        removeFromWatchlist(e.target.dataset.id);
    }
    
    else if(e.target.parentElement.classList.contains('modify-watchlist')){
        removeFromWatchlist(e.target.parentElement.dataset.id);
    }

    else if(e.target.parentElement.id === 'scroll-to-top-btn' || e.target.id === 'scroll-to-top-btn'){
        window.scroll({
            top: 0,
            behavior: "smooth"
        })
    }
})

/**
 * Renders the full movie description to the page, and gives the user the option to show the partial description again.
 * 
 * @param {String} id The id of the movie that triggered the event
*/
function showFullMovieDescription(id){
    const descriptionEl = getDescriptionEl(id)
    const movieDescription = moviesInWatchlist.filter(movie=>movie.id===id)[0].description
    const movieDescriptionHtml = `${movieDescription} <button class="modify-txt-btn show-less" data-id=${id}>Show less</button>`
    descriptionEl.innerHTML = movieDescriptionHtml
}

/**
 * Renders the partial movie description to the page, and gives the user the option to show the full description again.
 * 
 * @param {String} id The id of the movie that triggered the event 
*/
function showPartialMovieDescription(id){
    const descriptionEl = getDescriptionEl(id)
    const movieDescriptionHtml = `
    ${descriptionEl.textContent.slice(0, 132)}... <button class="modify-txt-btn read-more" data-id=${id}>Read more</button>
    `
    descriptionEl.innerHTML = movieDescriptionHtml
}

/**
 * Gets the DOM element for the movie description that has the id of `id`.
 * 
 * @param {String} id The id of the movie that triggered the event 
 * @returns {Element} The DOM element that stores the movie description and Read more/Show less button
*/
function getDescriptionEl(id){
    return moviesSection.children[0].querySelector(`article[data-id=${id}]>.movie-description`)
}

/**
 * Removes the item with the inputted `id` from localStorage and rerenders the movies section.
 * 
 * @param {String} id The id of the movie that triggered the event
 */
function removeFromWatchlist(id){
    moviesInWatchlist = moviesInWatchlist.filter(movie=>!(movie.id === id))
    localStorage.setItem('moviesInWatchlist', JSON.stringify(moviesInWatchlist))
    renderMovieSectionContents()
}

/**
 * Renders the contents inside of the movies section.
 */
function renderMovieSectionContents(){
    if(moviesInWatchlist.length>0){
        renderMovies()
    }

    else{
        renderMessage(moviesSection,
            `
            <p>Your watchlist is looking a little empty...</p>
            <a class="home-link" href="/index.html">
                <i class="fa-solid fa-circle-plus"></i>
                <p>Let's add some movies!</p>
            </a>
            `)
    }
}

/**
 * Renders movies from watchlist to the page.
*/
function renderMovies(){
    moviesSection.innerHTML = ''
    const div = document.createElement('div')
    div.classList.add('container', 'movies-container')
    
    const moviesHtml = moviesInWatchlist.map((movieInWatchList)=>{
        const modifyWatchListBtn = `
        <button class="modify-watchlist" data-id=${movieInWatchList.id}>
        <i class="fa-solid fa-circle-minus"></i>
        <p>Watchlist</p>
        </button>`
        return getMovieHtml(movieInWatchList.img, movieInWatchList.id, movieInWatchList.title,
            movieInWatchList.rating, movieInWatchList.runtime, movieInWatchList.category,
            movieInWatchList.description, modifyWatchListBtn
        )
    }).join('')
    
    div.innerHTML = moviesHtml
    moviesSection.append(div)
}