
<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let fileInput;
  let previewUrl = null;

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      readFile(file);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      readFile(file);
    }
  }

  function readFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl = e.target.result;
      dispatch('imageSelected', { file, dataUrl: previewUrl });
    };
    reader.readAsDataURL(file);
  }

  function preventDefaults(event) {
    event.preventDefault();
    event.stopPropagation();
  }
</script>

<div
  class="image-upload-container"
  on:drop={handleDrop}
  on:dragover={preventDefaults}
  on:dragleave={preventDefaults}
>
  <input
    type="file"
    accept="image/png, image/jpeg"
    bind:this={fileInput}
    on:change={handleFileChange}
    style="display: none;"
  />

  {#if previewUrl}
    <img src={previewUrl} alt="Preview" class="image-preview" />
    <button on:click={() => fileInput.click()} class="change-image-button">
      画像を再選択
    </button>
  {:else}
    <div class="upload-area" on:click={() => fileInput.click()}>
      <p>画像をドラッグ＆ドロップするか、クリックして選択</p>
      <p>(PNG/JPEG対応)</p>
    </div>
  {/if}
</div>

<style>
  .image-upload-container {
    border: 2px dashed var(--theme-color);
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    margin: 20px auto;
    max-width: 600px;
    background-color: #f9f9f9;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .upload-area p {
    color: #666;
    margin: 5px 0;
  }

  .image-preview {
    max-width: 100%;
    max-height: 300px;
    margin-bottom: 15px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .change-image-button {
    background-color: var(--theme-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease;
  }

  .change-image-button:hover {
    background-color: darken(var(--theme-color), 10%);
  }
</style>
