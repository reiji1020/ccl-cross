export function rgbToHex(r: number, g: number, b: number): string {
	return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h: number;
	const v = max;

	const diff = max - min;
	const s = max === 0 ? 0 : diff / max;

	if (max === min) {
		h = 0;
	} else {
		switch (max) {
			case r:
				h = (g - b) / diff + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / diff + 2;
				break;
			default:
				h = (r - g) / diff + 4;
				break;
		}
		h /= 6;
	}

	return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

export function rgbDistance(rgb1: number[], rgb2: number[]): number {
	const dr = rgb1[0] - rgb2[0];
	const dg = rgb1[1] - rgb2[1];
	const db = rgb1[2] - rgb2[2];
	return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function getAverageColor(pixels: Uint8ClampedArray): [number, number, number] {
	let r = 0;
	let g = 0;
	let b = 0;
	const pixelCount = pixels.length / 4;

	for (let i = 0; i < pixels.length; i += 4) {
		r += pixels[i];
		g += pixels[i + 1];
		b += pixels[i + 2];
	}

	return [
		Math.round(r / pixelCount),
		Math.round(g / pixelCount),
		Math.round(b / pixelCount)
	];
}
