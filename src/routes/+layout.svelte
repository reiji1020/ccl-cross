<script>
  import '../app.css';
  import { CommonHeader, Footer } from 'cclkit4svelte';
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>CROSS - お気に入りの画像でクロスステッチ図案を作ろう</title>
  <meta property="og:title" content="CROSS - お気に入りの画像でクロスステッチ図案を作ろう" />
  <meta
    property="og:description"
    content="お気に入りの画像でクロスステッチを始めましょう。図案を作って刺繍糸を選ぶまで、CROSSでワンステップ。"
  />
  <meta property="og:image" content="{$page.url.origin}/OGP.png" />
  <meta property="og:url" content="{$page.url.href}" />
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="CROSS - お気に入りの画像でクロスステッチ図案を作ろう" />
  <meta
    name="twitter:description"
    content="お気に入りの画像でクロスステッチを始めましょう。図案を作って刺繍糸を選ぶまで、CROSSでワンステップ。"
  />
  <meta name="twitter:image" content="{$page.url.origin}/OGP.png" />
</svelte:head>

<CommonHeader
  logo="/logo-256.svg"
  logoHeight="50px"
  height="--hd-normal"
  bgColor="--melon-green"
  href="https://ccl-cross.netlify.app/"
/>

<a class="github-fork-ribbon" href="https://github.com/reiji1020/ccl-cross" data-ribbon="Fork me on GitHub" title="Fork me on GitHub" target="_blank">Fork me on GitHub</a>

<main>
  <slot />
</main>

<Footer bgColor="--melon-green" />

<style>
  main {
    padding: 1rem;
    min-height: calc(100vh - 100px); /* ヘッダーとフッターの高さ分を引く */
  }

  /* GitHubリボンのCSS */
  .github-fork-ribbon {
    width: 12.1em;
    height: 12.1em;
    position: absolute;
    overflow: hidden;
    top: 0;
    right: 0;
    z-index: 9999;
    pointer-events: none;
    font-size: 13px;
    text-decoration: none;
    text-indent: -999999px;
  }

  .github-fork-ribbon:before, .github-fork-ribbon:after {
    position: absolute;
    display: block;
    width: 15.38em;
    height: 1.54em;
    top: 3.23em;
    right: -3.23em;
    -webkit-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
  }

  .github-fork-ribbon:before {
    content: "";
    padding: .38em 0;
    background-color: #ED3B7D;
    background-image: -webkit-gradient(linear, left top, left bottom, from(rgba(0, 0, 0, 0)), to(rgba(0, 0, 0, 0.15)));
    background-image: -webkit-linear-gradient(top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));
    background-image: -moz-linear-gradient(top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));
    background-image: -ms-linear-gradient(top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));
    background-image: -o-linear-gradient(top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));
    background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));
    -webkit-box-shadow: 0 .15em .23em 0 rgba(0, 0, 0, 0.5);
    -moz-box-shadow: 0 .15em .23em 0 rgba(0, 0, 0, 0.5);
    box-shadow: 0 .15em .23em 0 rgba(0, 0, 0, 0.5);
    pointer-events: auto;
  }

  .github-fork-ribbon:after {
    content: attr(data-ribbon);
    color: #fff;
    font: 700 1em "Helvetica Neue", Helvetica, Arial, sans-serif;
    line-height: 1.54em;
    text-decoration: none;
    text-shadow: 0 -0.08em rgba(0, 0, 0, 0.5);
    text-align: center;
    text-indent: 0;
    padding: .15em 0;
    margin: .15em 0;
    border-width: .08em 0;
    border-style: dotted;
    border-color: #fff;
    border-color: rgba(255, 255, 255, 0.7);
  }
</style>
