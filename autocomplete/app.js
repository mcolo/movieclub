const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000
const trieUtils = require('./utils/index').Trie
const movieUtils = require('./utils/index').Movies

app.use(bodyParser.json())

app.post('/search', (req, res) => {
  const prefix = req.body.prefix;
  const ids = trieUtils.suggestions(prefix);
  const movieData = movieUtils.getMovieData(ids);
  res.send({
    movieData
  })
})

app.listen(port, () => console.log(`listening at http://localhost:${port}`))
