const apiKey = 'd80812d8-bad6-466e-b6ac-a5153e531aa7';

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');
const favoriteWords = document.getElementById('favorite-words');
const historyEntries = document.getElementById('history-entries');
const clearHistoryButton = document.getElementById('clear-history');
const suggestionsList = document.getElementById('suggestions');
const toggleFavoritesButton = document.getElementById('toggle-favorites');
const toggleHistoryButton = document.getElementById('toggle-history');

searchButton.addEventListener('click', searchDictionary);
searchInput.addEventListener('input', handleInput);

// Favorite words array
let favorites = [];

// Search history array
let searchHistory = [];

// Load favorites and search history from local storage
loadFavorites();
loadSearchHistory();

function searchDictionary() {
  const word = searchInput.value.trim();
  if (word !== '') {
    fetch(`https://dictionaryapi.com/api/v3/references/sd4/json/${word}?key=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        displayResults(data);
        addToSearchHistory(word);
      })
      .catch(error => {
        console.log('Error:', error);
      });
  }
}

function displayResults(data) {
  searchResults.innerHTML = '';

  if (Array.isArray(data)) {
    data.forEach(entry => {
      const word = entry.hwi.hw;
      const definition = entry.fl;
      const example = entry.shortdef[0];

      const resultElement = document.createElement('div');
      resultElement.classList.add('result-entry');
      resultElement.innerHTML = `
        <div class="word">${word}</div>
        <div class="definition">${definition}</div>
        <div class="example">${example}</div>
        <button class="favorite-button" onclick="toggleFavorite('${word}')">${favorites.includes(word) ? 'Remove from Favorites' : 'Add to Favorites'}</button>
      `;

      searchResults.appendChild(resultElement);
    });
  } else {
    searchResults.innerHTML = '<div class="no-results">No results found.</div>';
  }
}

function toggleFavorite(word) {
  if (favorites.includes(word)) {
    removeFromFavorites(word);
  } else {
    addToFavorites(word);
  }
}

function addToFavorites(word) {
  if (!favorites.includes(word)) {
    favorites.push(word);
    saveFavorites();
    displayFavoriteWords();
    if (searchResults.innerHTML.includes(word)){
      const favoriteButton = searchResults.querySelector(`.favorite-button[data-word="${word}"]`);
      if (favoriteButton) {
        favoriteButton.textContent = 'Remove from Favorites';
      }
    }
  }
}

function removeFromFavorites(word) {
  const index = favorites.indexOf(word);
  if (index !== -1) {
    favorites.splice(index, 1);
    saveFavorites();
    displayFavoriteWords();
    if (searchResults.innerHTML.includes(word)) {
      const favoriteButton = searchResults.querySelector(`.favorite-button[data-word="${word}"]`);
      if (favoriteButton) {
        favoriteButton.textContent = 'Add to Favorites';
      }
    }
  }
}

function displayFavoriteWords() {
  favoriteWords.innerHTML = '';
  favorites.forEach(word => {
    const favoriteWordElement = document.createElement('div');
    favoriteWordElement.classList.add('favorite-word');
    favoriteWordElement.textContent = word;
    favoriteWords.appendChild(favoriteWordElement);
  });
}

function saveFavorites() {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function loadFavorites() {
  const storedFavorites = localStorage.getItem('favorites');
  if (storedFavorites) {
    favorites = JSON.parse(storedFavorites);
    displayFavoriteWords();
  }
}

function addToSearchHistory(word) {
  searchHistory.unshift(word);
  saveSearchHistory();
  displaySearchHistory();
}

function clearSearchHistory() {
  searchHistory = [];
  saveSearchHistory();
  displaySearchHistory();
}

function displaySearchHistory() {
  historyEntries.innerHTML = '';
  searchHistory.forEach(entry => {
    const historyEntryElement = document.createElement('div');
    historyEntryElement.classList.add('history-entry');
    historyEntryElement.textContent = entry;
    historyEntries.appendChild(historyEntryElement);
  });
}

function saveSearchHistory() {
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

function loadSearchHistory() {
  const storedSearchHistory = localStorage.getItem('searchHistory');
  if (storedSearchHistory) {
    searchHistory = JSON.parse(storedSearchHistory);
    displaySearchHistory();
  }
}

function clearSearchResults() {
  searchResults.innerHTML = '';
}

function handleInput() {
  const word = searchInput.value.trim();
  if (word !== '') {
    fetch(`https://dictionaryapi.com/api/v3/references/sd4/json/${word}?key=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        displayResults(data);
        generateSuggestions(data);
      })
      .catch(error => {
        console.log('Error:', error);
      });
  } else {
    clearSearchResults();
  }
}

function generateSuggestions(data) {
  suggestionsList.innerHTML = '';
  if (Array.isArray(data)) {
    const words = data.map(entry => entry.hwi.hw);
    words.forEach(word => {
      const suggestionOption = document.createElement('option');
      suggestionOption.value = word;
      suggestionsList.appendChild(suggestionOption);
    });
  }
}

clearHistoryButton.addEventListener('click', clearSearchHistory);

toggleFavoritesButton.addEventListener('click', () => {
  toggleFavoritesButton.classList.add('active');
  toggleHistoryButton.classList.remove('active');
  favoriteWords.style.display = 'block';
  historyEntries.style.display = 'none';
});

toggleHistoryButton.addEventListener('click', () => {
  toggleHistoryButton.classList.add('active');
  toggleFavoritesButton.classList.remove('active');
  favoriteWords.style.display = 'none';
  historyEntries.style.display = 'block';
});