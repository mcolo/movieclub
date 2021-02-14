import fs from "fs";
let trie = fs.readFileSync("data/autocomplete_trie.json", "utf8");
trie = JSON.parse(trie);

export const suggestions = (str) => {
  let response = [];
  str = str.toLowerCase();
  try {
    const startNode = str.split("").reduce((node, char) => {
      return node[char];
    }, trie);
    response = _getIds(startNode);
    return response;
  } catch (err) {
    console.log(err);
    return null;
  }
};

function _getIds(obj, ids = []) {
  if (obj["ids"]) {
    ids.push(...obj["ids"]);
  }

  for (let prop in obj) {
    if (prop !== "ids") {
      _getIds(obj[prop], ids);
    }
  }
  return ids;
}
