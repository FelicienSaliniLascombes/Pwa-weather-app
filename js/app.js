const API_KEY = '5cf1dc15a70484a5b647585d5b2f8522';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Sélecteurs
const searchInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const searchResult = document.getElementById('search-result');
const europeanContainer = document.getElementById('european-capitals');

/* ==========================================
   1. LOGIQUE API & AFFICHAGE
   ========================================== */

async function fetchWeather(city) {
    searchResult.innerHTML = '<p class="loading">Chargement...</p>';
    const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=fr`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ville non trouvée');
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        searchResult.innerHTML = `<p style="color:red">Erreur : ${error.message}</p>`;
    }
}

function displayWeather(data) {
    const { name, main, weather, wind } = data;
    const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    searchResult.innerHTML = `
        <div class="weather-card">
            <h2>${name}</h2>
            <img src="${iconUrl}" alt="${weather[0].description}">
            <div class="temp">${Math.round(main.temp)}°C</div>
            <p>${weather[0].description}</p>
            <div class="weather-details">
                <span>💧 ${main.humidity}%</span> | <span>💨 ${wind.speed} km/h</span>
            </div>
            <button class="fav-btn" onclick="handleFavorite('${name}')">⭐ Ajouter</button>
        </div>
    `;
}

/* ==========================================
   2. NAVIGATION & VUES
   ========================================== */

function switchView(viewId, activeBtnId) {
    // Masquer toutes les sections
    document.querySelectorAll('main > div').forEach(div => div.classList.add('hidden'));
    // Afficher la section demandée
    document.getElementById(viewId).classList.remove('hidden');
    
    // Gérer l'état actif des boutons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(activeBtnId).classList.add('active');
}

// Accueil : Capitales Européennes
const capitals = ['Paris', 'London', 'Berlin', 'Madrid', 'Rome', 'Zurich'];

async function loadHomeWeather() {
    europeanContainer.innerHTML = '<p>Mise à jour...</p>';
    let html = '';

    for (const city of capitals) {
        try {
            const data = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=fr`).then(r => r.json());
            html += `
                <div class="weather-card">
                    <h3>${city}</h3>
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png">
                    <p><strong>${Math.round(data.main.temp)}°C</strong></p>
                </div>
            `;
        } catch (e) { console.error("Erreur capitale:", city); }
    }
    europeanContainer.innerHTML = html;
}

/* ==========================================
   3. ÉVÉNEMENTS
   ========================================== */

// Navigation
document.getElementById('nav-home').addEventListener('click', () => {
    switchView('view-home', 'nav-home');
    loadHomeWeather();
});

document.getElementById('nav-search').addEventListener('click', () => {
    switchView('view-search', 'nav-search');
});

document.getElementById('nav-favs').addEventListener('click', () => {
    switchView('view-favs', 'nav-favs');
    // Ici appeler displayFavorites() de favorites.js si tu l'as gardé
});

// Recherche
searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) fetchWeather(city);
});

/* ==========================================
   4. INITIALISATION PWA
   ========================================== */

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}

function updateNetworkStatus() {
    const banner = document.getElementById('offline-banner');
    
    // navigator.onLine est une propriété native du navigateur
    if (navigator.onLine) {
        // On cache la bannière si on a du réseau
        banner.style.display = 'none';
    } else {
        // On l'affiche si on est hors-ligne
        banner.style.display = 'block';
    }
}

// Écouter les changements de connexion
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

updateNetworkStatus();

// Premier chargement
loadHomeWeather();