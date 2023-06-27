<script setup>
import { ref } from 'vue'
import * as APP_STATES from './states.js'

import WritingGrammarScreen from './components/screens/WritingGrammarScreen.vue'

const appState = ref(APP_STATES.WRITING_GRAMMAR)
</script>

<template>
  <WritingGrammarScreen v-if="appState === APP_STATES.WRITING_GRAMMAR" />
</template>
