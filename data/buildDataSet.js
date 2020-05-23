const fs = require('fs')
const csv = require('@fast-csv/parse')
const dataset = {};

csv.parseFile('./titles_and_ratings.tsv', { delimiter: '\t'})
    .on('error', error => handleError(error))
    .on('data', row => processData(row))
    .on('end', () => writeToJSON())

function handleError(error) {
  console.log(error)
}

function processData(row) {
  dataset[row[0]] = {
    t: row[1],
    y: row[2],
    r: row[3] * row[4] || 0
  }
}

function writeToJSON() {
  fs.writeFile("imdbData.json", JSON.stringify(dataset), 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
 
    console.log("JSON file has been saved.");
});
}