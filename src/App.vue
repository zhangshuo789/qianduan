<template>
  <NavBar />
  <div class="main-content">
    <router-view />
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
</script>
