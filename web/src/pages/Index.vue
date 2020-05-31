<template>
  <Layout>
    <input type="text" v-model="autocomplete" @keyup="search">
    <div class="results" v-for="movie in movies" :key="movie.id">
      <span>{{movie.title}} ({{movie.year}})</span>
    </div>
  </Layout>
</template>

<script>
export default {
  metaInfo: {
    title: 'Hello, world!',
  },
  data() {
    return {
      autocomplete: '',
      movies: []
    }
  },
  methods: {
    search() {
      if(this.autocomplete.length > 3) {
        fetch('http://localhost:3000/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({prefix: this.autocomplete})
        })
        .then(res => res.json())
        .then(data => this.movies = data.movieData)
      } else {
        this.movies = []
      }
    }
  }
}
</script>

<style>
.home-links a {
  margin-right: 1rem;
}
</style>
