<script lang="ts">
	import { Carousel, Button, Input, Select, FormGroup, Spinner } from 'cclkit4svelte';
	import XIcon from '../lib/XIcon.svelte';
	import ImageUpload from '../lib/ImageUpload.svelte';
	import PatternDisplay from '../lib/PatternDisplay.svelte';
	import ShoppingList from '../lib/ShoppingList.svelte';
	import { rgbDistance } from '../lib/colorUtils';
	import { buildPatternExportSvg } from '../lib/patternExport';
	import type { Brand, ImageSelectedDetail, PatternData, SymbolColorMode, ThreadColor } from '../lib/types';

	// マスターデータのインポート
	import dmcColors from '../lib/dmc_raw.json';
	import cosmoColors from '../lib/cosmo_raw.json';

	const carouselImages = [
		{ src: '/carousel_01.png', alt: 'Carousel Image 1' },
		{ src: '/carousel_02.png', alt: 'Carousel Image 2' },
		{ src: '/carousel_03.png', alt: 'Carousel Image 3' }
	];

	let uploadedImage: string | null = null;
	let horizontalCells = 50; // デフォルト値
	let verticalCells = 50; // デフォルト値
	let selectedBrand: Brand = 'DMC'; // 選択されたブランド
	let numColorsToUse = 30; // 使用する色数のデフォルト値

	let patternData: PatternData | null = null; // 生成された図案データ
	let isGenerating = false; // 図案生成中かどうかを示すフラグ

	let symbolColorMode: SymbolColorMode = 'color';

	const brandOptions: Array<{ label: Brand; value: Brand }> = [
		{ label: 'DMC', value: 'DMC' },
		{ label: 'COSMO', value: 'COSMO' }
	];

	const symbolColorOptions: Array<{ label: string; value: SymbolColorMode }> = [
		{ label: 'カラー', value: 'color' },
		{ label: '黒', value: 'black' }
	];

	function handleImageSelected(event: CustomEvent<ImageSelectedDetail>) {
		uploadedImage = event.detail.dataUrl;
	}

	function getAvailableColors(): ThreadColor[] {
		return (selectedBrand === 'DMC' ? dmcColors : cosmoColors) as ThreadColor[];
	}

	function findNearestThreadColor(rgb: [number, number, number], colors: ThreadColor[]): ThreadColor | null {
		let minDistance = Infinity;
		let bestMatch: ThreadColor | null = null;

		for (const color of colors) {
			const distance = rgbDistance(rgb, color.RGB);
			if (distance < minDistance) {
				minDistance = distance;
				bestMatch = color;
			}
		}

		return bestMatch;
	}

	function getRgbRange(samples: Array<[number, number, number]>) {
		let minR = 255;
		let minG = 255;
		let minB = 255;
		let maxR = 0;
		let maxG = 0;
		let maxB = 0;

		for (const [r, g, b] of samples) {
			minR = Math.min(minR, r);
			minG = Math.min(minG, g);
			minB = Math.min(minB, b);
			maxR = Math.max(maxR, r);
			maxG = Math.max(maxG, g);
			maxB = Math.max(maxB, b);
		}

		return {
			r: maxR - minR,
			g: maxG - minG,
			b: maxB - minB
		};
	}

	function selectRepresentativeColors(
		sampledColors: Array<[number, number, number]>,
		availableColors: ThreadColor[],
		colorUsageCounts: Map<string, number>
	): ThreadColor[] {
		if (numColorsToUse <= 0 || numColorsToUse >= availableColors.length) {
			return availableColors;
		}

		const buckets: Array<Array<[number, number, number]>> = [sampledColors];

		while (buckets.length < numColorsToUse) {
			let splitIndex = -1;
			let maxScore = -1;

			for (let i = 0; i < buckets.length; i++) {
				const bucket = buckets[i];
				if (bucket.length < 2) {
					continue;
				}

				const range = getRgbRange(bucket);
				const score = Math.max(range.r, range.g, range.b) * bucket.length;
				if (score > maxScore) {
					maxScore = score;
					splitIndex = i;
				}
			}

			if (splitIndex === -1) {
				break;
			}

			const bucket = buckets.splice(splitIndex, 1)[0];
			const range = getRgbRange(bucket);
			const channelIndex = range.r >= range.g && range.r >= range.b ? 0 : range.g >= range.b ? 1 : 2;
			const sortedBucket = [...bucket].sort((a, b) => a[channelIndex] - b[channelIndex]);
			const midpoint = Math.floor(sortedBucket.length / 2);
			buckets.push(sortedBucket.slice(0, midpoint), sortedBucket.slice(midpoint));
		}

		const selectedColors: ThreadColor[] = [];
		const selectedCodes = new Set<string>();

		for (const bucket of buckets) {
			if (bucket.length === 0) {
				continue;
			}

			const sum = bucket.reduce(
				(total, [r, g, b]) => {
					total[0] += r;
					total[1] += g;
					total[2] += b;
					return total;
				},
				[0, 0, 0]
			);
			const average: [number, number, number] = [
				Math.round(sum[0] / bucket.length),
				Math.round(sum[1] / bucket.length),
				Math.round(sum[2] / bucket.length)
			];
			const nearestColor = findNearestThreadColor(average, availableColors);

			if (nearestColor && !selectedCodes.has(nearestColor.COLOR_CODE)) {
				selectedCodes.add(nearestColor.COLOR_CODE);
				selectedColors.push(nearestColor);
			}
		}

		const colorMap = new Map(availableColors.map((color) => [color.COLOR_CODE, color]));
		for (const [code] of Array.from(colorUsageCounts.entries()).sort(([, countA], [, countB]) => countB - countA)) {
			if (selectedColors.length >= numColorsToUse) {
				break;
			}

			const color = colorMap.get(code);
			if (color && !selectedCodes.has(code)) {
				selectedCodes.add(code);
				selectedColors.push(color);
			}
		}

		return selectedColors;
	}

	async function generatePattern() {
		if (!uploadedImage) {
			alert('画像をアップロードしてください。');
			return;
		}

		isGenerating = true; // 生成開始
		patternData = null; // 以前の図案をクリア

		const img = new Image();
		img.src = uploadedImage;

		img.onload = () => {
			try {
				const availableColors = getAvailableColors();
				const patternCells: string[][] = [];

				const sampleCanvas = document.createElement('canvas');
				sampleCanvas.width = horizontalCells;
				sampleCanvas.height = verticalCells;
				const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
				if (!sampleCtx) {
					throw new Error('Sample canvas context unavailable');
				}

				const originalCanvas = document.createElement('canvas');
				originalCanvas.width = img.width;
				originalCanvas.height = img.height;
				const originalCtx = originalCanvas.getContext('2d');
				if (!originalCtx) {
					throw new Error('Original canvas context unavailable');
				}
				originalCtx.drawImage(img, 0, 0);

				const cellWidthPx = img.width / horizontalCells;
				const cellHeightPx = img.height / verticalCells;
				for (let y = 0; y < verticalCells; y++) {
					for (let x = 0; x < horizontalCells; x++) {
						sampleCtx.drawImage(
							originalCanvas,
							x * cellWidthPx,
							y * cellHeightPx,
							cellWidthPx,
							cellHeightPx,
							x,
							y,
							1,
							1
						);
					}
				}
				const sampledPixels = sampleCtx.getImageData(0, 0, horizontalCells, verticalCells).data;

				function getSampledColor(x: number, y: number): [number, number, number] {
					const index = (y * horizontalCells + x) * 4;
					return [sampledPixels[index], sampledPixels[index + 1], sampledPixels[index + 2]];
				}

				// --- パス1: 全色を使って各セルの最も近い色を仮決定し、色の出現数をカウント --- //
				const colorUsageCounts = new Map<string, number>();
				const sampledColors: Array<[number, number, number]> = [];

				for (let y = 0; y < verticalCells; y++) {
					for (let x = 0; x < horizontalCells; x++) {
						const avgColor = getSampledColor(x, y);
						sampledColors.push(avgColor);
						const bestMatch = findNearestThreadColor(avgColor, availableColors);
						if (bestMatch) {
							colorUsageCounts.set(
								bestMatch.COLOR_CODE,
								(colorUsageCounts.get(bestMatch.COLOR_CODE) || 0) + 1
							);
						}
					}
				}

				// --- 使用する色数を制限する場合、上位の色を選定 --- //
				let finalTargetColors: ThreadColor[] = availableColors;
				if (numColorsToUse > 0 && numColorsToUse < availableColors.length) {
					finalTargetColors = selectRepresentativeColors(
						sampledColors,
						availableColors,
						colorUsageCounts
					);
				}

				// --- パス2: 選定された色のみを使って各セルの最終的な色を決定 --- //
				for (let y = 0; y < verticalCells; y++) {
					const row: string[] = [];
					for (let x = 0; x < horizontalCells; x++) {
						const avgColor = sampledColors[y * horizontalCells + x];
						const bestMatch = findNearestThreadColor(avgColor, finalTargetColors);
						if (bestMatch) {
							row.push(bestMatch.COLOR_CODE);
						}
					}
					patternCells.push(row);
				}

				patternData = {
					gridSize: [horizontalCells, verticalCells],
					brand: selectedBrand,
					cells: patternCells
				};
			} catch (error) {
				alert('図案生成中にエラーが発生しました。コンソールを確認してください。');
			} finally {
				isGenerating = false; // 生成終了
			}
		};
		img.onerror = () => {
			alert('画像の読み込みに失敗しました。');
			isGenerating = false; // 生成終了
		};
	}

	function triggerDownload(url: string, filename: string) {
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		link.click();
	}

	function buildExportPattern() {
		if (!patternData) {
			alert('図案データがありません。');
			return null;
		}

		return buildPatternExportSvg(
			patternData,
			dmcColors as ThreadColor[],
			cosmoColors as ThreadColor[],
			{ symbolColorMode }
		);
	}

	function downloadPatternSvg() {
		const exportData = buildExportPattern();
		if (!exportData) {
			return;
		}

		const { filename, svg } = exportData;
		const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		triggerDownload(url, filename);

		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}

	async function downloadPatternPng() {
		const exportData = buildExportPattern();
		if (!exportData) {
			return;
		}

		const { filename, svg } = exportData;
		const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
		const svgUrl = URL.createObjectURL(svgBlob);

		try {
			const image = new Image();
			const loadPromise = new Promise<void>((resolve, reject) => {
				image.onload = () => resolve();
				image.onerror = () => reject(new Error('Failed to load SVG image'));
			});

			image.src = svgUrl;
			await loadPromise;

			const canvas = document.createElement('canvas');
			canvas.width = image.width;
			canvas.height = image.height;
			const ctx = canvas.getContext('2d');

			if (!ctx) {
				throw new Error('Canvas context unavailable');
			}

			ctx.fillStyle = '#ffffff';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(image, 0, 0);

			const pngUrl = canvas.toDataURL('image/png');
			triggerDownload(pngUrl, filename.replace(/\.svg$/i, '.png'));
		} catch (error) {
			alert('PNGへの変換に失敗しました。');
		} finally {
			URL.revokeObjectURL(svgUrl);
		}
	}

	function downloadPatternJson() {
		if (!patternData) {
			alert('図案データがありません。');
			return;
		}
		const jsonString = JSON.stringify(patternData, null, 2);
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'stitch_pattern.json';
		link.click();
		URL.revokeObjectURL(url);
	}

	// shareOnTwitter 関数は削除

	// XIcon に渡す URL を生成
	$: twitterShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
		'CROSSでクロスステッチの図案と買い物リストを作りましょう！あなたも試してみませんか？ #cclcross\n' +
			'https://ccl-cross.netlify.app/'
	)}`;
</script>

<div class="homepage-container">
	<div class="logo-section">
		<div class="service-logo"></div>
		<p>
			お気に入りの画像でクロスステッチを始めましょう。図案を作って刺繍糸を選ぶまで、CROSSでワンステップ。
		</p>
		<p>※利用推奨環境：PC/タブレット、Google Chrome</p>
	</div>

	<section class="introduction-section">
		<Carousel src={carouselImages} csWidth="900px" />
	</section>

	<section class="upload-section">
		<h3>画像をアップロードして始めましょう</h3>
		<ImageUpload on:imageSelected={handleImageSelected} />
		<p class="safety-message">※アップロードされた画像は収集されず、図案生成のみに使用されます。</p>

		{#if uploadedImage}
			<div class="grid-settings">
				<h3>グリッドサイズを設定</h3>
				<FormGroup label="横のマス数" forId="horizontal">
					<Input id="horizontal" type="number" bind:value={horizontalCells} borderColor="--melon-green" />
				</FormGroup>
				<FormGroup label="縦のマス数" forId="vertical">
					<Input id="vertical" type="number" bind:value={verticalCells} borderColor="--melon-green" />
				</FormGroup>
				<FormGroup label="使用ブランド" forId="brand">
					<Select id="brand" options={brandOptions} bind:value={selectedBrand} borderColor="--melon-green" />
				</FormGroup>
				<FormGroup label="使用色数" forId="numColors">
					<Input id="numColors" type="number" bind:value={numColorsToUse} borderColor="--melon-green" />
				</FormGroup>
				<FormGroup label="記号色" forId="symbolColorMode">
					<Select
						id="symbolColorMode"
						options={symbolColorOptions}
						bind:value={symbolColorMode}
						borderColor="--melon-green"
					/>
				</FormGroup>

				<div class="generate-button-wrap">
					<Button
						label={isGenerating ? '図案生成中...' : '図案を生成'}
						onClick={generatePattern}
						disabled={isGenerating}
						bgColor="--melon-green"
					/>

					{#if isGenerating}
						<div class="generating-indicator">
							<Spinner size="24px" color="--melon-green" />
							<span>生成中です…</span>
						</div>
					{/if}
				</div>
				</div>
			{/if}

		{#if patternData}
			<div id="pattern-and-list">
				<section class="pattern-display">
					<h3>生成された図案</h3>
					<PatternDisplay {patternData} allDmcColors={dmcColors} allCosmoColors={cosmoColors} />
				</section>

				<section class="shopping-list-section">
					<h3>買い物リスト</h3>
					<ShoppingList {patternData} allDmcColors={dmcColors} allCosmoColors={cosmoColors} />
				</section>
			</div>

					<div class="action-buttons">
						<Button label="図案をSVGで保存" onClick={downloadPatternSvg} bgColor="--melon-green" />
						<Button label="図案をPNGで保存" onClick={downloadPatternPng} bgColor="--melon-green" />
						<Button label="図案データをJSONでダウンロード" onClick={downloadPatternJson} bgColor="--melon-green" />
					</div>
		{/if}

		<div class="action-buttons always-visible-buttons">
			<XIcon url={twitterShareUrl} />
		</div>
	</section>
</div>

<style>
	.homepage-container {
		text-align: center;
		padding: 20px;
	}

	.logo-section {
		margin-bottom: 40px;
	}

	.service-logo {
		width: 512px; /* ロゴのサイズを調整 */
		height: 170px;
		margin-bottom: 10px;
		background-color: var(--theme-color);
		-webkit-mask-image: url(/logo-512.svg);
		mask-image: url(/logo-512.svg);
		-webkit-mask-size: contain;
		mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-position: center;
		mask-position: center;
		display: inline-block; /* 中央揃えのため */
	}

	.logo-section p {
		font-size: 1.2em;
		color: #666;
	}

	/* upload-sectionの見出しのみスタイルを指定 */
	.upload-section h3 {
		font-size: 1.8em;
		color: #333;
		margin-bottom: 20px;
	}

	.introduction-section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

		.grid-settings {
			margin-top: 30px;
			padding: 20px;
			border: 1px solid #eee;
			border-radius: 8px;
			background-color: #fff;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
			max-width: var(--content-width, 900px);
			margin-left: auto;
			margin-right: auto;
			text-align: left;
		}

		.grid-settings h3 {
			color: var(--theme-color);
			margin-bottom: 20px;
			text-align: center;
		}

	.input-group {
		margin-bottom: 15px;
	}

	.input-group label {
		display: inline-block;
		width: 80px;
		text-align: right;
		margin-right: 10px;
		color: #555;
	}

	.input-group input[type='number'],
	.input-group select {
		padding: 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
		width: 100px;
		text-align: center;
	}

	.app-button {
		background-color: var(--theme-color);
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 5px;
		cursor: pointer;
		font-size: 1em;
		transition: background-color 0.3s ease;
	}

	.app-button:hover {
		background-color: darken(var(--theme-color), 10%);
	}

	.app-button:disabled {
		background-color: #cccccc;
		cursor: not-allowed;
	}

	.action-buttons {
		margin-top: 20px;
		display: flex;
		justify-content: center;
		gap: 10px; /* ボタン間のスペース */
		width: 100%;
	}

		.always-visible-buttons {
			margin-top: 20px;
			margin-bottom: 20px; /* 下に余白を追加 */
		}

		.generating-indicator {
			margin-top: 12px;
			display: inline-flex;
			align-items: center;
			gap: 8px;
			color: #555;
		}

		.generate-button-wrap {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 4px;
			margin-top: 8px;
		}

	.safety-message {
		font-size: 0.9em;
		color: #666;
		margin-top: 10px;
		margin-bottom: 20px;
	}

	/* レスポンシブ対応 */
	@media (max-width: 768px) {
		.service-logo {
			width: 100%; /* 画面幅に合わせて調整 */
			height: auto; /* アスペクト比を維持 */
			min-height: 80px; /* 最小の高さを設定 */
			max-height: 120px; /* 小さい画面での最大高さを設定 */
		}

		.logo-section p {
			font-size: 1em;
		}
	}
</style>
