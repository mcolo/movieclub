<template>
  <div class="layout">
    <header class="header">
      <p class="logo">{{ $static.metadata.siteName }}</p>
    </header>
    <slot/>
  </div>
</template>

<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>

<style>
@import url('https://fonts.googleapis.com/css2?family=Hind:wght@300;600&display=swap');

body {
  font-family: Hind,-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  margin:0;
  padding:0;
  line-height: 1.5;
}

.layout {
  max-width: 760px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  height: 80px;
}

.logo {
  text-transform: uppercase;
  font-family: Hind;
  font-weight: 600;
  font-size: 20px;
}

.nav__link {
  margin-left: 20px;
}
</style>
