async function displayFavorites() {
  const container = document.getElementById("favorites-list");
  const db = await dbPromise;

  // Récupérer tous les favoris
  const allFavs = await db.getAll("favorites");

  // Vider le container pour éviter la superposition
  container.innerHTML = "";

  if (allFavs.length === 0) {
    container.innerHTML = "<p>Aucun favori pour le moment.</p>";
    return;
  }

  // Affichage des cartes avec les mêmes infos que la recherche
  allFavs
    .sort((a, b) => b.timestamp - a.timestamp)
    .forEach((fav) => {
      container.innerHTML += generateWeatherCardHTML(fav, true);
    });
}

// Fonction pour supprimer un favori
async function removeFavorite(name) {
  const db = await dbPromise;
  await db.delete("favorites", name);
  displayFavorites(); // Rafraîchir l'affichage
}

// Lier l'affichage au clic sur l'onglet
document.getElementById("nav-favs").addEventListener("click", () => {
  switchView("view-favs", "nav-favs");
  displayFavorites();
});
