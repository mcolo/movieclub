const movieData = require("../../../data/autocomplete_dataset.json");

module.exports = {
  getMovieData: (ids) => {
    let data = [];
    for (let id of ids) {
      data.push({
        title: movieData[id].t,
        year: movieData[id].y,
        id,
      });
      if (data.length > 9) break;
    }
    return data;
  },
};
