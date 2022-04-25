<template>
  <div id="app">
    <h1>Admin</h1>
    <h2 v-if="loading">Loading...</h2>
    <h3 v-else-if="error" class="error">
      {{ error.message || 'Something went wrong. Try again later' }}
    </h3>
    <div v-else>
      <h2>Settings</h2>
      <Settings
        :settings="settings"
        :getSettings="getSettings"
        :apiUri="apiUri"
      />
    </div>
  </div>
</template>

<script>
import Settings from './Settings'

export default {
  name: 'App',
  components: {
    Settings
  },
  data() {
    return {
      loading: true,
      error: null,
      settings: {},
      apiUri: 'http://localhost:5000/api/settings'
    }
  },
  created() {
    this.getSettings()
  },
  methods: {
    async getSettings() {
      this.loading = true
      try {
        const response = await fetch(this.apiUri)
        if (!response.ok) throw response
        this.settings = await response.json()
      } catch (e) {
        this.error = e
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style src="normalize.css/normalize.css"></style>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;400;600&display=swap');

:root {
  --primary: #0275d8;
  --success: #5cb85c;
  --warning: #f0ad4e;
  --danger: #d9534f;
  --light: #f7f7f7;
  --dark: #292b2c;
}

* {
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
}

body.light {
  background-color: var(--light);
  color: var(--dark);
}

body.dark {
  background-color: var(--dark);
  color: var(--light);
}

#app {
  display: flex;
  flex-direction: column;
  text-align: center;
}

h2 {
  font-size: 1.4rem;
}

form div {
  display: flex;
  flex-direction: column;
  align-items: center;
}

label {
  margin: 0.5rem 0;
}

input {
  padding: 0.5rem;
  max-width: 220px;
  width: max-content;
  outline: none;
  border: 1px solid var(--dark);
  border-radius: 4px;
  text-align: center;
}

input:focus {
  border-color: var(--primary);
}

button {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  border-radius: 4px;
  outline: none;
  background-color: var(--success);
  color: var(--light);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  user-select: none;
  transition: 0.2s;
}

button:active {
  box-shadow: none;
}

.error {
  color: var(--danger);
}
</style>
