const API_KEY = "5cf1dc15a70484a5b647585d5b2f8522";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const searchInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const searchResult = document.getElementById("search-result");
const europeanContainer = document.getElementById("european-capitals");

function generateWeatherCardHTML(data, isFavoriteView = false) {
  const { name, main, weather, wind } = data;
  const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

  const actionButton = isFavoriteView
    ? `<button onclick="removeFavorite('${name}')" style="background:none; border:none; color:red; cursor:pointer; font-weight:bold;">🗑️ Supprimer</button>`
    : `<button class="fav-btn" onclick="handleFavorite('${name}')" style="background-color: var(--accent); border:none; padding:10px; border-radius:8px; cursor:pointer;">⭐ Ajouter aux favoris</button>`;

  return `
        <div class="weather-card">
            <h2>${name}</h2>
            <img src="${iconUrl}" alt="${weather[0].description}">
            <div class="temp">${Math.round(main.temp)}°C</div>
            <p style="text-transform: capitalize; margin-bottom: 10px;">${weather[0].description}</p>
            <div class="weather-details" style="display: flex; justify-content: space-around; border-top: 1px solid #eee; padding-top: 10px;">
                <span>💧 Humidité : ${main.humidity}%</span>
                <span>💨 Vent : ${wind.speed} km/h</span>
            </div>
            <div style="margin-top: 15px;">
                ${actionButton}
            </div>
        </div>
    `;
}

async function fetchWeather(city) {
  searchResult.innerHTML = '<p class="loading">Chargement...</p>';
  const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=fr`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ville non trouvée");
    const data = await response.json();

    searchResult.innerHTML = generateWeatherCardHTML(data, false);
  } catch (error) {
    searchResult.innerHTML = `<p style="color:red">Erreur : Connexion au serveur météo impossible.</p>`;
  }
}

function switchView(viewId, activeBtnId) {
  document
    .querySelectorAll("main > div")
    .forEach((div) => div.classList.add("hidden"));
  document.getElementById(viewId).classList.remove("hidden");

  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.getElementById(activeBtnId).classList.add("active");
}

const capitals = ["Paris", "London", "Berlin", "Madrid", "Rome", "Zurich"];

async function loadHomeWeather() {
  europeanContainer.innerHTML = "<p>Mise à jour...</p>";
  let html = "";

  for (const city of capitals) {
    try {
      const data = await fetch(
        `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=fr`,
      ).then((r) => r.json());
      html += `
                <div class="weather-card mini" style="padding: 10px;">
                    <h3>${city}</h3>
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" style="width:40px;">
                    <p><strong>${Math.round(data.main.temp)}°C</strong></p>
                </div>
            `;
    } catch (e) {
      console.error("Erreur capitale:", city);
    }
  }
  europeanContainer.innerHTML = html;
}

async function handleFavorite(cityName) {
  const db = await dbPromise;
  try {
    const response = await fetch(
      `${BASE_URL}?q=${cityName}&appid=${API_KEY}&units=metric&lang=fr`,
    );
    const data = await response.json();

    const favoriteData = {
      ...data,
      timestamp: Date.now(),
    };

    await db.put("favorites", favoriteData);
    showToast(`${cityName} ajouté aux favoris !`);
  } catch (error) {
    console.error("Erreur lors de l'ajout", error);
    showToast("Erreur lors de l'ajout aux favoris");
  }
}

document.getElementById("nav-home").addEventListener("click", () => {
  switchView("view-home", "nav-home");
  loadHomeWeather();
});

document.getElementById("nav-search").addEventListener("click", () => {
  switchView("view-search", "nav-search");
});

searchBtn.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (city) fetchWeather(city);
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = searchInput.value.trim();
    if (city) fetchWeather(city);
  }
});

function updateNetworkStatus() {
  const banner = document.getElementById("offline-banner");
  if (navigator.onLine) {
    banner.style.display = "none";
  } else {
    banner.style.display = "block";
  }
}

window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}

let deferredPrompt;
const installBtn = document.getElementById("install-btn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "inline-block";

  installBtn.addEventListener("click", () => {
    installBtn.style.display = "none";
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("L utilisateur a accepté l installation");
      } else {
        console.log("L utilisateur a refusé l installation");
      }
      deferredPrompt = null;
    });
  });
});

window.addEventListener("appinstalled", () => {
  console.log("Nimbus a été installée");
  installBtn.style.display = "none";
});

function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>⭐</span> ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

updateNetworkStatus();
loadHomeWeather();
