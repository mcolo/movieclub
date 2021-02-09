const movieData = require('../../../data/autocomplete_dataset.json')

module.exports = {
  getMovieData: (ids) => {
    let data = [];
    ids.forEach( (id, index) => {
      if (movieData[id].r) {
        data.push({
          title: movieData[id].t,
          year: movieData[id].y,
          rating: movieData[id].r,
          id,
        })
      }
    })
    // data.sort( (a,b) => b.rating - a.rating);
    data.splice(9, data.length-10);
    return data;
  }
}