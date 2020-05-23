function Trie() {
  this.root = {};

  this.add = (word,id) => {
    let node = this.root;
    word.split('').forEach(char => {
      node[char] = node[char] || {};
      node = node[char];
    });
    node['ids'] = [...(node['ids'] || []), id];
  }
}

module.exports = Trie;
