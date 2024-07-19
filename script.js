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
const toggleSettingsButton = document.getElementById('toggle-settings');
const favoritesSection = document.getElementById('favorites');
const historySection = document.getElementById('history');
const settingsSection = document.getElementById('settings');
const themeSelect = document.getElementById('theme-select');
const fontSizeSelect = document.getElementById('font-size-select');
const languageSelect = document.getElementById('language-select');
const wordOfTheDayContent = document.getElementById('wotd-content');
const loadingIndicator = document.getElementById('loading-indicator');

let favorites = [];
let searchHistory = [];
let currentLanguage = 'en';

loadFavorites();
loadSearchHistory();
loadSettings();
getWordOfTheDay();

searchButton.addEventListener('click', searchDictionary);
searchInput.addEventListener('input', handleInput);
clearHistoryButton.addEventListener('click', clearSearchHistory);
toggleFavoritesButton.addEventListener('click', () => toggleSection('favorites'));
toggleHistoryButton.addEventListener('click', () => toggleSection('history'));
toggleSettingsButton.addEventListener('click', () => toggleSection('settings'));
themeSelect.addEventListener('change', updateTheme);
fontSizeSelect.addEventListener('change', updateFontSize);
languageSelect.addEventListener('change', updateLanguage);

function searchDictionary() {
    const word = searchInput.value.trim();
    if (word !== '') {
        showLoading();
        fetch(`https://dictionaryapi.com/api/v3/references/sd4/json/${word}?key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                displayResults(data);
                addToSearchHistory(word);
                hideLoading();
            })
            .catch(error => {
                console.log('Error:', error);
                searchResults.innerHTML = '<div class="result-entry animate-in">An error occurred while fetching the data. Please try again.</div>';
                hideLoading();
            });
    }
}

function displayResults(data) {
    searchResults.innerHTML = '';
    if (Array.isArray(data) && data.length > 0) {
        data.forEach((entry, index) => {
            const word = entry.hwi?.hw || 'N/A';
            const partOfSpeech = entry.fl || 'N/A';
            const definitions = entry.shortdef || ['N/A'];
            const phonetics = entry.hwi?.prs?.[0]?.mw || 'N/A';
            const etymology = entry.et?.[0]?.[1] || 'N/A';
            const synonyms = entry.syns?.[0] || [];
            const antonyms = entry.ants?.[0] || [];

            const resultElement = document.createElement('div');
            resultElement.classList.add('result-entry', 'animate-in');
            resultElement.style.animationDelay = `${index * 100}ms`;
            resultElement.innerHTML = `
                <div class="word">
                    ${word}
                    <span class="phonetics">${phonetics}</span>
                    <button class="speak-button" onclick="speakWord('${word}')"><i class="fas fa-volume-up"></i></button>
                    <button class="favorite-button ${favorites.includes(word) ? 'active' : ''}" onclick="toggleFavorite('${word}')">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
                <div class="part-of-speech">${partOfSpeech}</div>
                <div class="definitions">
                    ${definitions.map((def, i) => `<p>${i + 1}. ${def}</p>`).join('')}
                </div>
                <div class="etymology">Etymology: ${etymology}</div>
                <div class="synonyms">Synonyms: ${synonyms.map(syn => `<span class="synonym">${syn}</span>`).join(' ')}</div>
                <div class="antonyms">Antonyms: ${antonyms.map(ant => `<span class="antonym">${ant}</span>`).join(' ')}</div>
            `;
            searchResults.appendChild(resultElement);
        });
    } else {
        searchResults.innerHTML = '<div class="result-entry animate-in">No results found.</div>';
    }
}

function toggleFavorite(word) {
    const index = favorites.indexOf(word);
    if (index !== -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(word);
    }
    saveFavorites();
    displayFavoriteWords();
    updateFavoriteButton(word);
}

function updateFavoriteButton(word) {
    const favoriteButton = searchResults.querySelector(`.favorite-button[onclick="toggleFavorite('${word}')"]`);
    if (favoriteButton) {
        favoriteButton.classList.toggle('active', favorites.includes(word));
    }
}

function displayFavoriteWords() {
    favoriteWords.innerHTML = '';
    favorites.forEach(word => {
        const favoriteWordElement = document.createElement('div');
        favoriteWordElement.classList.add('favorite-word', 'animate-in');
        favoriteWordElement.textContent = word;
        favoriteWordElement.addEventListener('click', () => {
            searchInput.value = word;
            searchDictionary();
        });
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
    const index = searchHistory.indexOf(word);
    if (index !== -1) {
        searchHistory.splice(index, 1);
    }
    searchHistory.unshift(word);
    if (searchHistory.length > 10) {
        searchHistory.pop();
    }
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
        historyEntryElement.classList.add('history-entry', 'animate-in');
        historyEntryElement.textContent = entry;
        historyEntryElement.addEventListener('click', () => {
            searchInput.value = entry;
            searchDictionary();
        });
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

function handleInput() {
    const word = searchInput.value.trim();
    if (word !== '') {
        fetch(`https://dictionaryapi.com/api/v3/references/sd4/json/${word}?key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                generateSuggestions(data);
            })
            .catch(error => {
                console.log('Error:', error);
            });
    } else {
        suggestionsList.innerHTML = '';
    }
}

