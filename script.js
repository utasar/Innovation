// TMDB API Configuration
// Note: This API key is publicly visible in client-side code. TMDB's free tier is designed
// for this use case. For production applications with higher usage, consider using a backend
// proxy to protect your API key. Get your own key at: https://www.themoviedb.org/settings/api
const API_KEY = "04c35731a5ee918f014970082a0088b1";
const APIURL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&page=1`;
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI = `https://api.themoviedb.org/3/search/movie?&api_key=${API_KEY}&query=`;
const GENRE_API = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`;
const TRENDING_API = `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`;
const TOP_RATED_API = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}`;

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");

// User Preference and History Management
class UserPreferenceManager {
    constructor() {
        this.preferences = this.loadPreferences();
        this.viewHistory = this.loadViewHistory();
        this.feedbackData = this.loadFeedback();
    }

    loadPreferences() {
        const stored = localStorage.getItem('userPreferences');
        return stored ? JSON.parse(stored) : {
            favoriteGenres: [],
            dislikedGenres: [],
            favoriteActors: [],
            preferredRating: 0
        };
    }

    loadViewHistory() {
        const stored = localStorage.getItem('viewHistory');
        return stored ? JSON.parse(stored) : [];
    }

    loadFeedback() {
        const stored = localStorage.getItem('feedbackData');
        return stored ? JSON.parse(stored) : { liked: [], disliked: [] };
    }

    savePreferences() {
        localStorage.setItem('userPreferences', JSON.stringify(this.preferences));
    }

    saveViewHistory() {
        localStorage.setItem('viewHistory', JSON.stringify(this.viewHistory));
    }

    saveFeedback() {
        localStorage.setItem('feedbackData', JSON.stringify(this.feedbackData));
    }

    addToHistory(movie) {
        // Add to beginning and keep only last 50
        this.viewHistory.unshift({
            id: movie.id,
            title: movie.title,
            genres: movie.genre_ids,
            rating: movie.vote_average,
            timestamp: Date.now()
        });
        this.viewHistory = this.viewHistory.slice(0, 50);
        this.saveViewHistory();
        this.updatePreferencesFromHistory();
    }

    updatePreferencesFromHistory() {
        // Analyze viewing history to update genre preferences
        const genreCounts = {};
        this.viewHistory.forEach(item => {
            if (item.genres) {
                item.genres.forEach(genreId => {
                    genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
                });
            }
        });

        // Update favorite genres based on frequency
        const sortedGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => parseInt(entry[0]));

        this.preferences.favoriteGenres = sortedGenres;
        this.savePreferences();
    }

    addFeedback(movieId, isLiked) {
        if (isLiked) {
            this.feedbackData.liked.push(movieId);
            this.feedbackData.disliked = this.feedbackData.disliked.filter(id => id !== movieId);
        } else {
            this.feedbackData.disliked.push(movieId);
            this.feedbackData.liked = this.feedbackData.liked.filter(id => id !== movieId);
        }
        this.saveFeedback();
    }

    isLiked(movieId) {
        return this.feedbackData.liked.includes(movieId);
    }

    isDisliked(movieId) {
        return this.feedbackData.disliked.includes(movieId);
    }
}

// AI-Powered Recommendation Engine
class RecommendationEngine {
    constructor(userManager) {
        this.userManager = userManager;
        this.genres = [];
        this.loadGenres();
    }

    async loadGenres() {
        try {
            const resp = await fetch(GENRE_API);
            const data = await resp.json();
            this.genres = data.genres || [];
        } catch (error) {
            console.error('Error loading genres:', error);
        }
    }

    getGenreName(genreId) {
        const genre = this.genres.find(g => g.id === genreId);
        return genre ? genre.name : '';
    }

    // Content-based filtering
    calculateMovieScore(movie) {
        let score = 0;
        const prefs = this.userManager.preferences;
        const feedback = this.userManager.feedbackData;

        // Bonus for liked movies
        if (feedback.liked.includes(movie.id)) {
            score += 100;
        }

        // Penalty for disliked movies
        if (feedback.disliked.includes(movie.id)) {
            score -= 100;
            return score;
        }

        // Genre matching
        if (movie.genre_ids && prefs.favoriteGenres.length > 0) {
            const matchingGenres = movie.genre_ids.filter(g => 
                prefs.favoriteGenres.includes(g)
            ).length;
            score += matchingGenres * 20;
        }

        // Rating bonus
        score += movie.vote_average * 5;

        // Popularity factor
        score += Math.log(movie.popularity || 1) * 2;

        // Recent release bonus
        if (movie.release_date) {
            const releaseYear = new Date(movie.release_date).getFullYear();
            const currentYear = new Date().getFullYear();
            const yearDiff = currentYear - releaseYear;
            if (yearDiff <= 2) score += 10;
        }

        return score;
    }

