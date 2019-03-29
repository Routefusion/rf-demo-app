<template>
  <div>
    <nav-meow></nav-meow>
    <router-view></router-view>
    <footer-meow></footer-meow>
  </div>
</template>

<script>
import Footer from "./Footer";
import Nav from "./Nav";

export default {
  components: {
    "nav-meow": Nav,
    "footer-meow": Footer
  }
};
</script>
