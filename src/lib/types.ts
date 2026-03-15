export type Brand = 'DMC' | 'COSMO';

export type ThreadColor = {
	BRAND: Brand;
	COLOR_CODE: string;
	COLOR_NAME_EN: string;
	RGB_COLOR: string;
	RGB: [number, number, number];
	HSV: [number, number, number];
};

export type PatternData = {
	gridSize: [number, number];
	brand: Brand;
	cells: string[][];
};

export type PatternExport = {
	filename: string;
	svg: string;
};

export type ImageSelectedDetail = {
	file: File;
	dataUrl: string;
};