function generateSuggestions(data) {
    suggestionsList.innerHTML = '';
    if (Array.isArray(data)) {
        const words = data.map(entry => entry.hwi?.hw).filter(Boolean);
        const uniqueWords = [...new Set(words)];
        uniqueWords.forEach(word => {
            const suggestionOption = document.createElement('option');
            suggestionOption.value = word;
            suggestionsList.appendChild(suggestionOption);
        });
    }
}

function toggleSection(section) {
    favoritesSection.style.display = section === 'favorites' ? 'block' : 'none';
    historySection.style.display = section === 'history' ? 'block' : 'none';
    settingsSection.style.display = section === 'settings' ? 'block' : 'none';
    
    toggleFavoritesButton.classList.toggle('active', section === 'favorites');
    toggleHistoryButton.classList.toggle('active', section === 'history');
    toggleSettingsButton.classList.toggle('active', section === 'settings');
}

function updateTheme() {
    const theme = themeSelect.value;
    document.body.className = `${theme}-theme`;
    localStorage.setItem('theme', theme);
}

function updateFontSize() {
    const fontSize = fontSizeSelect.value;
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${fontSize}`);
    localStorage.setItem('fontSize', fontSize);
}

function updateLanguage() {
    currentLanguage = languageSelect.value;
    localStorage.setItem('language', currentLanguage);
    // Here you would update the UI text based on the selected language
    // For simplicity, we're not implementing full internationalization in this example
}

function loadSettings() {
    const storedTheme = localStorage.getItem('theme') || 'dark';
    const storedFontSize = localStorage.getItem('fontSize') || 'medium';
    const storedLanguage = localStorage.getItem('language') || 'en';

    themeSelect.value = storedTheme;
    fontSizeSelect.value = storedFontSize;
    languageSelect.value = storedLanguage;

    updateTheme();
    updateFontSize();
    updateLanguage();
}

function speakWord(word) {
    const speech = new SpeechSynthesisUtterance(word);
    speech.lang = currentLanguage;
    window.speechSynthesis.speak(speech);
}

function getWordOfTheDay() {
    const today = new Date().toISOString().split('T')[0];
    fetch(`https://api.wordnik.com/v4/words.json/wordOfTheDay?date=${today}&api_key=ff37ed69-8cd7-4154-84f0-4311555586c5`)
        .then(response => response.json())
        .then(data => {
            wordOfTheDayContent.innerHTML = `
                <h4>${data.word}</h4>
                <p>${data.definitions[0].text}</p>
            `;
        })
        .catch(error => {
            console.log('Error fetching word of the day:', error);
            wordOfTheDayContent.innerHTML = 'Failed to load word of the day.';
        });
}

function showLoading() {
    loadingIndicator.style.display = 'flex';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
}

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement === searchInput) {
        searchDictionary();
    }
});

// Add a fun easter egg
let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiCodePosition = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiCodePosition]) {
        konamiCodePosition++;
        if (konamiCodePosition === konamiCode.length) {
            activateEasterEgg();
            konamiCodePosition = 0;
        }
    } else {
        konamiCodePosition = 0;
    }
});

function activateEasterEgg() {
    document.body.style.transition = 'transform 5s';
    document.body.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        document.body.style.transition = 'none';
        document.body.style.transform = 'none';
    }, 5000);
}