
<script>
  export let slides = [];
  let currentSlide = 0;

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  }
</script>

<div class="carousel-container">
  <div class="carousel-slide">
    {#if slides.length > 0}
      <h2>{slides[currentSlide].title}</h2>
      <p>{slides[currentSlide].description}</p>
    {:else}
      <p>No slides to display.</p>
    {/if}
  </div>
  <div class="carousel-navigation">
    <button on:click={prevSlide}>&lt;</button>
    <button on:click={nextSlide}>&gt;</button>
  </div>
</div>

<style>
  .carousel-container {
    border: 1px solid #ccc;
    padding: 20px;
    text-align: center;
    margin: 20px auto;
    max-width: 600px;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .carousel-slide h2 {
    color: var(--theme-color);
    margin-bottom: 10px;
  }

  .carousel-slide p {
    color: #555;
    line-height: 1.6;
  }

  .carousel-navigation button {
    background-color: var(--theme-color);
    color: white;
    border: none;
    padding: 10px 15px;
    margin: 0 5px;
    cursor: pointer;
    font-size: 1.2em;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }

  .carousel-navigation button:hover {
    background-color: darken(var(--theme-color), 10%);
  }
</style>
