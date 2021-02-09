function init() {
  let params = window.location.search;
  if (!params) return;
  params = new URLSearchParams(params);
  const ids = params.get("ids").split(",");
  if (ids.length < 1) return;
  getMovieData(ids);
}

function getMovieData(ids) {
  fetch("http://" + window.location.hostname + ":3000/movieData/", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
}

init();
