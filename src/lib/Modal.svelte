<script>
  import { createEventDispatcher } from 'svelte';
  import PatternDisplay from './PatternDisplay.svelte';
  import html2canvas from 'html2canvas';

  export let patternData;
  export let allDmcColors;
  export let allCosmoColors;
  export let screenWidth; // 親から受け取る画面幅

  const dispatch = createEventDispatcher();

  function closeModal() {
    dispatch('close');
  }

  async function downloadFullSizeImage() {
    const targetElement = document.getElementById('modal-pattern-display');
    if (targetElement) {
      // モーダル内の図案グリッドの実際のサイズを取得
      const patternGrid = targetElement.querySelector('.pattern-grid');
      let scale = 2; // デフォルトのスケール
      if (patternGrid) {
        // 表示されている図案の幅と、本来の図案の幅（cellSize * gridSize[0]）を比較してスケールを決定
        // ここでは、表示されている図案の幅が小さい場合に、より大きなスケールでキャプチャするように調整
        const currentWidth = patternGrid.offsetWidth;
        const originalWidth = patternData.gridSize[0] * 20; // 1セル20pxで計算
        if (currentWidth < originalWidth) {
          scale = originalWidth / currentWidth; // 実際のサイズに合わせてスケールを調整
        }
      }

      html2canvas(targetElement, { scale: 3 }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'full_size_stitch_pattern.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    } else {
      alert('ダウンロード対象の要素が見つかりません。');
    }
  }
</script>

<div class="modal-overlay" on:click={closeModal}>
  <div class="modal-content" on:click|stopPropagation>
    <button class="close-button" on:click={closeModal}>&times;</button>
    <h3>フルサイズ図案</h3>
    <div id="modal-pattern-display">
      <PatternDisplay
        {patternData}
        {allDmcColors}
        {allCosmoColors}
        isModal={true} <!-- モーダル内であることを伝えるフラグ -->
      />
    </div>
    <button on:click={downloadFullSizeImage} class="download-button">
      フルサイズ画像をダウンロード
    </button>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 90%;
    max-height: 90%;
    overflow: auto; /* モーダル内容がはみ出る場合にスクロール可能にする */
    position: relative;
    text-align: center;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 2em;
    cursor: pointer;
    color: #333;
  }

  .modal-content h3 {
    color: var(--theme-color);
    margin-bottom: 15px;
  }

  .download-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    margin-top: 20px;
    transition: background-color 0.3s ease;
  }

  .download-button:hover {
    background-color: #45a049;
  }
</style>