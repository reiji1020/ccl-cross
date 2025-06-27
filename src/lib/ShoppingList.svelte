
<script>
  export let patternData; // { gridSize: [w, h], brand: 'DMC'|'COSMO', cells: [[code, ...], ...] }
  export let allDmcColors; // 全DMCカラーデータ
  export let allCosmoColors; // 全COSMOカラーデータ

  let usedColors = [];

  $: {
    if (patternData && patternData.cells) {
      const targetColors = patternData.brand === 'DMC' ? allDmcColors : allCosmoColors;
      const colorMap = new Map(targetColors.map(color => [color.COLOR_CODE, color]));

      const colorCounts = {};
      patternData.cells.flat().forEach(code => {
        colorCounts[code] = (colorCounts[code] || 0) + 1;
      });

      usedColors = Object.keys(colorCounts).map(code => ({
        ...colorMap.get(code),
        count: colorCounts[code]
      })).sort((a, b) => a.COLOR_CODE.localeCompare(b.COLOR_CODE)); // 色番号でソート
    }
  }
</script>

<div class="shopping-list-container">
  <h3>使用する刺繍糸 ({patternData.brand})</h3>
  {#if usedColors.length > 0}
    <table>
      <thead>
        <tr>
          <th>色見本</th>
          <th>色番号</th>
          <th>色名</th>
          <th>出現数</th>
        </tr>
      </thead>
      <tbody>
        {#each usedColors as color}
          <tr>
            <td>
              <div class="color-swatch" style="background-color: {color.RGB_COLOR};"></div>
            </td>
            <td>{color.COLOR_CODE}</td>
            <td>{color.COLOR_NAME_EN || '-'}</td>
            <td>{color.count}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>使用する刺繍糸はありません。</p>
  {/if}
</div>

<style>
  .shopping-list-container {
    margin-top: 30px;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    text-align: center;
  }

  .shopping-list-container h3 {
    color: var(--theme-color);
    margin-bottom: 20px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
    color: #333;
  }

  .color-swatch {
    width: 25px;
    height: 25px;
    border: 1px solid #ccc;
    display: inline-block;
    vertical-align: middle;
  }
</style>
