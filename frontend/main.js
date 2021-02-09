const pickCache = {};

const searchInput = document.getElementById("search");
searchInput.addEventListener("keyup", (event) => {
  if (event.target.value.length > 0) {
    getAutocomplete(event.target.value);
  } else {
    clearResults();
  }
});
searchInput.addEventListener("blur", () => {
  clearResults();
});
searchInput.addEventListener("focus", (event) => {
  if (event.target.value.length > 0) {
    getAutocomplete(event.target.value);
  }
});

document.getElementById("share").addEventListener("click", () => {
  const pickElements = document.getElementById("picks").children;
  const ids = [];
  if (pickElements.length < 1) return;
  for (let el of pickElements) {
    if (el.dataset.id) ids.push(el.dataset.id);
  }
  const a = document.createElement("a");
  const href = window.location.origin + "/picks?ids=" + ids.join(",");
  a.href = href;
  a.innerHTML = href;
  a.target = "_blank";
  document.getElementById("picks").insertAdjacentElement("afterend", a);
});

function getAutocomplete(query) {
  fetch("http://" + window.location.hostname + ":3000/search/", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix: query }),
  })
    .then((res) => res.json())
    .then((data) => updateSearchResults(data.movieData))
    .catch((err) => displayErrorMessage());
}

function updateSearchResults(movieData) {
  const results = document.getElementById("results");
  results.innerHTML = "";
  const frag = document.createDocumentFragment();
  movieData.forEach((movie) => {
    const li = document.createElement("li");
    li.classList.add("search-result");
    li.onclick = addMovieToPicks;
    li.dataset.id = movie.id;
    li.dataset.title = movie.title;
    li.innerHTML = `${movie.title} (${movie.year})`;
    frag.appendChild(li);
  });
  results.appendChild(frag);
}

function addMovieToPicks(event) {
  if (pickCache[event.target.dataset.id]) return;
  const picks = document.getElementById("picks");
  const li = event.target.cloneNode(true);
  li.onclick = removeMovieFromPicks;
  li.classList.remove("search-result");
  li.classList.add("picked-movie");
  picks.appendChild(li);
  pickCache[event.target.dataset.id] = true;
}

function removeMovieFromPicks(event) {
  delete pickCache[event.target.dataset.id];
  event.target.remove();
}

function clearResults() {
  document.getElementById("results").innerHTML = "";
}

function displayErrorMessage() {
  clearResults();
  const span = document.createElement("span");
  span.innerHTML = "No Movies Found :(";
  document.getElementById("results").appendChild(span);
}

/**
id: "tt1375666"
rating: 15722304
title: "Inception"
year: "2010"
 */
