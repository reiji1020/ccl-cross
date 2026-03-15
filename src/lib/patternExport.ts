import type { PatternData, PatternExport, ThreadColor } from './types';

const SYMBOL_SET = [
	'●',
	'■',
	'▲',
	'◆',
	'★',
	'✕',
	'○',
	'□',
	'△',
	'◇',
	'✦',
	'＋',
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
	'O',
	'P',
	'Q',
	'R',
	'S',
	'T',
	'U',
	'V',
	'W',
	'X',
	'Y',
	'Z',
	'0',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9'
];

function escapeXml(value: string | number): string {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function buildSymbol(index: number): string {
	if (index < SYMBOL_SET.length) {
		return SYMBOL_SET[index];
	}

	const first = SYMBOL_SET[index % SYMBOL_SET.length];
	const second = SYMBOL_SET[Math.floor(index / SYMBOL_SET.length) % SYMBOL_SET.length];
	return `${second}${first}`;
}

function hexToRgb(hexColor: string): { r: number; g: number; b: number } {
	const normalized = hexColor.replace('#', '');
	const safeHex =
		normalized.length === 3
			? normalized
					.split('')
					.map((char) => char + char)
					.join('')
			: normalized;

	const value = Number.parseInt(safeHex, 16);
	return {
		r: (value >> 16) & 255,
		g: (value >> 8) & 255,
		b: value & 255
	};
}

function buildTintColor(hexColor: string, amount = 0.82): string {
	const { r, g, b } = hexToRgb(hexColor);
	const tint = (channel: number) => Math.round(channel + (255 - channel) * amount);
	return `rgb(${tint(r)}, ${tint(g)}, ${tint(b)})`;
}

function collectUsedColors(patternData: PatternData, targetColors: ThreadColor[]): Array<ThreadColor & { count: number }> {
	const colorMap = new Map(targetColors.map((color) => [color.COLOR_CODE, color]));
	const usageCounts = new Map<string, number>();

	for (const row of patternData.cells) {
		for (const code of row) {
			usageCounts.set(code, (usageCounts.get(code) || 0) + 1);
		}
	}

	return Array.from(usageCounts.entries())
		.map(([code, count]) => ({
			...colorMap.get(code)!,
			count
		}))
		.sort((a, b) => a.COLOR_CODE.localeCompare(b.COLOR_CODE, undefined, { numeric: true }));
}

export function buildPatternExportSvg(
	patternData: PatternData,
	allDmcColors: ThreadColor[],
	allCosmoColors: ThreadColor[]
): PatternExport {
	const targetColors = patternData.brand === 'DMC' ? allDmcColors : allCosmoColors;
	const usedColors = collectUsedColors(patternData, targetColors);
	const symbolMap = new Map(usedColors.map((color, index) => [color.COLOR_CODE, buildSymbol(index)]));
	const usedColorMap = new Map(usedColors.map((color) => [color.COLOR_CODE, color]));

	const cols = patternData.gridSize[0];
	const rows = patternData.gridSize[1];
	const cellSize = 24;
	const margin = 32;
	const headerHeight = 56;
	const legendTopGap = 28;
	const legendRowHeight = 24;
	const legendWidth = 340;
	const gridWidth = cols * cellSize;
	const gridHeight = rows * cellSize;
	const legendHeight = 40 + usedColors.length * legendRowHeight;
	const width = Math.max(gridWidth + margin * 2, legendWidth + margin * 2);
	const height = headerHeight + gridHeight + legendTopGap + legendHeight + margin;
	const gridOriginX = Math.floor((width - gridWidth) / 2);
	const gridOriginY = headerHeight;
	const legendX = margin;
	const legendY = headerHeight + gridHeight + legendTopGap;

	const parts = [
		`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
		'<rect width="100%" height="100%" fill="#ffffff" />',
		`<text x="${margin}" y="28" font-family="'Segoe UI Symbol', 'Arial Unicode MS', sans-serif" font-size="22" font-weight="700" fill="#222222">CROSS Pattern</text>`,
		`<text x="${margin}" y="48" font-family="'Segoe UI', sans-serif" font-size="12" fill="#555555">${escapeXml(`${patternData.brand} / ${cols} x ${rows}`)}</text>`
	];

	for (let y = 10; y < rows; y += 10) {
		const py = gridOriginY + y * cellSize + cellSize / 2 + 4;
		parts.push(
			`<text x="${gridOriginX - 10}" y="${py}" text-anchor="end" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="#444444">${y}</text>`
		);
	}

	for (let x = 10; x < cols; x += 10) {
		const px = gridOriginX + x * cellSize + cellSize / 2;
		parts.push(
			`<text x="${px}" y="${gridOriginY - 10}" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="#444444">${x}</text>`
		);
	}

	for (let y = 0; y <= rows; y++) {
		const strokeWidth = y % 10 === 0 ? 1.6 : 0.7;
		const py = gridOriginY + y * cellSize;
		parts.push(
			`<line x1="${gridOriginX}" y1="${py}" x2="${gridOriginX + gridWidth}" y2="${py}" stroke="${y % 10 === 0 ? '#4d4d4d' : '#8a8a8a'}" stroke-width="${strokeWidth}" />`
		);
	}

	for (let x = 0; x <= cols; x++) {
		const strokeWidth = x % 10 === 0 ? 1.6 : 0.7;
		const px = gridOriginX + x * cellSize;
		parts.push(
			`<line x1="${px}" y1="${gridOriginY}" x2="${px}" y2="${gridOriginY + gridHeight}" stroke="${x % 10 === 0 ? '#4d4d4d' : '#8a8a8a'}" stroke-width="${strokeWidth}" />`
		);
	}

	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < cols; x++) {
			const code = patternData.cells[y][x];
			const symbol = symbolMap.get(code) || '?';
			const color = usedColorMap.get(code);
			const centerX = gridOriginX + x * cellSize + cellSize / 2;
			const centerY = gridOriginY + y * cellSize + cellSize / 2 + 5;
			const fontSize = symbol.length > 1 ? 11 : 15;
			const cellX = gridOriginX + x * cellSize;
			const cellY = gridOriginY + y * cellSize;
			const backgroundColor = buildTintColor(color?.RGB_COLOR || '#ffffff');

			parts.push(
				`<rect x="${cellX}" y="${cellY}" width="${cellSize}" height="${cellSize}" fill="${escapeXml(backgroundColor)}" />`
			);
			parts.push(
				`<text x="${centerX}" y="${centerY}" text-anchor="middle" font-family="'Segoe UI Symbol', 'Arial Unicode MS', sans-serif" font-size="${fontSize}" font-weight="700" fill="#111111">${escapeXml(symbol)}</text>`
			);
		}
	}

	parts.push(
		`<text x="${legendX}" y="${legendY}" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="#222222">Legend</text>`
	);
	parts.push(
		`<text x="${legendX}" y="${legendY + 18}" font-family="'Segoe UI', sans-serif" font-size="11" fill="#666666">Symbol / Code / Name / Count</text>`
	);

	usedColors.forEach((color, index) => {
		const y = legendY + 42 + index * legendRowHeight;
		const symbol = symbolMap.get(color.COLOR_CODE) || '?';
		const colorName = color.COLOR_NAME_EN || '-';
		parts.push(
			`<text x="${legendX}" y="${y}" font-family="'Segoe UI Symbol', 'Arial Unicode MS', sans-serif" font-size="14" font-weight="700" fill="#111111">${escapeXml(symbol)}</text>`
		);
		parts.push(
			`<rect x="${legendX + 26}" y="${y - 11}" width="14" height="14" fill="${escapeXml(color.RGB_COLOR || '#ffffff')}" stroke="#999999" stroke-width="0.8" />`
		);
		parts.push(
			`<text x="${legendX + 50}" y="${y}" font-family="'Segoe UI', sans-serif" font-size="12" fill="#222222">${escapeXml(color.COLOR_CODE)}</text>`
		);
		parts.push(
			`<text x="${legendX + 96}" y="${y}" font-family="'Segoe UI', sans-serif" font-size="12" fill="#222222">${escapeXml(colorName)}</text>`
		);
		parts.push(
			`<text x="${width - margin}" y="${y}" text-anchor="end" font-family="'Segoe UI', sans-serif" font-size="12" fill="#222222">${escapeXml(color.count)}</text>`
		);
	});

	parts.push('</svg>');

	return {
		filename: `stitch_pattern_${patternData.brand.toLowerCase()}_${cols}x${rows}.svg`,
		svg: parts.join('')
	};
}