    rankMovies(movies) {
        return movies
            .map(movie => ({
                ...movie,
                recommendationScore: this.calculateMovieScore(movie)
            }))
            .sort((a, b) => b.recommendationScore - a.recommendationScore);
    }

    async getPersonalizedRecommendations() {
        const prefs = this.userManager.preferences;
        
        if (prefs.favoriteGenres.length === 0) {
            // No preferences yet, return trending
            return this.getTrending();
        }

        // Fetch movies based on favorite genres
        const genreIds = prefs.favoriteGenres.slice(0, 3).join(',');
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreIds}&sort_by=vote_average.desc&vote_count.gte=100`;
        
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            return this.rankMovies(data.results || []);
        } catch (error) {
            console.error('Error getting recommendations:', error);
            return [];
        }
    }

    async getTrending() {
        try {
            const resp = await fetch(TRENDING_API);
            const data = await resp.json();
            return data.results || [];
        } catch (error) {
            console.error('Error getting trending:', error);
            return [];
        }
    }

    async getTopRated() {
        try {
            const resp = await fetch(TOP_RATED_API);
            const data = await resp.json();
            return data.results || [];
        } catch (error) {
            console.error('Error getting top rated:', error);
            return [];
        }
    }

    async getMoviesByGenre(genreId) {
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`;
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            return data.results || [];
        } catch (error) {
            console.error('Error getting movies by genre:', error);
            return [];
        }
    }

    async searchByActor(actorName) {
        // First, search for the actor
        const actorSearchUrl = `https://api.themoviedb.org/3/search/person?api_key=${API_KEY}&query=${encodeURIComponent(actorName)}`;
        try {
            const actorResp = await fetch(actorSearchUrl);
            const actorData = await actorResp.json();
            
            if (actorData.results && actorData.results.length > 0) {
                const actorId = actorData.results[0].id;
                
                // Get movies for this actor
                const moviesUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_cast=${actorId}&sort_by=popularity.desc`;
                const moviesResp = await fetch(moviesUrl);
                const moviesData = await moviesResp.json();
                
                return moviesData.results || [];
            }
            return [];
        } catch (error) {
            console.error('Error searching by actor:', error);
            return [];
        }
    }

    async getSimilarMovies(movieId) {
        const url = `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${API_KEY}`;
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            return data.results || [];
        } catch (error) {
            console.error('Error getting similar movies:', error);
            return [];
        }
    }

    async getMovieDetails(movieId) {
        const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits`;
        try {
            const resp = await fetch(url);
            return await resp.json();
        } catch (error) {
            console.error('Error getting movie details:', error);
            return null;
        }
    }
}

// Initialize managers
const userManager = new UserPreferenceManager();
const recommendationEngine = new RecommendationEngine(userManager);

// UI State Management
let currentView = 'personalized';
let currentGenreFilter = null;

// Initialize app
async function initApp() {
    await recommendationEngine.loadGenres();
    createGenreNavigation();
    createFilterControls();
    showPersonalizedContent();
}

initApp();

async function getMovies(url) {
    const resp = await fetch(url);
    const respData = await resp.json();
    return respData.results || [];
}

function showMovies(movies, sectionTitle = '') {
    main.innerHTML = "";

    if (sectionTitle) {
        const titleEl = document.createElement("div");
        titleEl.classList.add("section-title");
        titleEl.innerHTML = `<h2>${sectionTitle}</h2>`;
        main.appendChild(titleEl);
    }

    if (movies.length === 0) {
        main.innerHTML += '<div class="no-results">No movies found. Try adjusting your search or preferences.</div>';
        return;
    }

    const moviesContainer = document.createElement("div");
    moviesContainer.classList.add("movies-container");

    movies.forEach((movie) => {
        const { poster_path, title, vote_average, overview, id, genre_ids, release_date } = movie;

        if (!poster_path) return; // Skip movies without posters

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.dataset.movieId = id;

        // Get genre names
        const genreNames = genre_ids ? genre_ids.slice(0, 3).map(gId => 
            recommendationEngine.getGenreName(gId)
        ).filter(name => name).join(', ') : '';

        const year = release_date ? new Date(release_date).getFullYear() : '';

        const isLiked = userManager.isLiked(id);
        const isDisliked = userManager.isDisliked(id);

        movieEl.innerHTML = `
            <img
                src="${IMGPATH + poster_path}"
                alt="${title}"
                onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'"
            />
            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getClassByRate(vote_average)}">${vote_average.toFixed(1)}</span>
            </div>
            <div class="overview">
                <h3>Overview</h3>
                <p>${overview || 'No overview available.'}</p>
                ${genreNames ? `<p class="genres"><strong>Genres:</strong> ${genreNames}</p>` : ''}
                ${year ? `<p class="year"><strong>Year:</strong> ${year}</p>` : ''}
                <div class="movie-actions">
                    <button class="btn-details" onclick="showMovieDetails(${id})">More Details</button>
                    <button class="btn-similar" onclick="showSimilarMovies(${id})">Similar Movies</button>
                    <div class="feedback-buttons">
                        <button class="btn-like ${isLiked ? 'active' : ''}" onclick="handleFeedback(${id}, true)">
                            <span class="icon">👍</span>
                        </button>
                        <button class="btn-dislike ${isDisliked ? 'active' : ''}" onclick="handleFeedback(${id}, false)">
                            <span class="icon">👎</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Track view when clicked
        movieEl.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                userManager.addToHistory(movie);
            }
        });

        moviesContainer.appendChild(movieEl);
    });

    main.appendChild(moviesContainer);
}

function getClassByRate(vote) {
    if (vote >= 8) {
        return "green";
    } else if (vote >= 5) {
        return "orange";
    } else {
        return "red";
    }
}

// Genre Navigation
async function createGenreNavigation() {
    const header = document.querySelector('header');
    const genreNav = document.createElement('div');
    genreNav.classList.add('genre-nav');
    genreNav.id = 'genre-nav';
    
    const navContent = `
        <button class="nav-btn" onclick="showPersonalizedContent()">For You</button>
        <button class="nav-btn" onclick="showTrending()">Trending</button>
        <button class="nav-btn" onclick="showTopRated()">Top Rated</button>
        <div class="genre-dropdown">
            <button class="nav-btn dropdown-toggle">Genres ▼</button>
            <div class="genre-list" id="genre-list"></div>
        </div>
        <button class="nav-btn" onclick="togglePreferences()">Settings</button>
    `;
    
    genreNav.innerHTML = navContent;
    header.insertBefore(genreNav, header.firstChild);

    // Wait for genres to load, then populate list
    await waitForGenres();
    populateGenreList();
}

async function waitForGenres() {
    // Wait for genres to be loaded with a maximum timeout
    const maxAttempts = 10;
    let attempts = 0;
    while (recommendationEngine.genres.length === 0 && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
    }
}

function populateGenreList() {
    const genreList = document.getElementById('genre-list');
    if (genreList && recommendationEngine.genres.length > 0) {
        recommendationEngine.genres.forEach(genre => {
            const genreBtn = document.createElement('button');
            genreBtn.classList.add('genre-item');
            genreBtn.textContent = genre.name;
            genreBtn.onclick = () => showMoviesByGenre(genre.id, genre.name);
            genreList.appendChild(genreBtn);
        });
    }
}

// Filter Controls
function createFilterControls() {
    const header = document.querySelector('header');
    const filterDiv = document.createElement('div');
    filterDiv.classList.add('filter-controls');
    filterDiv.id = 'filter-controls';
    filterDiv.style.display = 'none';
    
    filterDiv.innerHTML = `
        <div class="filter-group">
            <label>Search by Actor:</label>
            <input type="text" id="actor-search" placeholder="Enter actor name">
            <button onclick="searchByActorHandler()">Search</button>
        </div>
    `;
    
    header.appendChild(filterDiv);
}

// Event Handlers
async function showPersonalizedContent() {
    currentView = 'personalized';
    const recommendations = await recommendationEngine.getPersonalizedRecommendations();
    showMovies(recommendations, '🎬 Recommended For You');
}

async function showTrending() {
    currentView = 'trending';
    const trending = await recommendationEngine.getTrending();
    showMovies(trending, '🔥 Trending This Week');
}

async function showTopRated() {
    currentView = 'top-rated';
    const topRated = await recommendationEngine.getTopRated();
    showMovies(topRated, '⭐ Top Rated Movies');
}

async function showMoviesByGenre(genreId, genreName) {
    currentView = 'genre';
    currentGenreFilter = genreId;
    const movies = await recommendationEngine.getMoviesByGenre(genreId);
    showMovies(movies, `${genreName} Movies`);
}

async function searchByActorHandler() {
    const actorInput = document.getElementById('actor-search');
    const actorName = actorInput.value.trim();
    
    if (actorName) {
        currentView = 'actor';
        const movies = await recommendationEngine.searchByActor(actorName);
        showMovies(movies, `Movies featuring ${actorName}`);
    }
}

async function showSimilarMovies(movieId) {
    const similar = await recommendationEngine.getSimilarMovies(movieId);
    showMovies(similar, '🎯 Similar Movies');
}

async function showMovieDetails(movieId) {
    const details = await recommendationEngine.getMovieDetails(movieId);
    if (!details) return;

    // Create modal
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    // Get trailer
    const trailer = details.videos && details.videos.results ? 
        details.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') : null;

    // Get cast
    const cast = details.credits && details.credits.cast ? 
        details.credits.cast.slice(0, 5).map(c => c.name).join(', ') : 'Not available';

    const modalContent = `
        <div class="modal-content">
            <span class="close-modal" onclick="this.closest('.modal').remove()">&times;</span>
            <h2>${details.title} (${details.release_date ? new Date(details.release_date).getFullYear() : 'N/A'})</h2>
            <div class="modal-body">
                <img src="${IMGPATH + details.poster_path}" alt="${details.title}" class="modal-poster" />
                <div class="modal-info">
                    <p><strong>Rating:</strong> ⭐ ${details.vote_average ? details.vote_average.toFixed(1) : 'N/A'}/10 (${details.vote_count || 0} votes)</p>
                    <p><strong>Runtime:</strong> ${details.runtime || 'N/A'} minutes</p>
                    <p><strong>Genres:</strong> ${details.genres ? details.genres.map(g => g.name).join(', ') : 'N/A'}</p>
                    <p><strong>Cast:</strong> ${cast}</p>
                    <p><strong>Overview:</strong> ${details.overview || 'No overview available.'}</p>
                    ${trailer ? `
                        <div class="trailer-section">
                            <h3>Watch Trailer</h3>
                            <a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank" class="trailer-link">
                                🎬 Watch on YouTube
                            </a>
                        </div>
                    ` : ''}
                    <div class="legal-notice">
                        <p><strong>⚖️ Legal Notice:</strong> This is a recommendation service only. We do not host or distribute copyrighted content. Please use legal streaming services to watch movies.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
}

function handleFeedback(movieId, isLiked) {
    userManager.addFeedback(movieId, isLiked);
    
    // Update UI
    const movieEl = document.querySelector(`[data-movie-id="${movieId}"]`);
    if (movieEl) {
        const likeBtn = movieEl.querySelector('.btn-like');
        const dislikeBtn = movieEl.querySelector('.btn-dislike');
        
        if (isLiked) {
            likeBtn.classList.add('active');
            dislikeBtn.classList.remove('active');
        } else {
            dislikeBtn.classList.add('active');
            likeBtn.classList.remove('active');
        }
    }

    // Show feedback message
    showNotification(isLiked ? 'Added to favorites! 👍' : 'Noted. We\'ll recommend less like this. 👎');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function togglePreferences() {
    const filterControls = document.getElementById('filter-controls');
    if (filterControls.style.display === 'none') {
        filterControls.style.display = 'block';
    } else {
        filterControls.style.display = 'none';
    }
}

// Search form handler
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const searchTerm = search.value.trim();

    if (searchTerm) {
        currentView = 'search';
        const movies = await getMovies(SEARCHAPI + searchTerm);
        showMovies(movies, `Search Results for "${searchTerm}"`);
        search.value = "";
    }
});