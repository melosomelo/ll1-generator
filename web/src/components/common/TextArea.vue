<script setup></script>

<template>
  <textarea></textarea>
</template>
<style>
textarea {
  resize: none;

  color: white;
  font-size: var(--p);
  font-weight: 300;

  line-height: 170%;

  padding: 2.6rem 2.2rem;

  border-radius: 16px;
  border: 2px solid rgba(163, 127, 240, 0.5);
  background: rgba(18, 12, 12, 0.2);

  width: 100%;

  transition: 0.3s;
}

textarea:focus {
  outline: none;
  border: 2px solid rgba(163, 127, 240, 1);
}
</style>
