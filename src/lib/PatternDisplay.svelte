<script lang="ts">
	import type { PatternData, ThreadColor } from './types';

	type Props = {
		patternData: PatternData;
		allDmcColors: ThreadColor[];
		allCosmoColors: ThreadColor[];
		screenWidth?: number;
		isModal?: boolean;
	};

	let {
		patternData,
		allDmcColors,
		allCosmoColors,
		screenWidth = undefined,
		isModal = false
	}: Props = $props();

	const colorMap = $derived.by(() => {
		const targetColors = patternData.brand === 'DMC' ? allDmcColors : allCosmoColors;
		return new Map(targetColors.map((color) => [color.COLOR_CODE, color.RGB_COLOR]));
	});

	const cellSize = $derived.by(() => {
		const baseCellSize = 20;
		if (isModal) {
			return baseCellSize;
		}

		if (screenWidth !== undefined && screenWidth < 768) {
			const maxGridWidth = screenWidth - 40;
			const calculatedCellSize = maxGridWidth / patternData.gridSize[0];
			return Math.min(baseCellSize, calculatedCellSize);
		}

		return baseCellSize;
	});

	const gridWidth = $derived(patternData.gridSize[0] * cellSize);
	const gridHeight = $derived(patternData.gridSize[1] * cellSize);
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
		overflow-x: auto;
		max-width: 100%;
		box-sizing: border-box;
		padding: 20px;
		background-color: #ffffff;
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
		width: var(--cell-size);
		height: var(--cell-size);
		box-sizing: border-box;
		border: 1px solid #eee;
	}
</style>
