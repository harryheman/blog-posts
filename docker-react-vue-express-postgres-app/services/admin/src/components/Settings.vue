<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">
    {{ error.message || JSON.stringify(error, null, 2) }}
  </div>
  <form v-else @submit.prevent="saveSettings">
    <div>
      <label for="greetings">Greetings</label>
      <input
        type="text"
        id="greetings"
        name="greetings"
        :value="settings.greetings"
        required
      />
    </div>
    <div>
      <label for="theme">Theme</label>
      <input
        type="text"
        id="theme"
        name="theme"
        :value="settings.theme"
        required
      />
    </div>
    <div>
      <label for="base_font_size">Base font size</label>
      <input
        type="text"
        id="base_font_size"
        name="base_font_size"
        :value="settings.base_font_size"
        required
      />
    </div>

    <button>Save</button>
  </form>
</template>

<script>
export default {
  name: 'Settings',
  props: {
    settings: {
      type: Object,
      required: true
    },
    getSettings: {
      type: Function,
      required: true
    },
    apiUri: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      error: null
    }
  },
  methods: {
    async saveSettings(e) {
      this.loading = true
      const formDataObj = [...new FormData(e.target)].reduce(
        (obj, [key, val]) => ({
          ...obj,
          [key]: val
        }),
        {}
      )
      try {
        const response = await fetch(`${this.apiUri}/${this.settings.id}`, {
          method: 'PUT',
          body: JSON.stringify(formDataObj),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) throw response
        await this.getSettings()
      } catch (e) {
        this.error = e
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style></style>
