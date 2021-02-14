import fs from "fs";

export const getMovieData = (ids) => {
  const movieData = fs.readFileSync("data/autocomplete_dataset.json", "utf8");
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
