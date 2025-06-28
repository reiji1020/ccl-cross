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
  <p>&copy; 2025 <a href="https://candychupslab.netlify.app/" target="_blank" referrerpolicy="no-referrer">CANDY CHUPS Lab. </a>All rights reserved.</p>
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

  footer a {
    color: white; /* リンクの色を白に */
    text-decoration: none; /* 下線を削除 */
  }

  footer a:hover {
    text-decoration: underline; /* ホバー時に下線を表示 */
  }

  .logo {
    max-height: 50px; /* 最大の高さを設定 */
    width: auto; /* 幅を自動調整してアスペクト比を維持 */
    display: block; /* ブロック要素にして中央寄せを可能に */
    margin: 0 auto; /* 中央寄せ */
  }
</style>