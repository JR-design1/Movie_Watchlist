/** Functions used in both index.js and watchlist.js */

/**
 * Type definitions
 * 
 * @typedef {Array<{Title:String, Year:String, imdbId:String, Type:String, Poster:String}>} Movies
 * 
 * @typedef {?{titleSearched:String, page:Number}} MoviesSearch
 * 
 * @typedef {Array<{id:Number, description:String}>} MovieDescriptions
 * 
 * @typedef {{category:String, description:String, id:String, img:String, rating:String, runtime:String, title:String}
 * } FullInfoMovie
 * 
 * @typedef {FullInfoMovie[]} FullInfoMovies
 */

/**
 * Renders a message to the page when the OMDb API returns an error code
 * or the users watchlist is empty.
 * 
 * @param {Element} element The element you are inserting the message at
 * @param {String} html The HTML code you are inserting at the element
 */
export function renderMessage(element, html){
    element.innerHTML = `
        <div class="container no-movies-container">
            ${html}
        </div>
    `
}

/**
 * Adds the scroll to top button if the page is scrolled down and removes it
 * when the page is scrolled back to the top.
 * 
 * @param {Element} scrollToTopBtn The button DOM element that scrolls to the top of the page
 * @returns {Boolean} Tells if the animation was canceled or not
 */
export function scrollBtnToggle(scrollToTopBtn){
    if(window.scrollY > 0 && scrollToTopBtn.classList.contains('hidden')){
        scrollToTopBtn.classList.remove('hidden')
    }

    else if(window.scrollY > 0 && scrollToTopBtn.classList.contains('animation-fade-out')){
        scrollToTopBtn.classList.remove('animation-fade-out')
    }

    else if(window.scrollY <= 0 && !scrollToTopBtn.classList.contains('hidden')
    && !scrollToTopBtn.classList.contains('animation-fade-out')){
        scrollToTopBtn.classList.add('animation-fade-out')

        scrollToTopBtn.addEventListener('animationend', ()=>{
            if(window.scrollY <= 0){
                scrollToTopBtn.classList.remove('animation-fade-out')
                scrollToTopBtn.classList.add('hidden')
            }
        }, {once: true})
    }
}

/**
 * Gets the HTML code for a movie.
 * 
 * @param {String} img The URL for the poster image
 * @param {String} id The imdbID
 * @param {String} title The movie title
 * @param {String} rating The movie rating
 * @param {String} runtime The movie runtime
 * @param {String} category The movie genre
 * @param {String} description The description of the plot for the movies
 * @param {String} modifyWatchListBtn The HTML code for the button
 * @returns {String} HTML code for the movie
 */
export function getMovieHtml(img, id, title, rating, runtime, category, description, modifyWatchListBtn){
    const movieDescriptionHtml = description.length > 132 ? 
                    `${description.slice(0, 132)}... <button class="modify-txt-btn read-more" data-id=${id}>Read more</button>`:
                    description;

    const movieImgHtml = img === 'N/A' ?
                    `<div class="movie-img"></div>` :
                    `<img class="movie-img" src=${img}>`

    return `
        <article class="movie-article" data-id=${id}>
            ${movieImgHtml}
            <div class="movie-title-container">
                <h2 class="movie-title">${title}</h2>
                <div class="movie-rating">
                    <i class="fa-solid fa-star"></i>
                    <p>${rating}</p>
                </div>
            </div>
            <p class="movie-runtime">${runtime}</p>
            <p class="movie-category">${category}</p>
            ${modifyWatchListBtn}
            <p class="movie-description">
                ${movieDescriptionHtml}
            </p>
        </article>

        <hr>
    `
}

/**
 * Function to handle if a user uploads to localStorage from the browser console at the
 * moviesInWatchlist key in the incorrect format.
 * 
 * @returns {FullInfoMovie[]}
 */
export function getMoviesInWatchlistFromLocalStorage(){
    // Movie in watchlist should be a string in JSON format that is why I used a try catch block here.
    try{
        const moviesInWatchlist = JSON.parse(localStorage.getItem('moviesInWatchlist'))
        if(Array.isArray(moviesInWatchlist)){
            moviesInWatchlist.forEach((movie, i)=>{
                if (!(typeof movie === 'object' && 'category' in movie && 'description' in movie && 'id' in movie
                    && 'img' in movie && 'rating' in movie && 'runtime' in movie && 'title' in movie
                )){
                    moviesInWatchlist.splice(i, 1)
                }
            })

            localStorage.setItem('moviesInWatchlist', JSON.stringify(moviesInWatchlist))
            return moviesInWatchlist
        }

        else{
            localStorage.clear()
            return []
        }
    }

    catch{
        localStorage.clear()
        return []
    }
}