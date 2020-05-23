const fs = require('fs')
const csv = require('@fast-csv/parse')
const Trie = require('./trie')
const trie = new Trie()

csv.parseFile('./titles_and_ratings.tsv', { delimiter: '\t' })
    .on('error', error => handleError(error))
    .on('data', row => processData(row))
    .on('end', () => writeToJSON())

function handleError(error) {
  console.log(error)
}

function processData(row) {
  [ id, title ] = row;
  trie.add(title, id);
}

function writeToJSON() {
  fs.writeFile("movieTitleTrie.json", JSON.stringify(trie), 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
 
    console.log("JSON file has been saved.");
});
}