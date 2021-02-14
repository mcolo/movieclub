import fs from "fs";
let movieData = fs.readFileSync("data/autocomplete_dataset.json", "utf8");
movieData = JSON.parse(movieData);

export const getMovieData = (ids) => {
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
};
