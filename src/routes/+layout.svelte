<script>
  import '../app.css';
</script>

<header>
  <a href="/">
    <img src="/logo-256.svg" alt="Stitch Logo" class="logo" />
  </a>
</header>

<main>
  <slot />
</main>

<footer>
  <p>&copy; 2025 CANDY CHUPS Lab. All rights reserved.</p>
</footer>

<style>
  header {
    background-color: var(--theme-color);
    color: white;
    padding: 1rem;
    text-align: center;
  }

  main {
    padding: 1rem;
    min-height: calc(100vh - 100px); /* ヘッダーとフッターの高さ分を引く */
  }

  footer {
    background-color: #5F5F60;
    color: white;
    padding: 1rem;
    text-align: center;
    margin-top: 20px; /* コンテンツとの間に余白 */
  }

  footer p {
    margin: 0;
    font-size: 0.9em;
  }

  .logo {
    height: 50px;
    vertical-align: middle;
  }
</style>