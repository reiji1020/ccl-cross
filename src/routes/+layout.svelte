<script>
  import '../app.css';
</script>

<header>
  <h1>Stitch</h1>
</header>

<main>
  <slot />
</main>

<footer>
  <p>&copy; 2025 Stitch. All rights reserved.</p>
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
    background-color: #333;
    color: white;
    padding: 1rem;
    text-align: center;
    margin-top: 20px; /* コンテンツとの間に余白 */
  }

  footer p {
    margin: 0;
    font-size: 0.9em;
  }
</style>