<script setup>
import TextArea from '../common/TextArea.vue'
import Button from '../common/Button.vue'
</script>

<template>
  <main class="container">
    <h1 class="container__title">LL(1) Parsing Visualizer</h1>
    <p class="container__subtitle">
      Write an LL(1) grammar and visualize the associated First/Follow sets, parsing tables and
      trees!
    </p>
    <span
      >Made by <a href="https://github.com/melosomelo" target="_blank">@melosomelo</a> with Vue.
      Check out the project on
      <a href="https://github.com/melosomelo/ll1-generator" target="_blank">Github!</a></span
    >
    <h2 class>Write your LL(1) grammar</h2>
    <div class="rules">
      <h3 class="rules__title">Formatting rules</h3>
      <p>Each line must contain at least one production. Empty lines will be ignored.</p>
      <p>You can aggregate productions with the same left-hand side with the | symbol.</p>
      <p>Separate left and right-hand side of the production with ->.</p>
      <p>Tokens must be separated with whitespace.</p>
      <p>Symbols that do not appear on a left-hand side are considered terminals.</p>
      <p>Use the ε character to represent the empty string.</p>
      <p>Don't specify a rule with the end of input symbol.</p>
    </div>
    <form class="form">
      <TextArea></TextArea>
      <Button>Generate</Button>
    </form>
  </main>
</template>

<style scoped>
.container {
  width: 90%;
  margin: 0 auto;
  margin-bottom: 6rem;
  max-width: 600px;

  text-align: center;
}

.container__title {
  font-weight: 600;

  margin-top: 4rem;
  margin-bottom: 2rem;
}

.container__subtitle {
  font-size: var(--subtitle);
  font-style: italic;
  font-weight: 300;

  margin-bottom: 2rem;
}

.container__subtitle + span {
  font-style: italic;
  font-weight: 300;
}

h2 {
  margin: 4rem 0;
  font-weight: 600;
}

.rules {
  margin-bottom: 4rem;
}
.rules__title {
  font-size: var(--subtitle);
  font-weight: 500;
  margin-bottom: 2rem;
}

.rules p {
  font-style: italic;
  font-weight: 300;
}
.rules > p + p {
  margin-top: 1.7rem;
}

.form {
  display: flex;
  flex-direction: column;
}

.form :deep(textarea) {
  height: 450px;
  margin-bottom: 2.6rem;
}

.form :deep(button) {
  align-self: flex-end;
}
</style>
