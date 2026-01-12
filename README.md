# AI Movie Recommender

An intelligent, AI-powered movie recommendation system that provides personalized content discovery based on user preferences, viewing history, and feedback.

![AI Movie Recommender](https://github.com/user-attachments/assets/5502e57f-12c0-47ef-99b6-c94393b98ee7)

## Features

###  AI-Powered Recommendations
- **Content-Based Filtering**: Sophisticated algorithm that analyzes movie attributes
- **Personalized Scoring**: Ranks movies based on genre preferences, ratings, popularity, and recency
- **Adaptive Learning**: System learns from user interactions and improves over time
- **Smart Suggestions**: Automatically detects favorite genres from viewing history

### Content Discovery
- **For You**: Personalized recommendations based on your unique taste
- **Trending**: Weekly trending movies from around the world
- **Top Rated**: Highest-rated movies across all genres
- **Genre Filtering**: Browse by specific genres (Action, Comedy, Drama, etc.)
- **Actor Search**: Find top movies featuring your favorite actors
- **Similar Movies**: Discover related content based on any movie

###  Interactive User Experience
- **Modern UI**: Beautiful gradient design with smooth animations
- **Detailed Movie Information**: 
  - High-quality posters
  - IMDb-style ratings
  - Cast information
  - Release year and runtime
  - Genre tags
  - Plot overview
  - YouTube trailer links
- **Smart Search**: Real-time movie search with instant results
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Feedback System
- **Like/Dislike**: Simple feedback mechanism for each movie
- **Visual Indicators**: Active states show your preferences
- **Real-time Updates**: Recommendations improve instantly with your feedback
- **Toast Notifications**: Friendly confirmations for user actions

###  Legal Compliance
- **Recommendation Only**: We don't host or distribute copyrighted content
- **Clear Disclaimers**: Legal notices in footer and modals
- **Official Links**: Trailers link to official YouTube videos
- **TMDB Attribution**: Proper credit to The Movie Database API

##  Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for API calls)

### Installation
1. Clone the repository:
```bash
git clone https://github.com/utasar/Innovation.git
cd Innovation
```

2. Open `index.html` in your web browser or serve with a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

3. Navigate to `http://localhost:8000` in your browser

### No Build Required!
This is a pure JavaScript application with no dependencies or build steps needed.

## Usage

### First Time User
1. **Browse Content**: Start by exploring "Trending" or "Top Rated" movies
2. **Provide Feedback**: Click 👍 or 👎 on movies you like or dislike
3. **View Details**: Click on a movie card to see full details and trailers
4. **Watch Preferences Develop**: The "For You" section improves as you interact

### Advanced Features
- **Genre Filtering**: Click "Genres ▼" to browse by specific genre
- **Actor Search**: Click "Settings" to search for movies by actor name
- **Similar Movies**: Click "Similar Movies" in any movie overview for recommendations
- **Search**: Use the search bar to find specific titles

##  Architecture

### Core Components

#### UserPreferenceManager
Manages all user data with localStorage persistence:
- Tracks viewing history (last 50 movies)
- Stores genre preferences
- Records like/dislike feedback
- Auto-learns from user behavior

#### RecommendationEngine
AI-powered content recommendation system:
- **Content-Based Filtering**: Analyzes movie attributes
- **Scoring Algorithm**: 
  - +100 points for liked movies
  - -100 points for disliked movies
  - +20 points per matching genre
  - +5 points × rating (0-10)
  - +2 points × log(popularity)
  - +10 points for recent releases (≤2 years)

#### UI Components
- Dynamic genre navigation
- Modal dialogs for detailed views
- Toast notifications
- Responsive movie cards
- Filter controls

### Data Flow
```
User Interaction → Feedback Storage → Preference Update → 
Algorithm Scoring → Ranked Results → Display
```

##  Technical Details

### Technologies
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with animations, flexbox, gradients
- **JavaScript (ES6+)**: Classes, async/await, modules
- **LocalStorage**: Client-side persistence
- **TMDB API**: Movie data source

### API Integration
Uses The Movie Database (TMDB) API for:
- Movie discovery
- Search functionality
- Genre listings
- Trending content
- Movie details
- Cast information
- Trailer videos

### Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive support

##  Customization

### Styling
Edit `style.css` to customize:
- Color scheme (current: purple/blue gradients)
- Layout spacing
- Animation speeds
- Responsive breakpoints

### Recommendation Algorithm
Modify `RecommendationEngine.calculateMovieScore()` in `script.js` to adjust:
- Genre weight (default: 20 points)
- Rating multiplier (default: 5x)
- Popularity factor (default: 2x log)
- Recency bonus (default: 10 points)

### API Configuration
This application uses The Movie Database (TMDB) API. To use your own API key:

1. **Get a TMDB API Key**:
   - Visit [The Movie Database](https://www.themoviedb.org/)
   - Create a free account
   - Go to Settings → API
   - Request an API key (choose "Developer" option)
   - Copy your API key

2. **Update the code**:
   - Open `script.js`
   - Find line 1: `const API_KEY = "..."`
   - Replace with your API key: `const API_KEY = "your_tmdb_api_key";`

**Note**: The included API key is a publicly available demo key. For production use, consider implementing a backend proxy to protect your API key from unauthorized use.

##  Data Privacy

### What We Store
- **Local Only**: All data stored in browser's localStorage
- **No Server**: No data transmitted to any backend
- **User Control**: Clear browser data to reset preferences

### What We Don't Store
- Personal information
- Login credentials
- Payment information
- Location data

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request




##  Acknowledgments

- **The Movie Database (TMDB)**: For providing the comprehensive movie API
- **Google Fonts**: For the Poppins font family
- **Open Source Community**: For inspiration and best practices

##  Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation

##  Future Enhancements

Potential features for future versions:
- Music and TV show recommendations
- Multi-language support
- Social sharing features
- Watchlist functionality
- User profiles
- Advanced filtering (year, runtime, etc.)
- Integration with streaming availability APIs
- Machine learning model improvements

---

**Made with  for movie lovers everywhere**

