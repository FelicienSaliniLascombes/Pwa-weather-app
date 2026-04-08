async function displayFavorites() {
  const container = document.getElementById("favorites-list");
  const db = await dbPromise;

  const allFavs = await db.getAll("favorites");

  container.innerHTML = "";

  if (allFavs.length === 0) {
    container.innerHTML = "<p>Aucun favori pour le moment.</p>";
    return;
  }

  allFavs
    .sort((a, b) => b.timestamp - a.timestamp)
    .forEach((fav) => {
      container.innerHTML += generateWeatherCardHTML(fav, true);
    });
}

async function removeFavorite(name) {
  const db = await dbPromise;
  await db.delete("favorites", name);
  displayFavorites();
}

document.getElementById("nav-favs").addEventListener("click", () => {
  switchView("view-favs", "nav-favs");
  displayFavorites();
});
