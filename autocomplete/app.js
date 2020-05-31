const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000
const trieUtils = require('./utils/index').Trie
const movieUtils = require('./utils/index').Movies
const cors = require('cors')

app.use(bodyParser.json())

var whitelist = ['http://localhost:8080', 'http://localhost']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.options('/search', cors(corsOptions))

app.post('/search', cors(corsOptions), (req, res) => {
  const prefix = req.body.prefix;
  console.log('PREFIX:' + prefix)
  const ids = trieUtils.suggestions(prefix);
  const movieData = movieUtils.getMovieData(ids);
  res.send({
    movieData
  })
})

app.listen(port, () => console.log(`listening at http://localhost:${port}`))
