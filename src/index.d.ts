export interface CartesianConfig {
    formulaStr: string;
    canvas?: any;
    width?: number;
    height?: number;
    lineColor?: string;
    lineWidth?: number;
    bgColor?: string;
    xRange?: [number, number];
    yRange?: [number, number];
    scale?: number;
    t?: number;
}

export interface PolarConfig {
    formulaStr: string;
    canvas?: any;
    width?: number;
    height?: number;
    lineColor?: string;
    lineWidth?: number;
    bgColor?: string;
    scale?: number;
    tRange?: [number, number];
    steps?: number;
    t?: number;
}

export interface ParametricConfig {
    formulaXStr: string;
    formulaYStr: string;
    canvas?: any;
    width?: number;
    height?: number;
    lineColor?: string;
    lineWidth?: number;
    bgColor?: string;
    scale?: number;
    tRange?: [number, number];
    steps?: number;
    t?: number;
}

export interface ComplexConfig {
    formulaStr: string;
    canvas?: any;
    width?: number;
    height?: number;
    lineColor?: string;
    lineWidth?: number;
    bgColor?: string;
    scale?: number;
    xRange?: [number, number];
    steps?: number;
    t?: number;
}

export interface AnimationLayer {
    type?: 'cartesian' | 'polar' | 'parametric' | 'complex';
    formulaStr?: string;
    formulaXStr?: string;
    formulaYStr?: string;
    lineColor?: string;
    lineWidth?: number;
    steps?: number;
    scale?: number;
    speed?: number;
}

export interface LoopAnimateConfig {
    layers?: AnimationLayer[];
    canvas?: any;
    width?: number;
    height?: number;
    bgColor?: string;
    scale?: number;
    duration?: number;
    showAxis?: boolean;
    showGrid?: boolean;
    gpu?: boolean;
    speed?: number;
    onFrame?: (ctx: any, t: number) => void;
    // Layer properties can also be directly on config for single-layer animation
    type?: 'cartesian' | 'polar' | 'parametric' | 'complex';
    formulaStr?: string;
    formulaXStr?: string;
    formulaYStr?: string;
    lineColor?: string;
    lineWidth?: number;
    steps?: number;
}

export interface Roots {
    xRoots: number[];
    yRoots: number[];
    iotaRoots: number[];
}

export interface DrawRootsConfig {
    type?: 'cartesian' | 'parametric' | 'complex';
    formula?: string | Function;
    formulaX?: string | Function;
    formulaY?: string | Function;
    width?: number;
    height?: number;
    scale?: number;
    xColor?: string;
    yColor?: string;
    iotaColor?: string;
    radius?: number;
}

export interface Extrema {
    maxima: { x: number; y: number }[];
    minima: { x: number; y: number }[];
}

export interface DrawExtremaConfig {
    width?: number;
    height?: number;
    scale?: number;
    maxColor?: string;
    minColor?: string;
    radius?: number;
}

export interface TextConfig {
    point?: [number, number];
    color?: string;
    font?: string;
    scale?: number;
}

export interface CoordinatesConfig {
    scale?: number;
    color?: string;
    font?: string;
}

export interface GraphlyjsInstance {
    drawCartesian(config: CartesianConfig): any;
    drawPolar(config: PolarConfig): any;
    drawParametric(config: ParametricConfig): any;
    drawComplex(config: ComplexConfig): any;
    loopAnimate(config: LoopAnimateConfig): { canvas: any; stop: () => void };

    drawAxis(ctx: any, width?: number, height?: number): void;
    drawGrid(ctx: any, width?: number, height?: number, gridSpacing?: number, lineColor?: string, lineWidth?: number): void;
    addText(ctx: any, text: string, config?: TextConfig): void;
    
    findRoots(formula: string | Function, range?: [number, number], steps?: number, t?: number, precision?: number): Roots;
    drawRoots(ctx: any, roots: Roots, config: DrawRootsConfig): void;
    
    findExtrema(formula: string | Function, range?: [number, number], steps?: number, t?: number): Extrema;
    drawExtrema(ctx: any, extrema: Extrema, config: DrawExtremaConfig): void;
    
    showCoordinates(canvas: any, config?: CoordinatesConfig): () => void;

    // Core internal methods (exposed in core/index.js)
    createCanvas: (width: number, height: number) => any;
    _createFormula: (formulaStr: string, variables: string[], options?: any) => Function | null;
    _generateCartesianPoints: (config: any) => any;
    _generatePolarPoints: (config: any) => any;
    _generateParametricPoints: (config: any) => any;
    _generateComplexPoints: (config: any) => any;
    _drawGraph: (points: any, ctx: any, options?: any) => void;
    _drawGraphWebGL: (points: any, canvas: any, options?: any) => void;
    _drawGraphGPUEvaluated: (glConfig: any, canvas: any, options?: any) => void;
}

declare const Graphlyjs: GraphlyjsInstance;
export default Graphlyjs;
export { Graphlyjs };
