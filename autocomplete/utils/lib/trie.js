const trie = require('../../movieTitleTrie.json')

module.exports = {
  suggestions: (str) => {
    let response = [];
    try {
      const startNode = str.split('')
        .reduce( (node, char) => {
          return node[char];
        }, trie.root);
      response = _getIds(startNode);
      return response;
    } catch(err) {
      console.log(err);
      return null;
    }
  }
}

function _getIds(obj, ids = []) {
  if (obj['ids']) {
    ids.push(...obj['ids']);
  }

  for (let prop in obj) {
    if (prop !== 'ids') {
      _getIds(obj[prop], ids);
    }
  }
  return ids;
}