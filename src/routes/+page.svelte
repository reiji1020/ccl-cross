<script>
	import { Carousel, Button, Input, Select, FormGroup, Spinner } from 'cclkit4svelte';
	import XIcon from '../lib/XIcon.svelte';
	import ImageUpload from '../lib/ImageUpload.svelte';
	import PatternDisplay from '../lib/PatternDisplay.svelte';
	import ShoppingList from '../lib/ShoppingList.svelte';
	import { rgbDistance } from '../lib/colorUtils.js';
	import html2canvas from 'html2canvas';

	// マスターデータのインポート
	import dmcColors from '../lib/dmc_raw.json';
	import cosmoColors from '../lib/cosmo_raw.json';

	const carouselImages = [
		{ src: '/carousel_01.png', alt: 'Carousel Image 1' },
		{ src: '/carousel_02.png', alt: 'Carousel Image 2' },
		{ src: '/carousel_03.png', alt: 'Carousel Image 3' }
	];

	let uploadedImage = null;
	let horizontalCells = 50; // デフォルト値
	let verticalCells = 50; // デフォルト値
	let selectedBrand = 'DMC'; // 選択されたブランド
	let numColorsToUse = 30; // 使用する色数のデフォルト値

	let patternData = null; // 生成された図案データ
	let isGenerating = false; // 図案生成中かどうかを示すフラグ

	const brandOptions = [
		{ label: 'DMC', value: 'DMC' },
		{ label: 'COSMO', value: 'COSMO' }
	];

	function handleImageSelected(event) {
		uploadedImage = event.detail.dataUrl;
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
				// 元の画像を一時的なキャンバスに描画
				const originalCanvas = document.createElement('canvas');
				const originalCtx = originalCanvas.getContext('2d');
				originalCanvas.width = img.width;
				originalCanvas.height = img.height;
				originalCtx.drawImage(img, 0, 0);

				const cellWidthPx = img.width / horizontalCells;
				const cellHeightPx = img.height / verticalCells;

				const availableColors = selectedBrand === 'DMC' ? dmcColors : cosmoColors;
				const patternCells = [];

				// 平均色を取得するための小さな一時キャンバス
				const tinyCanvas = document.createElement('canvas');
				tinyCanvas.width = 1;
				tinyCanvas.height = 1;
				const tinyCtx = tinyCanvas.getContext('2d', { willReadFrequently: true });

				// --- パス1: 全色を使って各セルの最も近い色を仮決定し、色の出現数をカウント --- //
				const colorUsageCounts = new Map();

				for (let y = 0; y < verticalCells; y++) {
					for (let x = 0; x < horizontalCells; x++) {
						const sx = x * cellWidthPx;
						const sy = y * cellHeightPx;
						const sWidth = cellWidthPx;
						const sHeight = cellHeightPx;

						tinyCtx.drawImage(originalCanvas, sx, sy, sWidth, sHeight, 0, 0, 1, 1);
						const pixel = tinyCtx.getImageData(0, 0, 1, 1).data;
						const avgColor = [pixel[0], pixel[1], pixel[2]];

						let minDistance = Infinity;
						let bestMatch = null;

						for (const color of availableColors) {
							const distance = rgbDistance(avgColor, color.RGB);
							if (distance < minDistance) {
								minDistance = distance;
								bestMatch = color;
							}
						}
						colorUsageCounts.set(
							bestMatch.COLOR_CODE,
							(colorUsageCounts.get(bestMatch.COLOR_CODE) || 0) + 1
						);
					}
				}

				// --- 使用する色数を制限する場合、上位の色を選定 --- //
				let finalTargetColors = availableColors;
				if (numColorsToUse > 0 && numColorsToUse < availableColors.length) {
					const sortedColorsByUsage = Array.from(colorUsageCounts.entries())
						.sort(([, countA], [, countB]) => countB - countA) // 出現数で降順ソート
						.slice(0, numColorsToUse) // 上位numColorsToUse個の色コードを取得
						.map(([code]) => code);

					// 上位の色コードに対応するカラーオブジェクトをavailableColorsから取得
					finalTargetColors = availableColors.filter((color) =>
						sortedColorsByUsage.includes(color.COLOR_CODE)
					);
				}

				// --- パス2: 選定された色のみを使って各セルの最終的な色を決定 --- //
				for (let y = 0; y < verticalCells; y++) {
					const row = [];
					for (let x = 0; x < horizontalCells; x++) {
						const sx = x * cellWidthPx;
						const sy = y * cellHeightPx;
						const sWidth = cellWidthPx;
						const sHeight = cellHeightPx;

						tinyCtx.drawImage(originalCanvas, sx, sy, sWidth, sHeight, 0, 0, 1, 1);
						const pixel = tinyCtx.getImageData(0, 0, 1, 1).data;
						const avgColor = [pixel[0], pixel[1], pixel[2]];

						let minDistance = Infinity;
						let bestMatch = null;

						for (const color of finalTargetColors) {
							const distance = rgbDistance(avgColor, color.RGB);
							if (distance < minDistance) {
								minDistance = distance;
								bestMatch = color;
							}
						}
						row.push(bestMatch.COLOR_CODE);
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

	async function downloadImage() {
		const targetElement = document.getElementById('pattern-and-list');
		if (targetElement) {
			html2canvas(targetElement, { scale: 2 }).then((canvas) => {
				const link = document.createElement('a');
				link.download = 'stitch_pattern_and_list.png';
				link.href = canvas.toDataURL('image/png');
				link.click();
			});
		} else {
			alert('ダウンロード対象の要素が見つかりません。');
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
					<Button label="画像としてダウンロード" onClick={downloadImage} bgColor="--melon-green" />
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
