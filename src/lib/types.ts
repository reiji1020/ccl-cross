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

export type SymbolColorMode = 'color' | 'black';

export type PatternExportOptions = {
	symbolColorMode: SymbolColorMode;
};

export type PatternJsonExportOptions = PatternExportOptions & {
	maxColors: number;
	createdAt?: string;
};

export type ExportedPatternJson = {
	format: 'ccl-cross-pattern';
	version: '1.0';
	createdAt: string;
	generator: {
		name: 'CROSS';
		url: string;
	};
	pattern: {
		width: number;
		height: number;
		brand: Brand;
		cells: string[][];
	};
	palette: Array<{
		code: string;
		name: string;
		rgb: string;
		count: number;
		symbol: string;
	}>;
	settings: {
		maxColors: number;
		symbolColorMode: SymbolColorMode;
	};
};

export type ImageSelectedDetail = {
	file: File;
	dataUrl: string;
};
