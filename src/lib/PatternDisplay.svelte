<script>
  export let patternData; // { gridSize: [w, h], brand: 'DMC'|'COSMO', cells: [[code, ...], ...] }
  export let allDmcColors; // 全DMCカラーデータ
  export let allCosmoColors; // 全COSMOカラーデータ

  let colorMap = new Map();

  $: {
    // patternDataまたはカラーデータが変更されたらカラーマップを再構築
    const targetColors = patternData.brand === 'DMC' ? allDmcColors : allCosmoColors;
    colorMap = new Map(targetColors.map(color => [color.COLOR_CODE, color.RGB_COLOR]));
  }

  // 各セルのサイズを動的に計算
  const cellSize = 20; // 1セルの表示サイズ（ピクセル）を20に拡大
  $: gridWidth = patternData.gridSize[0] * cellSize;
  $: gridHeight = patternData.gridSize[1] * cellSize;
</script>

<div class="pattern-grid-container">
  <div
    class="pattern-grid"
    style="width: {gridWidth}px; height: {gridHeight}px; --grid-cols: {patternData.gridSize[0]}; --cell-size: {cellSize}px;"
  >
    {#each patternData.cells as row}
      {#each row as cellColorCode}
        <div
          class="grid-cell"
          style="background-color: {colorMap.get(cellColorCode) || '#cccccc'};"
        ></div>
      {/each}
    {/each}
  </div>
</div>

<style>
  .pattern-grid-container {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow-x: auto; /* 横スクロールを可能にする */
    padding: 20px;
    background-color: #f0f0f0;
    border-radius: 8px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  }

  .pattern-grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-cols), var(--cell-size));
    border: 1px solid #ccc;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    background-color: white;
  }

  .grid-cell {
    /* セルのサイズはCSS変数で設定 */
    width: var(--cell-size);
    height: var(--cell-size);
    box-sizing: border-box; /* パディングとボーダーを幅と高さに含める */
    border: 1px solid #eee; /* 境界線を追加 */
  }
</style>