window.addEventListener("error", (event) => {
  const pre = document.createElement("pre");
  pre.id = "gp-error";
  pre.style.cssText = "position:fixed;left:310px;top:8px;color:#ff6b6b;z-index:99;white-space:pre-wrap;font:12px/1.4 monospace";
  pre.textContent = `${event.message}\n${event.filename}:${event.lineno}`;
  document.body.appendChild(pre);
});

/**
 * Preset palette. Known vivid swatches sit in a fixed wheel order;
 * anything else is appended by walking nearest neighbors in LAB.
 */
const PALETTES = [
  {
    id: "vivid",
    name: "Vivid",
    colors: [
      "#AD4BFE",
      "#FF009D",
      "#FFB6F6",
      "#FF0000",
      "#FFC700",
      "#00E1C3",
      "#007441",
      "#1ADEFF",
      "#007890",
      "#0031B7",
    ],
  },
];

const COLOR_ORDER = [
  "#AD4BFE",
  "#FF009D",
  "#FFB6F6",
  "#FF0000",
  "#FFC700",
  "#00E1C3",
  "#007441",
  "#1ADEFF",
  "#007890",
  "#0031B7",
];

const COLOR_CONNECTIONS = {
  "#AD4BFE": new Set(["#FF009D", "#FFB6F6", "#FF0000", "#1ADEFF", "#0031B7"]),
  "#FF009D": new Set(["#AD4BFE", "#FFB6F6", "#FF0000", "#FFC700", "#1ADEFF"]),
  "#FFB6F6": new Set(["#AD4BFE", "#FF009D", "#FF0000", "#FFC700"]),
  "#FF0000": new Set(["#AD4BFE", "#FF009D", "#FFB6F6", "#FFC700"]),
  "#FFC700": new Set(["#FFB6F6", "#FF0000", "#00E1C3", "#007441", "#1ADEFF"]),
  "#00E1C3": new Set(["#FFC700", "#007441", "#1ADEFF", "#007890", "#0031B7"]),
  "#007441": new Set(["#FFC700", "#00E1C3", "#1ADEFF", "#0031B7"]),
  "#1ADEFF": new Set(["#AD4BFE", "#FF009D", "#00E1C3", "#007441", "#007890", "#0031B7"]),
  "#007890": new Set(["#00E1C3", "#1ADEFF", "#0031B7"]),
  "#0031B7": new Set(["#AD4BFE", "#FF009D", "#00E1C3", "#007441", "#1ADEFF", "#007890"]),
};

const PATH_JITTER = 0.12;
const LETTER_SHAPE_KEYS = [
  "pathScale",
  "ellipseSize",
  "spacing",
  "jitterRadius",
  "geoVLegGap",
  "geoVLegAspect1",
  "geoVLegAspect2",
  "geoVLegRotation1",
  "geoVLegRotation2",
  "geoVLeftW",
  "geoVRightW",
  "geoVYShiftLeg",
  "geoVYShiftSign",
  "geoVYShiftAmount",
  "geoDBowlRotation",
  "geoDBowlShiftX",
  "geoDBowlShiftY",
];
const LETTER_MODES = ["blobby", "circles", "geometric"];
const GEOMETRIC_LETTERS = new Set(["moon", "v", "sweep", "cee"]);
const LETTER_SHAPE_DEFAULTS = {
  blobby: {
    pathScale: 0.37,
    ellipseSize: 175,
    spacing: 0.02,
    jitterRadius: PATH_JITTER,
    geoVLegGap: 40,
    geoVLegAspect1: 1.9,
    geoVLegAspect2: 1.9,
    geoVLegRotation1: 40.5,
    geoVLegRotation2: -48.5,
    geoVLeftW: 342,
    geoVRightW: 342,
    geoVYShiftLeg: null,
    geoVYShiftSign: 1,
    geoVYShiftAmount: 40,
    geoDBowlRotation: 0,
    geoDBowlShiftX: 0,
    geoDBowlShiftY: 0,
  },
  circles: {
    pathScale: 0.4,
    ellipseSize: 131,
    spacing: 0.67,
    jitterRadius: 0.31,
    geoVLegGap: 40,
    geoVLegAspect1: 1.9,
    geoVLegAspect2: 1.9,
    geoVLegRotation1: 40.5,
    geoVLegRotation2: -48.5,
    geoVLeftW: 342,
    geoVRightW: 342,
    geoVYShiftLeg: null,
    geoVYShiftSign: 1,
    geoVYShiftAmount: 40,
    geoDBowlRotation: 0,
    geoDBowlShiftX: 0,
    geoDBowlShiftY: 0,
  },
  geometric: {
    pathScale: 0.58,
    ellipseSize: 175,
    spacing: 0.02,
    jitterRadius: PATH_JITTER,
    geoVLegGap: 40,
    geoVLegAspect1: 1.9,
    geoVLegAspect2: 1.9,
    geoVLegRotation1: 40.5,
    geoVLegRotation2: -48.5,
    geoVLeftW: 342,
    geoVRightW: 342,
    geoVYShiftLeg: null,
    geoVYShiftSign: 1,
    geoVYShiftAmount: 40,
    geoDBowlRotation: 0,
    geoDBowlShiftX: 0,
    geoDBowlShiftY: 0,
  },
};
const letterModeShape = {
  blobby: { ...LETTER_SHAPE_DEFAULTS.blobby },
  circles: { ...LETTER_SHAPE_DEFAULTS.circles },
  geometric: { ...LETTER_SHAPE_DEFAULTS.geometric },
};

const TEMPLATES = [
  {
    id: "moon",
    name: "D",
    closed: true,
    preserveAspect: true,
    anchors: [
      { x: 1.01436, y: 68.3842 },
      { x: 6.45019, y: 35.7577 },
      { x: 8.84906, y: 1.87068 },
      { x: 49.9073, y: 18.2008 },
      { x: 32.773, y: 68.3842 },
    ],
    segments: [
      [1.01436, 68.3842, 0.710521, 67.108, 5.31636, 55.82, 6.45019, 35.7577],
      [6.45019, 35.7577, 7.78624, 12.1172, 2.25814, 3.44611, 8.84906, 1.87068],
      [8.84906, 1.87068, 23.8215, -1.70818, 41.1526, 6.14922, 49.9073, 18.2008],
      [49.9073, 18.2008, 60.8844, 33.3117, 53.7164, 60.7471, 32.773, 68.3842],
      [32.773, 68.3842, 21.7663, 72.3978, 2.01324, 72.5797, 1.01436, 68.3842],
    ],
    bbox: { minX: 0.710521, minY: -1.70818, maxX: 60.8844, maxY: 72.5797 },
  },
  {
    id: "sweep",
    name: "S",
    closed: false,
    preserveAspect: true,
  },
  {
    id: "v",
    name: "V",
    closed: false,
    preserveAspect: true,
  },
  {
    id: "cee",
    name: "C",
    closed: false,
    preserveAspect: true,
  },
];

const SWATCH_SIZE = 28;
const SWATCH_GAP = 2;
const SWATCH_HALO = 2;
const SHAPE_STROKE_PX = 6;
const EDGE_LABEL_CHARS = ["D", "S", "V", "C"];
const EDGE_LABEL_S69 = "69";
const DEFAULT_GEO_LABEL_CORNER_INDICES = [0, 1, 2, 3];
const DEFAULT_GEO_S_LABEL_CORNER_INDICES = [0, 1, 4, 5];
const DEFAULT_GEO_S69_LABEL_CORNER_INDEX = 2;
const DEFAULT_GEO_D_S69_LABEL_CORNER_INDEX = 4;
const EXTREME_CORNER_NAMES = ["topLeft", "topRight", "bottomRight", "bottomLeft"];
const LABEL_ANCHOR_NAMES = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
const DEFAULT_MANUAL_LABEL_ANCHOR = "center";
const EDGE_LABEL_GAP = [20, 150];
const EDGE_LABEL_GAP_RANDOM = [70, 120];
const EDGE_LABEL_SIZE = 20;
const EDGE_LABEL_ACTIVE_SIZE = 18;
const EDGE_LABEL_FONT = `bold ${EDGE_LABEL_SIZE}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
const EDGE_LABEL_ACTIVE_FONT = `bold ${EDGE_LABEL_ACTIVE_SIZE}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
const EDGE_LABEL_ACTIVE_RADIUS = 15;
const EDGE_LABEL_OFFSET = [-100, 100];
const EDGE_LABEL_START = [-400, 400];
const EDGE_LABEL_START_S = [-600, 600];
const GUIDELINE_HEIGHT = 380;
const GUIDELINE_OVERFLOW = 20;
const MAX_GRADIENT_COLORS = 5;
const GEO_D_STEM_W = 184;
const GEO_D_H = 380;
const GEO_D_BOWL_SHIFT_X = 25;
const GEO_D_BOWL_SHIFT_Y = [-30, 75];
const GEO_D_BOWL_ROTATION = [-11, 11];
const GEO_S_CENTER_X = 200;
const GEO_S_CENTER_Y = 190;
const GEO_S_GROUP_ROT_DEG = -20;
const GEO_S_STROKE = [160, 260];
const GEO_S_ROT = [-12, 12];
const GEO_S_DISTANCE = [-120, 120];
const GEO_S_OVERLAP = [0, 80];
const GEO_C_ANCHOR_X = 100;
const GEO_C_ANCHOR_Y = 0;
const GEO_C_REFLECT_Y = 220;
const GEO_C_STROKE = [160, 260];
const GEO_C_ROT = [-12, 12];
const GEO_C_BASE_BOT_X = -57;
const GEO_C_DISTANCE = [-120, 120];
const GEO_C_OVERLAP = [0, 80];
const GEO_C_OFFSET = [-800, 800];
const GEO_C_KNOB_ARM = 56;
const GEO_C_JOINT_HIT = 24;
const GEO_C_PIECE_HIT_PAD = 18;
const GEO_C_TOP_CURVES = [
  { cp1: { x: 0, y: 110.457 }, cp2: { x: 89.543, y: 200 }, end: { x: 200, y: 200 } },
  { cp1: { x: 255.228, y: 200 }, cp2: { x: 305.228, y: 177.614 }, end: { x: 341.421, y: 141.421 } },
];
const GEO_V_H = 380;
const GEO_V_CENTER_X = 200;
const GEO_V_LEG_W = [300, 384.36];
const GEO_V_LEG_ASPECT = [1.2, 2.25];
const GEO_V_LEFT_ANGLE = [37, 44];
const GEO_V_RIGHT_ANGLE = [-52, -45];
const GEO_V_LEG_GAP = [-120, 160];
const GEO_V_LEG_GAP_INWARD = [-120, -45];
const GEO_V_LEG_GAP_OUTWARD = [45, 120];
const GEO_V_LEG_GAP_Y_SHIFT_UP = [-24, 65];
const GEO_V_LEG_Y_SHIFT = [15, 80];
const GEO_V_Y_SHIFT_GAP_THRESHOLD = -10;
const DRAG_THRESHOLD_PX = 8;
const RADIAL_INSET = 10;
const RELAX_MAX_GAP = 1;
const RELAX_PUSH = 0.85;
const RELAX_PULL = 0.4;
const RELAX_ITERS = 8;

const CREATION_DPI = 300;
const SHEET_MARGIN_IN = 0.25;
const STICKER_GAP_IN = 0.125;
const SHEET_CELL_CONTENT_INSET_RATIO = 0.06;
const SHEET_STICKERS_PER_PAGE = 6;
const SHEET_COUNT_MAX = 4;

const PAPER_SIZES = {
  "4x6": { name: "4 × 6 in", widthIn: 4, heightIn: 6 },
  letter: { name: "US Letter", widthIn: 8.5, heightIn: 11 },
  a4: { name: "A4", widthIn: 8.27, heightIn: 11.69 },
  legal: { name: "US Legal", widthIn: 8.5, heightIn: 14 },
  tabloid: { name: "Tabloid", widthIn: 11, heightIn: 17 },
};

function activeEdgeLabelChars(includeS69 = state.edgeLabelS69) {
  return includeS69
    ? [...EDGE_LABEL_CHARS, EDGE_LABEL_S69]
    : EDGE_LABEL_CHARS;
}

function createDefaultManualLabelPlacements(includeS69 = state.edgeLabelS69) {
  return activeEdgeLabelChars(includeS69).map((char) => ({
    char,
    x: null,
    y: null,
    rotation: 0,
    anchor: DEFAULT_MANUAL_LABEL_ANCHOR,
    placed: false,
  }));
}

const COMPOSITION_STATE_KEYS = [
  "template",
  "palette",
  "ellipseSize",
  "spacing",
  "pathScale",
  "jitterRadius",
  "fillMode",
  "letterMode",
  "radialEdge",
  "edgeLabels",
  "edgeLabelOffset",
  "edgeLabelStart",
  "edgeLabelGap",
  "edgeLabelReversed",
  "edgeLabelS69",
  "relaxAmount",
  "relaxVariation",
  "geoVLegGap",
  "geoVLegAspect1",
  "geoVLegAspect2",
  "geoVLegRotation1",
  "geoVLegRotation2",
  "geoVLeftW",
  "geoVRightW",
  "geoVYShiftLeg",
  "geoVYShiftSign",
  "geoVYShiftAmount",
  "geoDBowlRotation",
  "geoDBowlShiftX",
  "geoDBowlShiftY",
  "geoSStrokeWeight",
  "geoSTopRotation",
  "geoSBotRotation",
  "geoSDistance",
  "geoSOverlap",
  "geoCStrokeWeight",
  "geoCTopRotation",
  "geoCBotRotation",
  "geoCDistance",
  "geoCOverlap",
  "geoCTopOffsetX",
  "geoCTopOffsetY",
  "geoCBotOffsetX",
  "geoCBotOffsetY",
  "geoSTopOffsetX",
  "geoSTopOffsetY",
  "geoSBotOffsetX",
  "geoSBotOffsetY",
  "geoLabelCornerIndices",
  "geoManualLabelLayoutMode",
  "geoManualLabelPlacements",
  "geoManualLabelEditIndex",
  "rescaleLetters",
];

const state = {
  template: "sweep",
  palette: "vivid",
  colorPath: [0, 1, 2, 3],
  ellipseSize: LETTER_SHAPE_DEFAULTS.blobby.ellipseSize,
  spacing: LETTER_SHAPE_DEFAULTS.blobby.spacing,
  pathScale: LETTER_SHAPE_DEFAULTS.blobby.pathScale,
  jitterRadius: LETTER_SHAPE_DEFAULTS.blobby.jitterRadius,
  fillMode: "circles",
  letterMode: "blobby",
  radialEdge: "left",
  debug: false,
  sheetDebug: false,
  guidelines: false,
  rescaleLetters: true,
  edgeLabels: true,
  edgeLabelOffset: -30,
  edgeLabelStart: 0,
  edgeLabelGap: 60,
  edgeLabelReversed: false,
  edgeLabelS69: false,
  geoLabelCornerIndices: DEFAULT_GEO_S_LABEL_CORNER_INDICES.slice(),
  geoManualLabelLayoutMode: "fixed",
  geoManualLabelPlacements: createDefaultManualLabelPlacements(false),
  geoManualLabelEditIndex: 0,
  relaxAmount: 0,
  relaxVariation: 0,
  geoVLegGap: LETTER_SHAPE_DEFAULTS.geometric.geoVLegGap,
  geoVLegAspect1: LETTER_SHAPE_DEFAULTS.geometric.geoVLegAspect1,
  geoVLegAspect2: LETTER_SHAPE_DEFAULTS.geometric.geoVLegAspect2,
  geoVLegRotation1: LETTER_SHAPE_DEFAULTS.geometric.geoVLegRotation1,
  geoVLegRotation2: LETTER_SHAPE_DEFAULTS.geometric.geoVLegRotation2,
  geoVLeftW: LETTER_SHAPE_DEFAULTS.geometric.geoVLeftW,
  geoVRightW: LETTER_SHAPE_DEFAULTS.geometric.geoVRightW,
  geoVYShiftLeg: LETTER_SHAPE_DEFAULTS.geometric.geoVYShiftLeg,
  geoVYShiftSign: LETTER_SHAPE_DEFAULTS.geometric.geoVYShiftSign,
  geoVYShiftAmount: LETTER_SHAPE_DEFAULTS.geometric.geoVYShiftAmount,
  geoDBowlRotation: LETTER_SHAPE_DEFAULTS.geometric.geoDBowlRotation,
  geoDBowlShiftX: LETTER_SHAPE_DEFAULTS.geometric.geoDBowlShiftX,
  geoDBowlShiftY: LETTER_SHAPE_DEFAULTS.geometric.geoDBowlShiftY,
  geoSStrokeWeight: 190,
  geoSTopRotation: 0,
  geoSBotRotation: 0,
  geoSDistance: 0,
  geoSOverlap: 0,
  geoCStrokeWeight: 190,
  geoCTopRotation: 0,
  geoCBotRotation: 0,
  geoCDistance: 0,
  geoCOverlap: 0,
  geoCTopOffsetX: 0,
  geoCTopOffsetY: 0,
  geoCBotOffsetX: 0,
  geoCBotOffsetY: 0,
  geoSTopOffsetX: 0,
  geoSTopOffsetY: 0,
  geoSBotOffsetX: 0,
  geoSBotOffsetY: 0,
  exporting: false,
  appMode: "editor",
  sheetRendering: false,
};

let creationSheet = {
  paperSize: "4x6",
  stickerSizeIn: 1.5,
  sheetCount: 4,
  sheets: [],
  previewStack: null,
  cachedImage: null,
  previewScale: 1,
  editingIndex: -1,
  sourceCanvasW: 0,
  sourceCanvasH: 0,
};

let editorModeBackup = null;

let orderedPalette = [];
let activeColors = [];
let wheelLayout = { radius: 0, size: 0, cx: 0, cy: 0 };
let pathPoints = [];
let generatedPath = null;
let canvasPath = {
  segments: [],
  anchors: [],
  origins: [],
  unmap: null,
  hideHandles: false,
  geometric: [],
  silhouetteCache: null,
  guidelines: null,
};
let pathEdit = { drag: null, hover: null };
let geoManualLabelDrag = null;
const MANUAL_LABEL_HIT_RADIUS = 18;
let labelNotice = "";
const PATH_LABELS = loadPathLabels();
let relaxState = {
  from: null,
  to: null,
  weights: null,
};

function setup() {
  const holder = document.getElementById("canvas-holder");
  const canvas = createCanvas(
    Math.max(320, holder.clientWidth),
    Math.max(320, holder.clientHeight)
  );
  canvas.parent("canvas-holder");
  pixelDensity(window.devicePixelRatio || 1);
  noLoop();
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get("template") === "vee" ? "v" : params.get("template");
  if (TEMPLATES.some((item) => item.id === templateId)) {
    state.template = templateId;
  }
  if (params.get("debug") === "1") {
    state.debug = true;
  }
  const fillMode = params.get("fill");
  if (fillMode === "shape" || fillMode === "circles" || fillMode === "split") {
    state.fillMode = fillMode;
  }
  const letterMode = params.get("shapes");
  if (LETTER_MODES.includes(letterMode)) {
    state.letterMode = letterMode;
  }
  if (!availableLetterModes(state.template).includes(state.letterMode)) {
    state.letterMode = "blobby";
  }
  applyLetterModeShape(state.letterMode);
  bindUi();
  window.addEventListener("keydown", onKeyDown);
  window.PATH_LABELS = PATH_LABELS;
  bindDebugLabelsUi();
  applyPalette(state.palette, { redraw: false });
  randomizeComposition();
  window.getRelaxStats = getRelaxStats;
  syncAppModeUi();
  updateCreationLayoutInfo();
}

function windowResized() {
  if (state.appMode === "sheet") {
    if (hasGeneratedSheets()) {
      renderCreationSheetPreview();
    } else {
      const holder = document.getElementById("canvas-holder");
      resizeCanvas(Math.max(320, holder.clientWidth), Math.max(320, holder.clientHeight));
      redraw();
    }
    return;
  }
  const holder = document.getElementById("canvas-holder");
  resizeCanvas(holder.clientWidth, holder.clientHeight);
  rebuildPath();
  redraw();
}

function supportsManualLabelLayout() {
  return usingGeometric() || state.letterMode === "circles";
}

function usingGeometric() {
  return Boolean(generatedPath && generatedPath.kind === "geometric");
}

function geometricSplitFillAvailable() {
  return state.letterMode === "geometric" && GEOMETRIC_LETTERS.has(state.template);
}

function isThickStrokePrimitive(item) {
  return item.type === "lStroke" || item.type === "bezierStroke";
}

function usingGeometricThickStroke() {
  const primitives = canvasPath.geometric || [];
  return primitives.length > 0 && primitives.every(isThickStrokePrimitive);
}

function usingGeometricSStroke() {
  const primitives = canvasPath.geometric || [];
  return state.template === "sweep"
    && primitives.length > 0
    && primitives.every((item) => item.type === "bezierStroke");
}

function usingGeometricCStroke() {
  const primitives = canvasPath.geometric || [];
  return state.template === "cee"
    && primitives.length > 0
    && primitives.every((item) => item.type === "bezierStroke");
}

function usingGeometricBezierDebug() {
  return usingGeometricCStroke() || usingGeometricSStroke();
}

function usingGeometricLStroke() {
  return usingGeometricThickStroke();
}

function usingVeeCircles() {
  return state.template === "v" && state.letterMode === "circles";
}

function usingMoonCircles() {
  return state.template === "moon" && state.letterMode === "circles";
}

function drawStickerContent() {
  if (usingGeometric()) {
    drawGeometricLetter();
    drawGeometricEdgeLabels();
  } else {
    drawShapeStroke();
    if (state.fillMode === "shape") {
      drawShapeFill();
    } else {
      drawCircleFill();
    }
    drawBlobbyEdgeLabels();
  }
  if (supportsManualLabelLayout()) {
    drawManualLabelPlacementOverlay();
  }
}

function draw() {
  if (state.appMode === "sheet" && !state.sheetRendering) {
    if (creationSheet.cachedImage) {
      if (state.exporting) {
        clear();
      } else {
        background(255);
      }
      drawingContext.drawImage(creationSheet.cachedImage, 0, 0, width, height);
      if (state.sheetDebug) drawSheetSizeDebugOverlay();
    } else {
      background(11);
    }
    return;
  }
  if (state.exporting) {
    clear();
  } else {
    background(11);
  }
  drawStickerContent();

  if (state.guidelines && !state.exporting) drawGuidelines();
  if (state.debug && !state.exporting) drawDebug();
}

function drawGuidelines() {
  const lines = canvasPath.guidelines;
  if (!lines) return;
  push();
  noFill();
  stroke(255, 220, 0);
  strokeWeight(2);
  drawingContext.setLineDash([8, 6]);
  line(lines.cap[0], lines.cap[1], lines.cap[2], lines.cap[3]);
  line(lines.baseline[0], lines.baseline[1], lines.baseline[2], lines.baseline[3]);
  drawingContext.setLineDash([]);
  pop();
}

function unionShapePath(radius) {
  const shape = new Path2D();
  for (let i = 0; i < pathPoints.length; i++) {
    const p = pathPoints[i];
    shape.moveTo(p.x + radius, p.y);
    shape.arc(p.x, p.y, radius, 0, Math.PI * 2);
  }
  return shape;
}

function drawShapeStroke() {
  if (pathPoints.length === 0) return;
  const ctx = drawingContext;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fill(unionShapePath(state.ellipseSize / 2 + SHAPE_STROKE_PX));
  ctx.restore();
}

function drawCircleFill() {
  noStroke();
  for (let i = 0; i < pathPoints.length; i++) {
    const t = pathPoints.length === 1 ? 0 : i / (pathPoints.length - 1);
    const c = colorAt(t);
    fill(c[0], c[1], c[2]);
    const p = pathPoints[i];
    ellipse(p.x, p.y, state.ellipseSize, state.ellipseSize);
  }
}

function drawShapeFill() {
  if (pathPoints.length === 0) return;
  const ctx = drawingContext;
  const shape = unionShapePath(state.ellipseSize / 2);

  ctx.save();
  ctx.clip(shape);
  ctx.fillStyle = createRadialPaletteGradient(ctx);
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function activeTemplateLetter() {
  const template = TEMPLATES.find((item) => item.id === state.template);
  return template ? template.name : EDGE_LABEL_CHARS[0];
}

function pointAtPolylineDistance(points, distance, closed) {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return { x: points[0].x, y: points[0].y };

  const segments = [];
  let total = 0;
  const segmentCount = closed ? points.length : points.length - 1;
  for (let i = 0; i < segmentCount; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segments.push({ a, b, len, start: total, end: total + len });
    total += len;
  }
  if (total === 0) return { x: points[0].x, y: points[0].y };

  let dist = distance;
  if (closed) {
    dist = ((dist % total) + total) % total;
  } else {
    dist = Math.max(0, Math.min(total, dist));
  }

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (dist <= seg.end || i === segments.length - 1) {
      const t = seg.len === 0 ? 0 : (dist - seg.start) / seg.len;
      return {
        x: seg.a.x + (seg.b.x - seg.a.x) * t,
        y: seg.a.y + (seg.b.y - seg.a.y) * t,
      };
    }
  }
  const last = points[points.length - 1];
  return { x: last.x, y: last.y };
}

function polylineLength(points, closed) {
  if (points.length < 2) return 0;
  let total = 0;
  const segmentCount = closed ? points.length : points.length - 1;
  for (let i = 0; i < segmentCount; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    total += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return total;
}

function silhouetteEdgeLabelSlots(extraPad = state.edgeLabelOffset) {
  if (pathPoints.length === 0) return [];
  const edgePoints = getSilhouettePolyline(extraPad, 5);
  if (!edgePoints || edgePoints.length < 2) return [];

  const closed = true;
  const totalLength = polylineLength(edgePoints, closed);
  if (totalLength === 0) return [];

  const gap = state.edgeLabelGap;
  const span = (activeEdgeLabelChars().length - 1) * gap;
  let start = (totalLength - span) / 2 + state.edgeLabelStart;
  start = ((start % totalLength) + totalLength) % totalLength;

  const activeLetter = activeTemplateLetter();
  const chars = edgeLabelCharsForBlobby();
  const step = edgeLabelPathStep(gap);
  return chars.map((char, index) => {
    const pos = pointAtPolylineDistance(edgePoints, start + index * step, closed);
    return {
      char,
      x: pos.x,
      y: pos.y,
      active: char === activeLetter,
    };
  });
}

function blobbyEdgeLabelPositions() {
  return silhouetteEdgeLabelSlots(state.edgeLabelOffset);
}

function pointFromCircleCenter(center, origin, radius, offset = 0) {
  let dx = center.x - origin.x;
  let dy = center.y - origin.y;
  let len = Math.hypot(dx, dy);
  if (len < 1e-6) {
    dx = 0;
    dy = -1;
    len = 1;
  }
  const dist = radius + offset;
  return {
    x: center.x + (dx / len) * dist,
    y: center.y + (dy / len) * dist,
  };
}

function circleSpacingPx() {
  return Math.max(1, state.ellipseSize * effectiveCircleSpacing());
}

function edgeLabelCircleStartIndex(pointCount) {
  const spacingPx = circleSpacingPx();
  const start = Math.round(state.edgeLabelStart / spacingPx);
  return ((start % pointCount) + pointCount) % pointCount;
}

function edgeLabelCircleIndexStep() {
  const spacingPx = circleSpacingPx();
  return Math.max(1, Math.round(state.edgeLabelGap / spacingPx));
}

function edgeLabelOrderReversed() {
  return Boolean(state.edgeLabelReversed);
}

function edgeLabelCharsForBlobby() {
  const chars = activeEdgeLabelChars();
  if (edgeLabelOrderReversed()) {
    return [...chars].reverse();
  }
  return chars;
}

function edgeLabelPathStep(gap) {
  return gap;
}

function edgeLabelCharsForCircles() {
  const chars = activeEdgeLabelChars();
  if (edgeLabelOrderReversed()) {
    return [...chars].reverse();
  }
  return chars;
}

function supportsEdgeLabelDirectionToggle() {
  return !usingGeometric()
    && (state.letterMode === "blobby" || state.letterMode === "circles");
}

function edgeLabelDirectionLabel() {
  return edgeLabelOrderReversed() ? "Letter order: backwards" : "Letter order: forwards";
}

function circlesEdgeLabelPositions() {
  const pointCount = pathPoints.length;
  if (pointCount === 0) return [];

  const activeLetter = activeTemplateLetter();
  const chars = edgeLabelCharsForCircles();
  const labelCount = Math.min(chars.length, pointCount);
  const radius = state.ellipseSize / 2;
  const origin = pathCentroid(pathPoints);
  const indexStep = edgeLabelCircleIndexStep();
  let circleIndex = edgeLabelCircleStartIndex(pointCount);

  const labels = [];
  for (let i = 0; i < labelCount; i++) {
    const char = chars[i];
    const center = pathPoints[circleIndex];
    const pos = pointFromCircleCenter(center, origin, radius, state.edgeLabelOffset);
    labels.push({
      char,
      x: pos.x,
      y: pos.y,
      active: char === activeLetter,
    });
    if (i === labelCount - 1) break;
    circleIndex = ((circleIndex + indexStep) % pointCount + pointCount) % pointCount;
  }
  return labels;
}

function edgeLabelPositions() {
  if (hasCustomManualLabelPlacements()) {
    return manualGeometricEdgeLabelPositions();
  }
  if (state.letterMode === "circles") return circlesEdgeLabelPositions();
  return blobbyEdgeLabelPositions();
}

function cornerOutwardRotation(prev, corner, next) {
  const vInX = corner.x - prev.x;
  const vInY = corner.y - prev.y;
  const vOutX = next.x - corner.x;
  const vOutY = next.y - corner.y;
  const inLen = Math.hypot(vInX, vInY) || 1;
  const outLen = Math.hypot(vOutX, vOutY) || 1;
  const inX = vInX / inLen;
  const inY = vInY / inLen;
  const outX = vOutX / outLen;
  const outY = vOutY / outLen;
  let bx = inX + outX;
  let by = inY + outY;
  const bLen = Math.hypot(bx, by);
  if (bLen < 1e-6) {
    return Math.atan2(-inY, -inX);
  }
  bx /= bLen;
  by /= bLen;
  return Math.atan2(-by, -bx);
}

function polygonCornerRotations(points) {
  return points.map((point, index) => ({
    x: point.x,
    y: point.y,
    rotation: cornerOutwardRotation(
      points[(index + points.length - 1) % points.length],
      point,
      points[(index + 1) % points.length],
    ),
  }));
}

function axisAlignedBBoxCornerRotation(corner) {
  if (corner === "topLeft") return (-3 * Math.PI) / 4;
  if (corner === "topRight") return -Math.PI / 4;
  if (corner === "bottomRight") return Math.PI / 4;
  return (3 * Math.PI) / 4;
}

function lStrokeInnerCorner(primitive) {
  const pts = strokePathWorldPoints(primitive);
  if (pts.length < 3) return null;
  const corner = pts[1];
  return {
    x: corner.x,
    y: corner.y,
    rotation: cornerOutwardRotation(pts[0], corner, pts[2]),
  };
}

function geometricPrimitiveCorners(primitive) {
  if (primitive.type === "rect") {
    const points = [
      { x: primitive.x, y: primitive.y },
      { x: primitive.x + primitive.w, y: primitive.y },
      { x: primitive.x + primitive.w, y: primitive.y + primitive.h },
      { x: primitive.x, y: primitive.y + primitive.h },
    ];
    return polygonCornerRotations(points);
  }
  if (primitive.type === "rotatedRect") {
    return polygonCornerRotations(rotatedRectCorners(primitive));
  }
  if (primitive.type === "lStroke") {
    const corner = lStrokeInnerCorner(primitive);
    return corner ? [corner] : [];
  }
  if (primitive.type === "bezierStroke") {
    return ["topLeft", "topRight", "bottomRight", "bottomLeft"].map((name) => {
      const point = geometricCOutlineCorner(primitive, name);
      return {
        x: point.x,
        y: point.y,
        rotation: axisAlignedBBoxCornerRotation(name),
      };
    });
  }
  return [];
}

function pickExtremeGeometricCorners(corners) {
  if (corners.length <= 4) return corners;
  let topLeft = corners[0];
  let topRight = corners[0];
  let bottomRight = corners[0];
  let bottomLeft = corners[0];
  corners.forEach((corner) => {
    if (corner.x + corner.y < topLeft.x + topLeft.y) topLeft = corner;
    if (corner.x - corner.y > topRight.x - topRight.y) topRight = corner;
    if (corner.x + corner.y > bottomRight.x + bottomRight.y) bottomRight = corner;
    if (corner.x - corner.y < bottomLeft.x - bottomLeft.y) bottomLeft = corner;
  });
  return [topLeft, topRight, bottomRight, bottomLeft];
}

function geometricRectCornerSlots(rect) {
  const corners = [
    { name: "topLeft", x: rect.x, y: rect.y },
    { name: "topRight", x: rect.x + rect.w, y: rect.y },
    { name: "bottomLeft", x: rect.x, y: rect.y + rect.h },
    { name: "bottomRight", x: rect.x + rect.w, y: rect.y + rect.h },
  ];
  return corners.map(({ name, x, y }, slotIndex) => ({
    slotIndex,
    piece: "left",
    name,
    x,
    y,
    rotation: 0,
    offsetAngle: axisAlignedBBoxCornerRotation(name),
    textAlign: "center",
    textBaseline: "middle",
  }));
}

function geometricSemicircleLeftEdgeSlots(primitive) {
  const { cx, cy, r, rotation } = primitive;
  const topAngle = -Math.PI / 2 + rotation;
  const bottomAngle = Math.PI / 2 + rotation;
  const textRotation = rotation;
  const offsetAngle = Math.PI + rotation;
  return [
    {
      slotIndex: 4,
      piece: "right",
      name: "topLeft",
      x: cx + r * Math.cos(topAngle),
      y: cy + r * Math.sin(topAngle),
      rotation: textRotation,
      offsetAngle,
      textAlign: "left",
      textBaseline: "top",
    },
    {
      slotIndex: 5,
      piece: "right",
      name: "bottomLeft",
      x: cx + r * Math.cos(bottomAngle),
      y: cy + r * Math.sin(bottomAngle),
      rotation: textRotation,
      offsetAngle,
      textAlign: "left",
      textBaseline: "bottom",
    },
  ];
}

function geometricDAllCornerSlots(primitives) {
  const rect = primitives.find((item) => item.type === "rect");
  if (!rect) return [];
  const leftSlots = geometricRectCornerSlots(rect);
  const semicircle = primitives.find((item) => item.type === "semicircle");
  const rightSlots = semicircle ? geometricSemicircleLeftEdgeSlots(semicircle) : [];
  return leftSlots.concat(rightSlots);
}

function geometricBezierStrokeExtremeCorners(primitive) {
  const outlinePad = SHAPE_STROKE_PX * 2;
  const centerline = strokePathWorldPoints(primitive);
  if (centerline.length < 2) {
    const points = lStrokeFillCorners(primitive, outlinePad);
    if (points.length < 4) return [];
    const n = points.length;
    const corners = points.map((point, index) => ({
      x: point.x,
      y: point.y,
      rotation: cornerOutwardRotation(
        points[(index - 1 + n) % n],
        point,
        points[(index + 1) % n],
      ),
    }));
    return pickExtremeGeometricCorners(corners);
  }

  const hw = (primitive.strokeWeight + outlinePad) / 2;
  const capExtend = outlinePad > 0 ? outlinePad * 0.5 : 0;
  const start = centerline[0];
  const end = centerline[centerline.length - 1];
  const startDir = lStrokeUnit(centerline[1].x - start.x, centerline[1].y - start.y);
  const endDir = lStrokeUnit(end.x - centerline[centerline.length - 2].x, end.y - centerline[centerline.length - 2].y);
  const startNormal = { x: -startDir.y, y: startDir.x };
  const endNormal = { x: -endDir.y, y: endDir.x };
  const rawCorners = [
    {
      x: start.x - startDir.x * capExtend + startNormal.x * hw,
      y: start.y - startDir.y * capExtend + startNormal.y * hw,
    },
    {
      x: start.x - startDir.x * capExtend - startNormal.x * hw,
      y: start.y - startDir.y * capExtend - startNormal.y * hw,
    },
    {
      x: end.x + endDir.x * capExtend - endNormal.x * hw,
      y: end.y + endDir.y * capExtend - endNormal.y * hw,
    },
    {
      x: end.x + endDir.x * capExtend + endNormal.x * hw,
      y: end.y + endDir.y * capExtend + endNormal.y * hw,
    },
  ];
  const corners = rawCorners.map((corner, index) => ({
    x: corner.x,
    y: corner.y,
    rotation: cornerOutwardRotation(
      rawCorners[(index - 1 + rawCorners.length) % rawCorners.length],
      corner,
      rawCorners[(index + 1) % rawCorners.length],
    ),
  }));
  return pickExtremeGeometricCorners(corners);
}

function geometricBezierStrokeCornerSlots(primitive, piece, slotIndexOffset) {
  return geometricBezierStrokeExtremeCorners(primitive).map((corner, index) => ({
    slotIndex: slotIndexOffset + index,
    piece,
    name: EXTREME_CORNER_NAMES[index],
    x: corner.x,
    y: corner.y,
    rotation: corner.rotation,
    offsetAngle: corner.rotation,
    textAlign: "center",
    textBaseline: "middle",
  }));
}

function geometricSAllCornerSlots(primitives) {
  const top = primitives.find((item) => item.variant === "top");
  const bottom = primitives.find((item) => item.variant === "bottom");
  const slots = [];
  if (top) slots.push(...geometricBezierStrokeCornerSlots(top, "top", 0));
  if (bottom) slots.push(...geometricBezierStrokeCornerSlots(bottom, "bottom", 4));
  return slots;
}

function geometricDefaultLabelCornerIndices() {
  if (state.template === "sweep") {
    const indices = DEFAULT_GEO_S_LABEL_CORNER_INDICES.slice();
    if (state.edgeLabelS69) indices.push(DEFAULT_GEO_S69_LABEL_CORNER_INDEX);
    return indices;
  }
  const indices = DEFAULT_GEO_LABEL_CORNER_INDICES.slice();
  if (state.edgeLabelS69) indices.push(DEFAULT_GEO_D_S69_LABEL_CORNER_INDEX);
  return indices;
}

function templateHasDefaultGeometricLabels() {
  return state.template === "moon";
}

function geometricAllCornerSlots() {
  const primitives = canvasPath.geometric || [];
  if (state.template === "moon") return geometricDAllCornerSlots(primitives);
  if (state.template === "sweep") return geometricSAllCornerSlots(primitives);
  return [];
}

function defaultGeometricCornerSlots() {
  if (!templateHasDefaultGeometricLabels()) return [];
  return geometricAllCornerSlots();
}

function geometricCornerSlotCount() {
  if (state.letterMode !== "geometric") return 0;
  if (state.template === "moon") return 6;
  if (state.template === "sweep") return 8;
  return 0;
}

function supportsGeometricCornerShuffle() {
  return usingGeometric() && geometricCornerSlotCount() >= activeEdgeLabelChars().length;
}

function resetGeometricLabelCorners() {
  state.geoLabelCornerIndices = geometricDefaultLabelCornerIndices().slice();
}

function reshuffleGeometricLabelCorners() {
  const slotCount = geometricCornerSlotCount();
  const labelCount = activeEdgeLabelChars().length;
  if (slotCount < labelCount) return;
  state.geoLabelCornerIndices = shuffleArray(
    Array.from({ length: slotCount }, (_, index) => index),
  ).slice(0, labelCount);
  redraw();
}

function geometricCornerEdgeLabelPositions(slots) {
  if (!slots.length) return [];

  const chars = activeEdgeLabelChars();
  const indices = state.geoLabelCornerIndices?.length === chars.length
    ? state.geoLabelCornerIndices
    : geometricDefaultLabelCornerIndices();
  const activeLetter = activeTemplateLetter();
  const offset = state.edgeLabelOffset;

  return chars.map((char, index) => {
    const slot = slots[indices[index]];
    if (!slot) return null;
    const offsetAngle = slot.offsetAngle ?? slot.rotation;
    return {
      char,
      x: slot.x + Math.cos(offsetAngle) * offset,
      y: slot.y + Math.sin(offsetAngle) * offset,
      cornerX: slot.x,
      cornerY: slot.y,
      rotation: slot.rotation,
      offsetAngle,
      offsetApplied: offset,
      textAlign: slot.textAlign || "center",
      textBaseline: slot.textBaseline || "middle",
      slotIndex: slot.slotIndex,
      slotName: slot.name,
      piece: slot.piece,
      active: char === activeLetter,
    };
  }).filter(Boolean);
}

function hasCustomManualLabelPlacements() {
  return state.geoManualLabelPlacements.some((item) => item.placed);
}

function geometricEdgeLabelPositions() {
  if (hasCustomManualLabelPlacements()) {
    return manualGeometricEdgeLabelPositions();
  }
  return geometricCornerEdgeLabelPositions(defaultGeometricCornerSlots());
}

function labelAnchorToAlign() {
  return { textAlign: "center", textBaseline: "middle" };
}

function manualLabelPlacement(index) {
  return state.geoManualLabelPlacements[index] || null;
}

function manualGeometricEdgeLabelPositions() {
  const activeLetter = activeTemplateLetter();
  return state.geoManualLabelPlacements
    .filter((item) => item.placed && item.x != null && item.y != null)
    .map((item) => {
      const { textAlign, textBaseline } = labelAnchorToAlign();
      return {
        char: item.char,
        x: item.x,
        y: item.y,
        rotation: (item.rotation * Math.PI) / 180,
        textAlign,
        textBaseline,
        active: item.char === activeLetter,
      };
    });
}

function geometricLabelPlacementZone() {
  const primitives = canvasPath.geometric || [];
  if (!primitives.length) return null;
  const pad = 24;
  const bounds = geometricPrimitiveBounds(primitives, pad);
  return {
    minX: bounds.minX,
    minY: bounds.minY,
    maxX: bounds.maxX,
    maxY: bounds.maxY,
  };
}

function circlesLabelPlacementZone() {
  const pad = 24;
  const labelPad = state.ellipseSize / 2 + Math.abs(state.edgeLabelOffset) + 20;
  if (!pathPoints.length) {
    return {
      minX: pad,
      minY: pad,
      maxX: width - pad,
      maxY: height - pad,
    };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  pathPoints.forEach((point) => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });
  return {
    minX: Math.max(pad, minX - labelPad),
    minY: Math.max(pad, minY - labelPad),
    maxX: Math.min(width - pad, maxX + labelPad),
    maxY: Math.min(height - pad, maxY + labelPad),
  };
}

function manualLabelPlacementZone() {
  if (usingGeometric()) return geometricLabelPlacementZone();
  if (state.letterMode === "circles") return circlesLabelPlacementZone();
  return null;
}

function pointInLabelPlacementZone(x, y) {
  const zone = manualLabelPlacementZone();
  if (!zone) return false;
  return x >= zone.minX && x <= zone.maxX && y >= zone.minY && y <= zone.maxY;
}

function resetManualLabelPlacements() {
  state.geoManualLabelPlacements = createDefaultManualLabelPlacements();
  state.geoManualLabelEditIndex = 0;
  geoManualLabelDrag = null;
}

function resetGeometricLabelEditingState() {
  resetManualLabelPlacements();
  state.geoManualLabelLayoutMode = "fixed";
}

function seedManualPlacementsFromAutoIfNeeded() {
  if (hasCustomManualLabelPlacements()) return;
  if (usingGeometric()) {
    if (!templateHasDefaultGeometricLabels()) return;
    const autoLabels = geometricCornerEdgeLabelPositions(defaultGeometricCornerSlots());
    if (!autoLabels.length) return;
    autoLabels.forEach((label, index) => {
      const placement = state.geoManualLabelPlacements[index];
      if (!placement || placement.char !== label.char) return;
      placement.x = label.x;
      placement.y = label.y;
      placement.rotation = (label.rotation * 180) / Math.PI;
      placement.anchor = DEFAULT_MANUAL_LABEL_ANCHOR;
      placement.placed = true;
    });
    return;
  }
  if (state.letterMode !== "circles") return;
  const autoLabels = circlesEdgeLabelPositions();
  if (!autoLabels.length) return;
  autoLabels.forEach((label, index) => {
    const placement = state.geoManualLabelPlacements[index];
    if (!placement || placement.char !== label.char) return;
    placement.x = label.x;
    placement.y = label.y;
    placement.rotation = ((label.rotation || 0) * 180) / Math.PI;
    placement.anchor = DEFAULT_MANUAL_LABEL_ANCHOR;
    placement.placed = true;
  });
}

function nextManualLabelPlacementIndex() {
  return state.geoManualLabelPlacements.findIndex((item) => !item.placed);
}

function restartManualLabelPlacement() {
  if (state.geoManualLabelLayoutMode !== "editing") return;
  resetManualLabelPlacements();
  syncManualLabelUi();
  syncModeHint();
  redraw();
}

function setManualLabelLayoutMode(mode) {
  if (mode !== "fixed" && mode !== "editing") return;
  if (mode === state.geoManualLabelLayoutMode) return;
  if (mode === "fixed") {
    geoManualLabelDrag = null;
  } else {
    seedManualPlacementsFromAutoIfNeeded();
  }
  state.geoManualLabelLayoutMode = mode;
  syncManualLabelUi();
  syncModeHint();
  redraw();
}

function placeManualLabelAt(x, y) {
  if (state.geoManualLabelLayoutMode !== "editing") return;
  const index = nextManualLabelPlacementIndex();
  if (index < 0) return;
  const placement = state.geoManualLabelPlacements[index];
  if (!placement) return;
  placement.x = x;
  placement.y = y;
  placement.placed = true;
  state.geoManualLabelEditIndex = index;
  syncManualLabelUi();
  syncModeHint();
  redraw();
}

function manualLabelPlacementCount() {
  return state.geoManualLabelPlacements.filter((item) => item.placed).length;
}

function manualLabelPlacementEditingEnabled() {
  return state.appMode === "editor"
    && state.edgeLabels
    && supportsManualLabelLayout()
    && state.geoManualLabelLayoutMode === "editing";
}

function hitTestManualLabelPlacement(x, y) {
  let bestIndex = -1;
  let bestDist = MANUAL_LABEL_HIT_RADIUS;
  state.geoManualLabelPlacements.forEach((placement, index) => {
    if (!placement.placed || placement.x == null || placement.y == null) return;
    const dist = Math.hypot(x - placement.x, y - placement.y);
    if (dist <= bestDist) {
      bestDist = dist;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function startManualLabelDrag(index) {
  geoManualLabelDrag = { index };
  state.geoManualLabelEditIndex = index;
  syncManualLabelUi();
  cursor("grabbing");
  redraw();
}

function moveManualLabelDrag(x, y) {
  if (!geoManualLabelDrag) return;
  const placement = manualLabelPlacement(geoManualLabelDrag.index);
  if (!placement?.placed) return;
  placement.x = x;
  placement.y = y;
  redraw();
}

function stopManualLabelDrag() {
  if (!geoManualLabelDrag) return;
  geoManualLabelDrag = null;
  syncManualLabelUi();
  if (manualLabelPlacementEditingEnabled() && mouseInCanvas()) {
    const hitIndex = hitTestManualLabelPlacement(mouseX, mouseY);
    cursor(hitIndex >= 0 ? "grab" : "default");
  } else {
    cursor("default");
  }
  redraw();
}

function edgeLabelGlyphBounds(char, font, textAlign, textBaseline, fontSize) {
  const ctx = drawingContext;
  ctx.font = font;
  const width = ctx.measureText(char).width;
  let x0 = 0;
  let y0 = 0;
  let x1 = width;
  let y1 = fontSize;
  if (textAlign === "center") {
    x0 = -width / 2;
    x1 = width / 2;
  } else if (textAlign === "right") {
    x0 = -width;
    x1 = 0;
  }
  if (textBaseline === "middle") {
    y0 = -fontSize / 2;
    y1 = fontSize / 2;
  } else if (textBaseline === "bottom") {
    y0 = -fontSize;
    y1 = 0;
  }
  return [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ];
}

function edgeLabelGlyphCenter(char, font, textAlign, textBaseline, fontSize) {
  const corners = edgeLabelGlyphBounds(char, font, textAlign, textBaseline, fontSize);
  return {
    x: (corners[0].x + corners[2].x) / 2,
    y: (corners[0].y + corners[2].y) / 2,
  };
}

function transformLabelPoint(localX, localY, anchorX, anchorY, rotation) {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return {
    x: anchorX + localX * cos - localY * sin,
    y: anchorY + localX * sin + localY * cos,
  };
}

function formatLabelDegrees(radians) {
  return `${Math.round((radians * 180) / Math.PI)}°`;
}

function drawDebugCross(x, y, size, color, weight = 1.5) {
  push();
  stroke(...color);
  strokeWeight(weight);
  line(x - size, y, x + size, y);
  line(x, y - size, x, y + size);
  pop();
}

function drawDebugCallout(x, y, lines, color = [255, 255, 255]) {
  push();
  textSize(10);
  textLeading(12);
  textAlign(LEFT, TOP);
  const padding = 6;
  const lineHeight = 12;
  const tw = Math.max(...lines.map((line) => textWidth(line)));
  const th = lines.length * lineHeight;
  noStroke();
  fill(12, 12, 12, 220);
  rect(x, y, tw + padding * 2, th + padding * 2, 4);
  fill(...color);
  lines.forEach((line, index) => {
    text(line, x + padding, y + padding + index * lineHeight);
  });
  pop();
}

function geometricEdgeLabelDebugColor(piece) {
  if (piece === "right" || piece === "bottom") return [255, 120, 210];
  return [120, 220, 160];
}

function drawGeometricEdgeLabelDebug() {
  if (!state.edgeLabels || !usingGeometric()) return;
  if (hasCustomManualLabelPlacements()) {
    const labels = manualGeometricEdgeLabelPositions();
    labels.forEach((label) => {
      drawDebugCross(label.x, label.y, 9, [255, 220, 72], 2.5);
      drawDebugCallout(
        label.x + 14,
        label.y + 14,
        [
          `${label.char} · manual placement`,
          `anchor: (${Math.round(label.x)}, ${Math.round(label.y)})`,
          `rotation: ${formatLabelDegrees(label.rotation)}`,
          `anchor mode: ${label.textAlign} / ${label.textBaseline}`,
        ],
        [255, 209, 102],
      );
    });
    drawDebugCallout(12, 12, [
      "Manual letter overlay debug",
      "Yellow dots = click anchors",
      "Use sidebar slider to adjust rotation",
    ], [220, 220, 220]);
    return;
  }
  if (state.template !== "moon" && state.template !== "sweep") return;

  const primitives = canvasPath.geometric || [];
  const slots = geometricAllCornerSlots();
  if (!slots.length) return;

  const chars = activeEdgeLabelChars();
  const indices = state.geoLabelCornerIndices?.length === chars.length
    ? state.geoLabelCornerIndices
    : geometricDefaultLabelCornerIndices();
  const labels = geometricEdgeLabelPositions();
  const assignedBySlot = new Map(labels.map((label) => [label.slotIndex, label]));

  if (state.template === "moon") {
    const semicircle = primitives.find((item) => item.type === "semicircle");
    if (semicircle) {
      const top = slots.find((slot) => slot.slotIndex === 4);
      const bottom = slots.find((slot) => slot.slotIndex === 5);
      if (top && bottom) {
        push();
        noFill();
        stroke(255, 120, 210, 180);
        strokeWeight(2);
        line(top.x, top.y, bottom.x, bottom.y);
        pop();
      }
    }
  }

  slots.forEach((slot) => {
    const assigned = assignedBySlot.get(slot.slotIndex);
    const cornerColor = geometricEdgeLabelDebugColor(slot.piece);
    push();
    noStroke();
    fill(...cornerColor, assigned ? 230 : 120);
    circle(slot.x, slot.y, assigned ? 10 : 7);
    pop();
    drawDebugCross(slot.x, slot.y, 7, cornerColor, assigned ? 2 : 1);

    push();
    textAlign(CENTER, BOTTOM);
    textSize(9);
    fill(...cornerColor);
    text(
      `#${slot.slotIndex} ${slot.piece} · ${slot.name}${assigned ? ` · ${assigned.char}` : ""}`,
      slot.x,
      slot.y - 10,
    );
    pop();
  });

  labels.forEach((label) => {
    const font = label.active ? EDGE_LABEL_ACTIVE_FONT : EDGE_LABEL_FONT;
    const fontSize = label.active ? EDGE_LABEL_ACTIVE_SIZE : EDGE_LABEL_SIZE;
    const bounds = edgeLabelGlyphBounds(
      label.char,
      font,
      label.textAlign,
      label.textBaseline,
      fontSize,
    );
    const worldBounds = bounds.map((point) => transformLabelPoint(
      point.x,
      point.y,
      label.x,
      label.y,
      label.rotation,
    ));

    push();
    stroke(120, 180, 255, 220);
    strokeWeight(1.5);
    noFill();
    beginShape();
    worldBounds.forEach((point) => vertex(point.x, point.y));
    endShape(CLOSE);
    pop();

    push();
    noFill();
    stroke(255, 220, 72, 220);
    strokeWeight(2);
    drawingContext.setLineDash([5, 4]);
    line(label.cornerX, label.cornerY, label.x, label.y);
    drawingContext.setLineDash([]);
    pop();

    const rotLen = 36;
    const rotEnd = transformLabelPoint(rotLen, 0, label.x, label.y, label.rotation);
    push();
    stroke(255, 180, 80, 230);
    strokeWeight(2);
    line(label.x, label.y, rotEnd.x, rotEnd.y);
    pop();

    drawDebugCross(label.x, label.y, 9, [255, 220, 72], 2.5);
    push();
    noStroke();
    fill(255, 220, 72);
    circle(label.x, label.y, 5);
    pop();

    drawDebugCallout(
      label.x + 14,
      label.y + 14,
      [
        `${label.char} · slot #${label.slotIndex} (${label.piece} ${label.slotName})`,
        `corner: (${Math.round(label.cornerX)}, ${Math.round(label.cornerY)})`,
        `anchor: (${Math.round(label.x)}, ${Math.round(label.y)})`,
        `anchor mode: ${label.textAlign} / ${label.textBaseline}`,
        `rotation: ${formatLabelDegrees(label.rotation)}`,
        `offset: ${Math.round(label.offsetApplied)}px @ ${formatLabelDegrees(label.offsetAngle)}`,
      ],
      geometricEdgeLabelDebugColor(label.piece).map((channel) => Math.min(255, channel + 40)),
    );
  });

  const legend = state.template === "sweep"
    ? [
      "Letter overlay debug",
      "Green = top piece corners · Pink = bottom piece corners",
      "Crosshair + yellow dot = text anchor (translate origin)",
      "Yellow dashed = offset from shape corner to anchor",
      "Orange ray = local +X / reading direction after rotation",
      "Blue box = glyph bounds from anchor + align + rotation",
      `Assignments: ${chars.map((char, index) => `${char}→#${indices[index]}`).join("  ")}`,
    ]
    : [
      "Letter overlay debug",
      "Green = left stem corners · Pink = right bowl corners",
      "Crosshair + yellow dot = text anchor (translate origin)",
      "Yellow dashed = offset from shape corner to anchor",
      "Orange ray = local +X / reading direction after rotation",
      "Blue box = glyph bounds from anchor + align + rotation",
      `Assignments: ${chars.map((char, index) => `${char}→#${indices[index]}`).join("  ")}`,
    ];
  drawDebugCallout(12, 12, legend, [220, 220, 220]);
}

function drawEdgeLabelGlyphs(labels) {
  const ctx = drawingContext;
  ctx.save();

  labels.forEach(({
    char,
    x,
    y,
    active,
    rotation = 0,
    textAlign = "center",
    textBaseline = "middle",
  }) => {
    ctx.save();
    ctx.translate(x, y);
    if (rotation) ctx.rotate(rotation);
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    const font = active ? EDGE_LABEL_ACTIVE_FONT : EDGE_LABEL_FONT;
    const fontSize = active ? EDGE_LABEL_ACTIVE_SIZE : EDGE_LABEL_SIZE;
    ctx.font = font;
    if (active) {
      const center = edgeLabelGlyphCenter(char, font, textAlign, textBaseline, fontSize);
      ctx.beginPath();
      ctx.arc(center.x, center.y, EDGE_LABEL_ACTIVE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "#000000";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
    } else {
      ctx.fillStyle = "#000000";
    }
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

function drawBlobbyEdgeLabels() {
  if (!state.edgeLabels || usingGeometric()) return;
  if (state.letterMode !== "blobby" && state.letterMode !== "circles") return;
  const labels = edgeLabelPositions();
  if (!labels.length) return;
  drawEdgeLabelGlyphs(labels);
}

function drawGeometricEdgeLabels() {
  if (!state.edgeLabels || !usingGeometric()) return;
  const labels = geometricEdgeLabelPositions();
  if (!labels.length) return;
  drawEdgeLabelGlyphs(labels);
}

function drawManualLabelPlacementOverlay() {
  if (state.exporting) return;
  if (!supportsManualLabelLayout()
    || state.geoManualLabelLayoutMode !== "editing"
    || !state.edgeLabels) return;

  const zone = manualLabelPlacementZone();
  const placementPending = nextManualLabelPlacementIndex() >= 0;
  if (zone) {
    push();
    noFill();
    stroke(255, 209, 102, placementPending ? 220 : 120);
    strokeWeight(placementPending ? 2 : 1.5);
    drawingContext.setLineDash([8, 6]);
    rect(zone.minX, zone.minY, zone.maxX - zone.minX, zone.maxY - zone.minY);
    drawingContext.setLineDash([]);
    pop();
  }

  const activeLetter = activeTemplateLetter();
  state.geoManualLabelPlacements.forEach((placement, index) => {
    if (!placement.placed || placement.x == null || placement.y == null) return;
    const selected = index === state.geoManualLabelEditIndex;
    const active = placement.char === activeLetter;
    const rotation = (placement.rotation * Math.PI) / 180;
    const { textAlign, textBaseline } = labelAnchorToAlign();
    const font = active ? EDGE_LABEL_ACTIVE_FONT : EDGE_LABEL_FONT;
    const fontSize = active ? EDGE_LABEL_ACTIVE_SIZE : EDGE_LABEL_SIZE;
    const bounds = edgeLabelGlyphBounds(
      placement.char,
      font,
      textAlign,
      textBaseline,
      fontSize,
    );
    const pad = 4;
    const x0 = Math.min(...bounds.map((point) => point.x)) - pad;
    const y0 = Math.min(...bounds.map((point) => point.y)) - pad;
    const x1 = Math.max(...bounds.map((point) => point.x)) + pad;
    const y1 = Math.max(...bounds.map((point) => point.y)) + pad;
    const worldBounds = [
      transformLabelPoint(x0, y0, placement.x, placement.y, rotation),
      transformLabelPoint(x1, y0, placement.x, placement.y, rotation),
      transformLabelPoint(x1, y1, placement.x, placement.y, rotation),
      transformLabelPoint(x0, y1, placement.x, placement.y, rotation),
    ];

    push();
    noFill();
    stroke(255, 209, 102, selected ? 240 : 170);
    strokeWeight(selected ? 2 : 1.5);
    drawingContext.setLineDash([5, 4]);
    beginShape();
    worldBounds.forEach((point) => vertex(point.x, point.y));
    endShape(CLOSE);
    drawingContext.setLineDash([]);
    pop();
  });

  const labelChars = activeEdgeLabelChars();
  const nextIndex = nextManualLabelPlacementIndex();
  if (nextIndex >= 0) {
    const nextChar = labelChars[nextIndex];
    push();
    textAlign(CENTER, TOP);
    textSize(12);
    fill(255, 209, 102);
    const zoneCenterX = zone ? (zone.minX + zone.maxX) / 2 : width / 2;
    const zoneTopY = zone ? zone.minY : 24;
    text(
      `Click to place ${nextChar} (${nextIndex + 1}/${labelChars.length})`,
      zoneCenterX,
      Math.max(16, zoneTopY - 28),
    );
    pop();
  }
}

function gradientPad() {
  return usingGeometric() ? 0 : state.ellipseSize / 2;
}

function createRadialGradientForPoints(ctx, points, pad = 0) {
  const bounds = radialGradientBounds(points, pad);
  const gradient = ctx.createRadialGradient(
    bounds.cx,
    bounds.cy,
    0,
    bounds.cx,
    bounds.cy,
    bounds.radius
  );
  addPaletteStops(gradient);
  return gradient;
}

function createRadialPaletteGradient(ctx) {
  return createRadialGradientForPoints(ctx, pathPoints, gradientPad());
}

function addPaletteStops(gradient) {
  const colors = activeColors.length ? activeColors : ["#FFFFFF"];
  const last = colors.length - 1;
  for (let i = 0; i < colors.length; i++) {
    gradient.addColorStop(last === 0 ? 0 : i / last, colors[i]);
  }
}

function radialGradientBounds(points, pad) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < points.length; i++) {
    minX = Math.min(minX, points[i].x);
    minY = Math.min(minY, points[i].y);
    maxX = Math.max(maxX, points[i].x);
    maxY = Math.max(maxY, points[i].y);
  }
  if (!Number.isFinite(minX)) {
    return { cx: 0, cy: 0, radius: 1 };
  }
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;

  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const midX = minX + spanX / 2;
  const midY = minY + spanY / 2;
  const insetX = Math.min(RADIAL_INSET, spanX / 2);
  const insetY = Math.min(RADIAL_INSET, spanY / 2);
  const edge = state.radialEdge;

  if (edge === "right") {
    return { cx: maxX - insetX, cy: midY, radius: Math.max(spanX - insetX, 1) };
  }
  if (edge === "top") {
    return { cx: midX, cy: minY + insetY, radius: Math.max(spanY - insetY, 1) };
  }
  if (edge === "bottom") {
    return { cx: midX, cy: maxY - insetY, radius: Math.max(spanY - insetY, 1) };
  }
  return { cx: minX + insetX, cy: midY, radius: Math.max(spanX - insetX, 1) };
}

function bindUi() {
  const grid = document.getElementById("template-grid");
  TEMPLATES.forEach((template) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = template.name;
    button.dataset.id = template.id;
    button.setAttribute("aria-pressed", String(template.id === state.template));
    button.addEventListener("click", () => {
      if (template.id !== state.template) {
        state.template = template.id;
        ensureLetterModeForTemplate();
        if (state.letterMode === "geometric") resetGeometricLabelCorners();
        resetGeometricLabelEditingState();
      }
      syncTemplateUi();
      regenerateCurrentPath();
    });
    grid.appendChild(button);
  });

  bindPaletteWheel();
  bindFillModeUi();
  bindLetterModeUi();
  bindRescaleUi();
  bindEdgeLabelsUi();
  bindEdgeLabelS69Ui();
  bindEdgeLabelDirectionUi();
  bindManualLabelUi();

  bindRange("edge-label-offset", "edge-label-offset-label", (value) => {
    state.edgeLabelOffset = value;
    invalidateSilhouetteCache();
    redraw();
  }, (value) => `${Math.round(value)}px`);

  bindRange("edge-label-start", "edge-label-start-label", (value) => {
    state.edgeLabelStart = value;
    redraw();
  }, (value) => `${Math.round(value)}px`);

  bindRange("edge-label-gap", "edge-label-gap-label", (value) => {
    state.edgeLabelGap = value;
    redraw();
  }, (value) => `${Math.round(value)}px`);

  bindRange("ellipse-size", "ellipse-label", (value) => {
    state.ellipseSize = value;
    rebuildPath();
  });
  bindRange("path-scale", "path-scale-label", (value) => {
    state.pathScale = value;
    rebuildPath();
  }, (value) => `${Math.round(value * 100)}%`);
  bindRange("jitter", "jitter-label", (value) => {
    state.jitterRadius = value;
    generatePath();
    rebuildPath();
  }, (value) => `${Math.round(value * 100)}%`);
  bindRange("spacing", "spacing-label", (value) => {
    state.spacing = value;
    rebuildPath();
  });
  bindRange("relax", "relax-label", (value) => {
    state.relaxAmount = value;
    applyRelaxMix();
  }, (value) => `${Math.round(value * 100)}%`);
  bindRange("relax-random", "relax-random-label", (value) => {
    state.relaxVariation = value;
    applyRelaxMix();
  }, (value) => `${Math.round(value * 100)}%`);
  bindRange("geo-d-bowl-rotation", "geo-d-bowl-rotation-label", (value) => {
    state.geoDBowlRotation = value;
    refreshGeometricDPath();
  }, formatGeoDBowlRotation);
  bindRange("geo-d-bowl-shift-x", "geo-d-bowl-shift-x-label", (value) => {
    state.geoDBowlShiftX = value;
    refreshGeometricDPath();
  }, formatGeoDBowlShift);
  bindRange("geo-d-bowl-shift-y", "geo-d-bowl-shift-y-label", (value) => {
    state.geoDBowlShiftY = value;
    refreshGeometricDPath();
  }, formatGeoDBowlShift);
  bindRange("geo-v-leg-gap", "geo-v-leg-gap-label", (value) => {
    state.geoVLegGap = value;
    refreshGeometricVPath();
  }, (value) => `${Math.round(value)}px`);
  bindRange("geo-v-leg-aspect-1", "geo-v-leg-aspect-1-label", (value) => {
    state.geoVLegAspect1 = value;
    refreshGeometricVPath();
  }, formatGeoVLegAspect);
  bindRange("geo-v-leg-aspect-2", "geo-v-leg-aspect-2-label", (value) => {
    state.geoVLegAspect2 = value;
    refreshGeometricVPath();
  }, formatGeoVLegAspect);
  bindRange("geo-v-leg-rotation-1", "geo-v-leg-rotation-1-label", (value) => {
    state.geoVLegRotation1 = value;
    refreshGeometricVPath();
  }, formatGeoVLegRotation);
  bindRange("geo-v-leg-rotation-2", "geo-v-leg-rotation-2-label", (value) => {
    state.geoVLegRotation2 = value;
    refreshGeometricVPath();
  }, formatGeoVLegRotation);
  bindRange("geo-v-y-shift", "geo-v-y-shift-label", (value) => {
    state.geoVYShiftAmount = value;
    refreshGeometricVPath();
  }, formatGeoVYShift);
  bindRange("geo-c-stroke-weight", "geo-c-stroke-weight-label", (value) => {
    state.geoCStrokeWeight = value;
    refreshGeometricCPath();
  }, (value) => `${Math.round(value)}px`);
  bindRange("geo-c-top-rotation", "geo-c-top-rotation-label", (value) => {
    state.geoCTopRotation = value;
    refreshGeometricCPath();
  }, formatGeoCRotation);
  bindRange("geo-c-bottom-rotation", "geo-c-bottom-rotation-label", (value) => {
    state.geoCBotRotation = value;
    refreshGeometricCPath();
  }, formatGeoCRotation);
  bindRange("geo-c-distance", "geo-c-distance-label", (value) => {
    state.geoCDistance = value;
    refreshGeometricCPath();
  }, (value) => `${Math.round(value)}px`);
  bindRange("geo-c-overlap", "geo-c-overlap-label", (value) => {
    state.geoCOverlap = value;
    refreshGeometricCPath();
  }, (value) => `${Math.round(value)}px`);
  bindRange("geo-s-stroke-weight", "geo-s-stroke-weight-label", (value) => {
    state.geoSStrokeWeight = value;
    refreshGeometricSPath();
  }, (value) => `${Math.round(value)}px`);
  bindRange("geo-s-top-rotation", "geo-s-top-rotation-label", (value) => {
    state.geoSTopRotation = value;
    refreshGeometricSPath();
  }, formatGeoCRotation);
  bindRange("geo-s-bottom-rotation", "geo-s-bottom-rotation-label", (value) => {
    state.geoSBotRotation = value;
    refreshGeometricSPath();
  }, formatGeoCRotation);
  bindRange("geo-s-distance", "geo-s-distance-label", (value) => {
    state.geoSDistance = value;
    refreshGeometricSPath();
  }, (value) => `${Math.round(value)}px`);
  bindRange("geo-s-overlap", "geo-s-overlap-label", (value) => {
    state.geoSOverlap = value;
    refreshGeometricSPath();
  }, (value) => `${Math.round(value)}px`);

  document.getElementById("randomize").addEventListener("click", () => {
    randomizeComposition();
  });

  document.getElementById("shuffle").addEventListener("click", () => {
    const n = orderedPalette.length;
    if (n <= 1) return;
    state.colorPath = randomColorPath();
    refreshActiveColors();
    redraw();
  });

  document.getElementById("download").addEventListener("click", () => {
    downloadTransparentPng();
  });

  bindCreationUi();
  bindAppModeUi();
}

function exportTimestampId() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function downloadTransparentPng() {
  const exportId = exportTimestampId();
  const exportPx = inchesToPx(creationSheet.stickerSizeIn);
  const { cellCanvas, outline, exportPx: px } = renderCurrentCompositionExport(exportPx);
  const svg = buildDieCutSvgFromOutline(outline, px, px);

  canvasToPngBlob(cellCanvas).then((blob) => {
    triggerDownload(blob, `gradient-path-${exportId}.png`);
    if (svg) {
      setTimeout(() => triggerDownload(svg, `gradient-path-die-cut-${exportId}.svg`, "image/svg+xml"), 300);
    }
    redraw();
  }).catch(() => {
    redraw();
  });
}

function triggerDownload(content, filename, mime) {
  let url;
  let revoke = false;
  if (content instanceof Blob) {
    url = URL.createObjectURL(content);
    revoke = true;
  } else if (typeof content === "string" && content.startsWith("data:")) {
    url = content;
  } else if (typeof content === "string" && content.startsWith("blob:")) {
    url = content;
    revoke = true;
  } else {
    const blob = new Blob([content], { type: mime || "text/plain" });
    url = URL.createObjectURL(blob);
    revoke = true;
  }
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (revoke) setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function renderDieCutSilhouette(ctx, extraPad = 0) {
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#000000";
  ctx.strokeStyle = "#000000";
  if (usingGeometric()) {
    const primitives = canvasPath.geometric || [];
    if (!primitives.length) return;
    if (usingGeometricLStroke()) {
      primitives.forEach((item) => fillLStrokeOnContext(ctx, item, SHAPE_STROKE_PX * 2 + extraPad));
      return;
    }
    const shape = geometricUnionPath(primitives);
    ctx.lineWidth = SHAPE_STROKE_PX * 2 + extraPad * 2;
    ctx.lineJoin = "miter";
    ctx.miterLimit = 10;
    ctx.lineCap = "butt";
    ctx.fill(shape);
    ctx.stroke(shape);
    return;
  }
  if (!pathPoints.length) return;
  ctx.fill(unionShapePath(state.ellipseSize / 2 + SHAPE_STROKE_PX + extraPad));
}

function invalidateSilhouetteCache() {
  canvasPath.silhouetteCache = null;
}

function silhouetteCacheKey(extraPad, spacing) {
  const last = pathPoints[pathPoints.length - 1];
  const first = pathPoints[0];
  return [
    extraPad,
    spacing,
    state.ellipseSize,
    width,
    height,
    pathPoints.length,
    first?.x,
    first?.y,
    last?.x,
    last?.y,
  ].join("|");
}

function binarizeStickerAlpha(imageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const brightness = data[i] + data[i + 1] + data[i + 2];
    const on = data[i + 3] > 32 && brightness > 45;
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = on ? 255 : 0;
  }
}

function decimateContour(points, minDist) {
  if (points.length <= 2) return points.slice();
  const out = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const last = out[out.length - 1];
    if (Math.hypot(points[i].x - last.x, points[i].y - last.y) >= minDist) {
      out.push(points[i]);
    }
  }
  return out;
}

function simplifyClosedPolyline(points, epsilon) {
  if (points.length <= 3) return points.slice();
  let farIndex = 0;
  let maxDist = 0;
  const anchor = points[0];
  for (let i = 1; i < points.length; i++) {
    const dist = Math.hypot(points[i].x - anchor.x, points[i].y - anchor.y);
    if (dist > maxDist) {
      maxDist = dist;
      farIndex = i;
    }
  }
  if (maxDist <= epsilon) return points.slice();
  const left = simplifyPolyline(points.slice(0, farIndex + 1), epsilon);
  const right = simplifyPolyline([...points.slice(farIndex), anchor], epsilon);
  return left.slice(0, -1).concat(right);
}

function contourPointsFromRaw(raw, simplifyEpsilon, logicalScale) {
  let simplified = simplifyClosedPolyline(raw, simplifyEpsilon);
  if (simplified.length < 8) {
    simplified = decimateContour(raw, Math.max(2, simplifyEpsilon * 0.75));
  }
  if (simplified.length < 4) {
    simplified = decimateContour(raw, 1.5);
  }
  if (simplified.length < 4) return null;
  return simplified.map((point) => ({
    x: point.x / logicalScale,
    y: point.y / logicalScale,
  }));
}

function solidBounds(solid, w, h) {
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!solid(x, y)) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxX < minX || maxY < minY) return null;
  return { minX, minY, maxX, maxY };
}

function traceBinarizedOutline(imageData, w, h, simplifyEpsilon, logicalScale, binarizeFn) {
  binarizeFn(imageData);
  const solid = makeSolidMask(imageData, w, h);
  const bounds = solidBounds(solid, w, h);
  if (!bounds) return null;
  const raw = traceOuterSilhouetteContour(solid, w, h, bounds);
  if (raw.length < 4) return null;
  const boundsDiag = Math.hypot(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
  const logicalBoundsDiag = boundsDiag / logicalScale;
  const points = contourPointsFromRaw(raw, simplifyEpsilon, logicalScale);
  if (!points || points.length < 4) return null;
  if (contourBoundsArea(points) < logicalBoundsDiag * logicalBoundsDiag * 0.05) return null;
  return {
    points,
    segments: catmullRomToBezierSegments(points, true),
    closed: true,
  };
}

function renderBlobbyStrokeSilhouette(ctx, extraPad = 0) {
  if (!pathPoints.length) return;
  ctx.fillStyle = "#ffffff";
  ctx.fill(unionShapePath(state.ellipseSize / 2 + SHAPE_STROKE_PX + extraPad));
}

function traceAlphaSilhouetteOutline(options = {}) {
  const extraPad = options.extraPad ?? 0;
  const source = options.source ?? "render";
  const simplifyEpsilon = options.simplifyEpsilon ?? 1.5;

  if (source === "live") {
    const dpr = pixelDensity();
    const w = Math.max(1, Math.floor(width * dpr));
    const h = Math.max(1, Math.floor(height * dpr));
    const imageData = drawingContext.getImageData(0, 0, w, h);
    const copy = new ImageData(new Uint8ClampedArray(imageData.data), w, h);
    return traceBinarizedOutline(copy, w, h, simplifyEpsilon * dpr, dpr, binarizeStickerAlpha);
  }

  const traceScale = options.traceScale ?? Math.max(pixelDensity(), 2) * 2;
  const scaledEpsilon = simplifyEpsilon * traceScale;
  const exportWidth = Math.max(1, Math.floor(width));
  const exportHeight = Math.max(1, Math.floor(height));
  const offscreen = document.createElement("canvas");
  offscreen.width = exportWidth * traceScale;
  offscreen.height = exportHeight * traceScale;
  const ctx = offscreen.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.scale(traceScale, traceScale);
  ctx.imageSmoothingEnabled = false;
  if (usingGeometric()) {
    renderDieCutSilhouette(ctx, extraPad);
  } else {
    ctx.clearRect(0, 0, width, height);
    renderBlobbyStrokeSilhouette(ctx, extraPad);
  }
  const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
  const binarizeFn = usingGeometric() ? binarizeImageData : binarizeStickerAlpha;
  return traceBinarizedOutline(
    imageData,
    offscreen.width,
    offscreen.height,
    scaledEpsilon,
    traceScale,
    binarizeFn,
  );
}

function catmullRomToBezierSegments(points, closed) {
  const count = points.length;
  if (count < 2) return [];
  const get = (index) => points[((index % count) + count) % count];
  const segments = [];
  const segmentCount = closed ? count : count - 1;
  for (let i = 0; i < segmentCount; i++) {
    const p0 = closed || i > 0 ? get(i - 1) : points[0];
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = closed || i < count - 2 ? get(i + 2) : points[count - 1];
    segments.push({
      p0: { x: p1.x, y: p1.y },
      cp1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      cp2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p1: { x: p2.x, y: p2.y },
    });
  }
  return segments;
}

function flattenSilhouetteOutline(outline, spacing = 6) {
  if (!outline?.segments?.length) return outline?.points || [];
  const points = [];
  points.push({ ...outline.segments[0].p0 });
  outline.segments.forEach((segment) => {
    const chord = Math.hypot(segment.p1.x - segment.p0.x, segment.p1.y - segment.p0.y);
    const control = Math.hypot(segment.cp1.x - segment.p0.x, segment.cp1.y - segment.p0.y)
      + Math.hypot(segment.cp2.x - segment.cp1.x, segment.cp2.y - segment.cp1.y)
      + Math.hypot(segment.p1.x - segment.cp2.x, segment.p1.y - segment.cp2.y);
    const approxLen = Math.max(chord, control * 0.5);
    const steps = Math.max(2, Math.ceil(approxLen / spacing));
    for (let i = 1; i <= steps; i++) {
      points.push(cubicBezierPoint(segment.p0, segment.cp1, segment.cp2, segment.p1, i / steps));
    }
  });
  return points;
}

function getSilhouettePolyline(extraPad = 0, spacing = 5) {
  const cacheKey = silhouetteCacheKey(extraPad, spacing);
  if (canvasPath.silhouetteCache?.key === cacheKey) {
    return canvasPath.silhouetteCache.polyline;
  }
  const outline = traceAlphaSilhouetteOutline({ extraPad });
  if (!outline) return null;
  const polyline = flattenSilhouetteOutline(outline, spacing);
  canvasPath.silhouetteCache = { key: cacheKey, polyline, outline };
  return polyline;
}

function binarizeImageData(imageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const on = data[i + 3] > 48 ? 255 : 0;
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = on;
  }
}

function makeSolidMask(imageData, w, h) {
  const data = imageData.data;
  return (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return false;
    return data[(y * w + x) * 4 + 3] > 128;
  };
}

const TRACE_DIRS = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];

function isSilhouetteEdge(solid, x, y) {
  return solid(x, y) && (
    !solid(x - 1, y) || !solid(x + 1, y) || !solid(x, y - 1) || !solid(x, y + 1)
  );
}

function findBackgroundNeighbor(solid, x, y) {
  for (let dir = 0; dir < 8; dir++) {
    const bx = x + TRACE_DIRS[dir][0];
    const by = y + TRACE_DIRS[dir][1];
    if (!solid(bx, by)) return { x: bx, y: by };
  }
  return { x: x - 1, y };
}

function findOuterContourStart(solid, w, h, bounds) {
  if (bounds) {
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      if (solid(x, bounds.minY) && !solid(x, bounds.minY - 1)) {
        return { x, y: bounds.minY };
      }
    }
    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        if (isSilhouetteEdge(solid, x, y)) {
          return { x, y };
        }
      }
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isSilhouetteEdge(solid, x, y)) {
        return { x, y };
      }
    }
  }
  return null;
}

function traceOuterSilhouetteContour(solid, w, h, bounds = null) {
  const start = findOuterContourStart(solid, w, h, bounds);
  if (!start) return [];

  const points = [{ x: start.x, y: start.y }];
  let cx = start.x;
  let cy = start.y;
  const initialBackground = findBackgroundNeighbor(solid, cx, cy);
  let bx = initialBackground.x;
  let by = initialBackground.y;
  const limit = Math.max(w, h) * 16;

  for (let step = 0; step < limit; step++) {
    const bdx = bx - cx;
    const bdy = by - cy;
    let startDir = TRACE_DIRS.findIndex(([dx, dy]) => dx === bdx && dy === bdy);
    if (startDir < 0) startDir = 0;

    let nextC = null;
    let nextB = null;
    for (let i = 1; i <= 8; i++) {
      const dir = (startDir + i) % 8;
      const nx = cx + TRACE_DIRS[dir][0];
      const ny = cy + TRACE_DIRS[dir][1];
      if (!isSilhouetteEdge(solid, nx, ny)) continue;
      nextC = { x: nx, y: ny };
      nextB = { x: cx, y: cy };
      break;
    }
    if (!nextC) break;
    if (nextC.x === start.x && nextC.y === start.y && points.length > 2) return points;

    const last = points[points.length - 1];
    if (last.x !== nextC.x || last.y !== nextC.y) points.push(nextC);
    bx = nextB.x;
    by = nextB.y;
    cx = nextC.x;
    cy = nextC.y;
  }
  return points;
}

function perpendicularDistance(point, lineStart, lineEnd) {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  if (dx === 0 && dy === 0) {
    return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
  }
  return Math.abs(
    dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x
  ) / Math.hypot(dx, dy);
}

function simplifyPolyline(points, epsilon) {
  if (points.length <= 2) return points.slice();
  let maxDist = 0;
  let index = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[end]);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }
  if (maxDist > epsilon) {
    const left = simplifyPolyline(points.slice(0, index + 1), epsilon);
    const right = simplifyPolyline(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[end]];
}

function contourBoundsArea(points) {
  if (points.length < 2) return 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  points.forEach((point) => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });
  return (maxX - minX) * (maxY - minY);
}

function wrapDieCutSvg(pathMarkup, exportWidth = width, exportHeight = height) {
  const w = Math.max(1, Math.floor(exportWidth));
  const h = Math.max(1, Math.floor(exportHeight));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${pathMarkup}
</svg>`;
}

function contourToSvgPath(points) {
  if (!points.length) return "";
  const fmt = (value) => Number(value.toFixed(2));
  let d = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${fmt(points[i].x)} ${fmt(points[i].y)}`;
  }
  return `${d} Z`;
}

function bezierSegmentsToSvgPath(segments, closed = true) {
  if (!segments.length) return "";
  const fmt = (value) => Number(value.toFixed(2));
  let d = `M ${fmt(segments[0].p0.x)} ${fmt(segments[0].p0.y)}`;
  segments.forEach((segment) => {
    d += ` C ${fmt(segment.cp1.x)} ${fmt(segment.cp1.y)}, ${fmt(segment.cp2.x)} ${fmt(segment.cp2.y)}, ${fmt(segment.p1.x)} ${fmt(segment.p1.y)}`;
  });
  if (closed) d += " Z";
  return d;
}

function canBuildAnalyticalGeometricDieCut(primitives) {
  return (primitives || []).length > 0
    && (primitives || []).every((item) =>
      isThickStrokePrimitive(item) || item.type === "rotatedRect" || item.type === "rect"
    );
}

function geometricPrimitiveDieCutPolygon(primitive, pad = SHAPE_STROKE_PX) {
  if (isThickStrokePrimitive(primitive)) {
    const corners = lStrokeFillCorners(primitive, SHAPE_STROKE_PX * 2);
    return corners.length >= 3 ? corners : null;
  }
  if (primitive.type === "rotatedRect") {
    return offsetClosedPolygon(rotatedRectCorners(primitive), pad);
  }
  if (primitive.type === "rect") {
    return offsetClosedPolygon([
      { x: primitive.x, y: primitive.y },
      { x: primitive.x + primitive.w, y: primitive.y },
      { x: primitive.x + primitive.w, y: primitive.y + primitive.h },
      { x: primitive.x, y: primitive.y + primitive.h },
    ], pad);
  }
  return null;
}

function geometricDieCutPolygons(primitives, offsetX = 0, offsetY = 0) {
  if (!canBuildAnalyticalGeometricDieCut(primitives)) return null;
  const paths = (primitives || [])
    .map((item) => geometricPrimitiveDieCutPolygon(item))
    .filter((points) => points && points.length >= 3)
    .map((points) => points.map((point) => ({
      x: point.x + offsetX,
      y: point.y + offsetY,
    })));
  return paths.length ? paths : null;
}

function buildGeometricDieCutSvg() {
  const paths = geometricDieCutPolygons(canvasPath.geometric || []);
  if (!paths) return null;
  const pathMarkup = paths
    .map((points) => `<path fill="none" stroke="#000000" stroke-width="0.75" d="${contourToSvgPath(points)}" />`)
    .join("\n  ");
  return wrapDieCutSvg(pathMarkup);
}

function traceSilhouetteToDieCutSvg() {
  const exportWidth = Math.max(1, Math.floor(width));
  const exportHeight = Math.max(1, Math.floor(height));
  const outline = traceAlphaSilhouetteOutline({ extraPad: 0 });
  if (!outline || outline.points.length < 4) return null;
  const minArea = exportWidth * exportHeight * 0.005;
  if (contourBoundsArea(outline.points) < minArea) return null;
  const d = usingGeometric()
    ? contourToSvgPath(outline.points)
    : bezierSegmentsToSvgPath(outline.segments, outline.closed);
  return wrapDieCutSvg(`<path fill="none" stroke="#000000" stroke-width="0.75" d="${d}" />`);
}

function buildDieCutSvg() {
  if (usingGeometric()) {
    const analytical = buildGeometricDieCutSvg();
    if (analytical) return analytical;
  }
  return traceSilhouetteToDieCutSvg();
}

const FILL_PREVIEW_COLORS = ["#1ADEFF", "#5EE9B0", "#FFC700", "#FF5A2A", "#FF2D7B"];
const FILL_PREVIEW_SHAPE_Y = 8;
const FILL_PREVIEW_SHAPE_H = 16;
const FILL_PREVIEW_SHAPE_R = FILL_PREVIEW_SHAPE_H / 2;
const FILL_PREVIEW_CIRCLE_XS = [8, 20, 32];
const FILL_PREVIEW_CIRCLE_COLORS = [
  FILL_PREVIEW_COLORS[0],
  FILL_PREVIEW_COLORS[2],
  FILL_PREVIEW_COLORS[4],
];
const FILL_PREVIEW_SPLIT_XS = [10, 30];

function fillPreviewStops() {
  return FILL_PREVIEW_COLORS.map((color, i) => (
    `<stop offset="${i / (FILL_PREVIEW_COLORS.length - 1)}" stop-color="${color}"/>`
  )).join("");
}

function fillShapePreviewStops() {
  return [
    `<stop offset="0" stop-color="${FILL_PREVIEW_COLORS[0]}"/>`,
    `<stop offset="1" stop-color="${FILL_PREVIEW_COLORS[2]}"/>`,
  ].join("");
}

function letterModePreviewSvg(mode) {
  if (mode === "blobby") {
    return `<svg class="mode-preview" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 5 C21 4 26 8 27 13 C28 17 26 21 24 24 C21 28 15 29 11 26 C6 23 4 18 5 13 C6 8 11 6 16 5 Z" fill="currentColor"/>
    </svg>`;
  }
  if (mode === "circles") {
    return `<svg class="mode-preview" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="11" cy="16" r="5.5" fill="currentColor"/>
      <circle cx="21" cy="16" r="5.5" fill="currentColor"/>
    </svg>`;
  }
  return `<svg class="mode-preview" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M16 9 L6 26 L26 26 Z" fill="currentColor"/>
  </svg>`;
}

function fillPreviewSvg(mode) {
  const cy = FILL_PREVIEW_SHAPE_Y + FILL_PREVIEW_SHAPE_R;
  if (mode === "circles") {
    const circles = FILL_PREVIEW_CIRCLE_XS.map((x, i) => (
      `<circle cx="${x}" cy="${cy}" r="${FILL_PREVIEW_SHAPE_R}" fill="${FILL_PREVIEW_CIRCLE_COLORS[i]}"/>`
    )).join("");
    return `<svg class="fill-preview" viewBox="0 0 40 32" aria-hidden="true">${circles}</svg>`;
  }
  if (mode === "split") {
    const [leftX, rightX] = FILL_PREVIEW_SPLIT_XS;
    return `<svg class="fill-preview" viewBox="0 0 40 32" aria-hidden="true">
      <circle cx="${leftX}" cy="${cy}" r="${FILL_PREVIEW_SHAPE_R}" fill="${FILL_PREVIEW_COLORS[0]}"/>
      <defs>
        <linearGradient id="fill-split-grad" x1="${rightX - FILL_PREVIEW_SHAPE_R}" y1="${cy}" x2="${rightX + FILL_PREVIEW_SHAPE_R}" y2="${cy}" gradientUnits="userSpaceOnUse">${fillShapePreviewStops()}</linearGradient>
      </defs>
      <circle cx="${rightX}" cy="${cy}" r="${FILL_PREVIEW_SHAPE_R}" fill="url(#fill-split-grad)"/>
    </svg>`;
  }
  return `<svg class="fill-preview" viewBox="0 0 40 32" aria-hidden="true">
      <defs>
        <linearGradient id="fill-shape-grad" x1="2" y1="${cy}" x2="38" y2="${cy}" gradientUnits="userSpaceOnUse">${fillShapePreviewStops()}</linearGradient>
      </defs>
      <rect x="2" y="${FILL_PREVIEW_SHAPE_Y}" width="36" height="${FILL_PREVIEW_SHAPE_H}" rx="${FILL_PREVIEW_SHAPE_R}" fill="url(#fill-shape-grad)"/>
    </svg>`;
}

function availableLetterModes(templateId = state.template) {
  return LETTER_MODES.filter((mode) => mode !== "geometric" || GEOMETRIC_LETTERS.has(templateId));
}

function ensureLetterModeForTemplate() {
  const allowed = availableLetterModes(state.template);
  if (allowed.includes(state.letterMode)) {
    syncLetterModeUi();
    return;
  }
  snapshotLetterModeShape(state.letterMode);
  state.letterMode = allowed[0];
  applyLetterModeShape(state.letterMode);
  syncLetterModeUi();
}

function bindLetterModeUi() {
  bindToggleGroup("letter-mode-grid", [
    { id: "blobby", name: "Blobby Shapes", preview: letterModePreviewSvg("blobby") },
    { id: "circles", name: "Circles", preview: letterModePreviewSvg("circles") },
    { id: "geometric", name: "Geometric Shapes", preview: letterModePreviewSvg("geometric") },
  ], () => state.letterMode, (id) => {
    if (!availableLetterModes().includes(id)) return;
    if (id !== state.letterMode) {
      snapshotLetterModeShape(state.letterMode);
      state.letterMode = id;
      applyLetterModeShape(id);
      if (id === "geometric") resetGeometricLabelCorners();
      resetGeometricLabelEditingState();
    }
    regenerateCurrentPath();
  });
  syncLetterModeUi();
}

function syncTemplateUi() {
  syncToggleButtons("template-grid", state.template);
}

function syncLetterModeUi() {
  const allowed = availableLetterModes(state.template);
  const grid = document.getElementById("letter-mode-grid");
  if (!grid) return;
  grid.querySelectorAll("button").forEach((el) => {
    const id = el.dataset.id;
    const enabled = allowed.includes(id);
    el.disabled = !enabled;
    el.setAttribute("aria-pressed", String(id === state.letterMode));
    if (id === "blobby") {
      el.title = "Blobby Shapes";
    } else if (id === "circles") {
      el.title = "Circles";
    } else if (id === "geometric") {
      el.title = enabled ? "Geometric Shapes" : "Geometric is only available for D, V, S, and C";
    }
  });
  syncBlobbyControlsUi();
  syncFillModeUi();
}

function syncToggleButtons(elementId, value) {
  const grid = document.getElementById(elementId);
  if (!grid) return;
  grid.querySelectorAll("button").forEach((el) => {
    el.setAttribute("aria-pressed", String(el.dataset.id === value));
  });
}

function randomFromInput(id) {
  const input = document.getElementById(id);
  return randomInRange(Number(input.min), Number(input.max), Number(input.step) || 0.01);
}

function randomInRange(min, max, step = 0.01) {
  const steps = Math.round((max - min) / step);
  const n = Math.floor(Math.random() * (steps + 1));
  const value = min + n * step;
  const decimals = (String(step).split(".")[1] || "").length;
  return Number(value.toFixed(decimals));
}

function randomizeCeeBlobbyShape() {
  state.ellipseSize = randomInRange(160, 250, 1);
  state.jitterRadius = 0;
  state.pathScale = randomInRange(0.2, 0.5, 0.01);
}

function randomizeCeeCirclesShape() {
  state.pathScale = randomInRange(0.25, 0.5, 0.01);
  state.ellipseSize = randomInRange(125, 186, 1);
  state.spacing = randomInRange(0.55, 0.8, 0.01);
  state.jitterRadius = 0;
}

function randomizeVeeCirclesShape() {
  state.spacing = randomInRange(0.5, 0.75, 0.01);
  state.ellipseSize = randomInRange(142, 200, 1);
  state.jitterRadius = randomInRange(0, 0.1, 0.01);
  state.relaxAmount = Math.random() < 0.7 ? 0 : randomInRange(0, 0.07, 0.01);
  state.relaxVariation = randomFromInput("relax-random");
}

function edgeLabelStartLimits() {
  if (state.template === "sweep" && state.letterMode === "blobby") {
    return EDGE_LABEL_START_S;
  }
  return EDGE_LABEL_START;
}

function randomizeBlobbyEdgeLabels() {
  const [startMin, startMax] = edgeLabelStartLimits();
  state.edgeLabelStart = randomInRange(startMin, startMax, 1);
  state.edgeLabelGap = randomInRange(EDGE_LABEL_GAP_RANDOM[0], EDGE_LABEL_GAP_RANDOM[1], 1);
}

function randomizeVeeBlobbyShape() {
  state.ellipseSize = randomInRange(165, 235, 1);
  state.jitterRadius = randomInRange(0, 0.2, 0.01);
  randomizeBlobbyEdgeLabels();
}

function randomizeMoonBlobbyShape() {
  state.ellipseSize = randomInRange(150, 200, 1);
  state.jitterRadius = randomInRange(0, 0.06, 0.01);
  randomizeBlobbyEdgeLabels();
}

function randomizeSweepBlobbyShape() {
  state.ellipseSize = randomInRange(170, 210, 1);
  state.jitterRadius = randomInRange(0, 0.05, 0.01);
}

function randomizeSweepCirclesShape() {
  state.ellipseSize = randomInRange(140, 160, 1);
  state.spacing = randomInRange(0.5, 0.8, 0.01);
  state.jitterRadius = randomInRange(0, 0.05, 0.01);
  state.relaxAmount = 0;
  state.relaxVariation = 0;
}

function randomizeMoonCirclesShape() {
  state.ellipseSize = randomInRange(128, 180, 1);
  state.jitterRadius = randomInRange(0, 0.05, 0.01);
}

function isTemplateShapeSpecial(template = state.template, mode = state.letterMode) {
  if (template === "sweep" && (mode === "blobby" || mode === "circles")) return true;
  if (template === "moon" && (mode === "blobby" || mode === "circles")) return true;
  if (template === "cee" && (mode === "blobby" || mode === "circles")) return true;
  if (template === "v" && (mode === "blobby" || mode === "circles")) return true;
  return false;
}

function maybeRandomizeTemplateShape() {
  if (state.template === "moon" && state.letterMode === "blobby") {
    randomizeMoonBlobbyShape();
  } else if (state.template === "moon" && state.letterMode === "circles") {
    randomizeMoonCirclesShape();
  } else if (state.template === "cee" && state.letterMode === "blobby") {
    randomizeCeeBlobbyShape();
  } else if (state.template === "cee" && state.letterMode === "circles") {
    randomizeCeeCirclesShape();
  } else if (state.template === "v" && state.letterMode === "blobby") {
    randomizeVeeBlobbyShape();
  } else if (state.template === "v" && state.letterMode === "circles") {
    randomizeVeeCirclesShape();
  } else if (state.template === "sweep" && state.letterMode === "blobby") {
    randomizeSweepBlobbyShape();
  } else if (state.template === "sweep" && state.letterMode === "circles") {
    randomizeSweepCirclesShape();
  } else if (state.template === "moon" && state.letterMode === "geometric") {
    randomizeGeometricDShape();
  } else if (state.template === "v" && state.letterMode === "geometric") {
    randomizeGeometricVShape();
  } else if (state.template === "sweep" && state.letterMode === "geometric") {
    randomizeGeometricSShape();
  } else if (state.template === "cee" && state.letterMode === "geometric") {
    randomizeGeometricCShape();
  } else {
    return;
  }
  syncShapeControlsFromState();
  setRangeDisplay("relax", "relax-label", state.relaxAmount, (value) => `${Math.round(value * 100)}%`);
  setRangeDisplay("relax-random", "relax-random-label", state.relaxVariation, (value) => `${Math.round(value * 100)}%`);
}

function randomizeTreatmentParams(mode) {
  state.fillMode = mode === "geometric" ? pick(["circles", "split"]) : pick(["circles", "shape"]);
  if (mode !== "geometric") {
    state.jitterRadius = randomFromInput("jitter");
    if (mode === "circles") {
      state.spacing = randomFromInput("spacing");
    }
  }
  snapshotLetterModeShape(mode);
  syncShapeControlsFromState();
  setRangeDisplay("relax", "relax-label", state.relaxAmount, (value) => `${Math.round(value * 100)}%`);
  setRangeDisplay("relax-random", "relax-random-label", state.relaxVariation, (value) => `${Math.round(value * 100)}%`);
  syncToggleButtons("fill-mode-grid", state.fillMode);
  syncFillModeUi();
}

function randomizeCompositionForTemplate(templateId, options = {}) {
  const pathScale = state.pathScale;
  const ellipseSize = state.ellipseSize;
  snapshotLetterModeShape(state.letterMode);
  state.template = templateId;
  state.letterMode = pick(availableLetterModes(state.template));
  applyLetterModeShape(state.letterMode);
  const isTemplateSpecial = isTemplateShapeSpecial(state.template, state.letterMode);
  if (!isTemplateSpecial && state.letterMode !== "geometric") {
    state.pathScale = pathScale;
    state.ellipseSize = ellipseSize;
  }
  randomizeTreatmentParams(state.letterMode);
  if (orderedPalette.length > 1) {
    state.colorPath = randomColorPath();
    refreshActiveColors();
  }
  maybeRandomizeTemplateShape();
  generatePath();
  rebuildPath();
  if (options.syncUi) {
    syncTemplateUi();
    syncLetterModeUi();
    redraw();
  }
}

function randomizeComposition() {
  randomizeCompositionForTemplate(pick(TEMPLATES).id, { syncUi: true });
  if (usingGeometric()) resetGeometricLabelEditingState();
  syncBlobbyControlsUi();
  syncEdgeLabelsUi();
}

function stickersPerSheetPage() {
  return SHEET_STICKERS_PER_PAGE;
}

function totalSheetStickerCount() {
  return stickersPerSheetPage() * creationSheet.sheetCount;
}

function hasGeneratedSheets() {
  return creationSheet.sheets.some((sheet) => sheet.stickers.length > 0);
}

function flatSheetStickerCount() {
  return creationSheet.sheets.reduce((total, sheet) => total + sheet.stickers.length, 0);
}

function getFlatSheetSticker(flatIndex) {
  let index = flatIndex;
  for (const sheet of creationSheet.sheets) {
    if (index < sheet.stickers.length) return sheet.stickers[index];
    index -= sheet.stickers.length;
  }
  return null;
}

function setFlatSheetSticker(flatIndex, snapshot) {
  let index = flatIndex;
  for (const sheet of creationSheet.sheets) {
    if (index < sheet.stickers.length) {
      sheet.stickers[index] = snapshot;
      return;
    }
    index -= sheet.stickers.length;
  }
}

function clearCreationSheet() {
  creationSheet.sheets = [];
  creationSheet.previewStack = null;
  creationSheet.cachedImage = null;
  creationSheet.editingIndex = -1;
  creationSheet.sourceCanvasW = 0;
  creationSheet.sourceCanvasH = 0;
}

function buildBalancedTemplateIds(count) {
  const templateIds = TEMPLATES.map((template) => template.id);
  const order = [];
  const base = Math.floor(count / templateIds.length);
  let remainder = count % templateIds.length;
  templateIds.forEach((id) => {
    for (let i = 0; i < base; i++) order.push(id);
  });
  if (remainder > 0) {
    shuffleArray(templateIds.slice()).slice(0, remainder).forEach((id) => order.push(id));
  }
  return shuffleArray(order);
}

function shuffleArray(items) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function snapshotLetterModeShape(mode) {
  const stored = letterModeShape[mode];
  if (!stored) return;
  LETTER_SHAPE_KEYS.forEach((key) => {
    stored[key] = state[key];
  });
}

function applyLetterModeShape(mode) {
  const stored = letterModeShape[mode];
  if (!stored) return;
  LETTER_SHAPE_KEYS.forEach((key) => {
    state[key] = stored[key];
  });
  syncShapeControlsFromState();
}

function syncShapeControlsFromState() {
  if (!state.rescaleLetters) {
    setRangeDisplay("path-scale", "path-scale-label", state.pathScale, (value) => `${Math.round(value * 100)}%`);
  }
  setRangeDisplay("ellipse-size", "ellipse-label", state.ellipseSize, (value) => String(value));
  setRangeDisplay("spacing", "spacing-label", state.spacing, (value) => value.toFixed(2));
  setRangeDisplay("jitter", "jitter-label", state.jitterRadius, (value) => `${Math.round(value * 100)}%`);
  setRangeDisplay("geo-v-leg-gap", "geo-v-leg-gap-label", state.geoVLegGap, (value) => `${Math.round(value)}px`);
  setRangeDisplay("geo-v-leg-aspect-1", "geo-v-leg-aspect-1-label", state.geoVLegAspect1, formatGeoVLegAspect);
  setRangeDisplay("geo-v-leg-aspect-2", "geo-v-leg-aspect-2-label", state.geoVLegAspect2, formatGeoVLegAspect);
  setRangeDisplay("geo-v-leg-rotation-1", "geo-v-leg-rotation-1-label", state.geoVLegRotation1, formatGeoVLegRotation);
  setRangeDisplay("geo-v-leg-rotation-2", "geo-v-leg-rotation-2-label", state.geoVLegRotation2, formatGeoVLegRotation);
  setRangeDisplay("geo-v-y-shift", "geo-v-y-shift-label", state.geoVYShiftAmount, formatGeoVYShift);
  setRangeDisplay("geo-d-bowl-rotation", "geo-d-bowl-rotation-label", state.geoDBowlRotation, formatGeoDBowlRotation);
  setRangeDisplay("geo-d-bowl-shift-x", "geo-d-bowl-shift-x-label", state.geoDBowlShiftX, formatGeoDBowlShift);
  setRangeDisplay("geo-d-bowl-shift-y", "geo-d-bowl-shift-y-label", state.geoDBowlShiftY, formatGeoDBowlShift);
  setRangeDisplay("geo-c-stroke-weight", "geo-c-stroke-weight-label", state.geoCStrokeWeight, (value) => `${Math.round(value)}px`);
  setRangeDisplay("geo-c-top-rotation", "geo-c-top-rotation-label", state.geoCTopRotation, formatGeoCRotation);
  setRangeDisplay("geo-c-bottom-rotation", "geo-c-bottom-rotation-label", state.geoCBotRotation, formatGeoCRotation);
  setRangeDisplay("geo-c-distance", "geo-c-distance-label", state.geoCDistance, (value) => `${Math.round(value)}px`);
  setRangeDisplay("geo-c-overlap", "geo-c-overlap-label", state.geoCOverlap, (value) => `${Math.round(value)}px`);
  setRangeDisplay("geo-s-stroke-weight", "geo-s-stroke-weight-label", state.geoSStrokeWeight, (value) => `${Math.round(value)}px`);
  setRangeDisplay("geo-s-top-rotation", "geo-s-top-rotation-label", state.geoSTopRotation, formatGeoCRotation);
  setRangeDisplay("geo-s-bottom-rotation", "geo-s-bottom-rotation-label", state.geoSBotRotation, formatGeoCRotation);
  setRangeDisplay("geo-s-distance", "geo-s-distance-label", state.geoSDistance, (value) => `${Math.round(value)}px`);
  setRangeDisplay("geo-s-overlap", "geo-s-overlap-label", state.geoSOverlap, (value) => `${Math.round(value)}px`);
}

function formatGeoDBowlRotation(value) {
  return `${Math.round(value)}°`;
}

function formatGeoCRotation(value) {
  return `${Math.round(value * 10) / 10}°`;
}

function formatGeoDBowlShift(value) {
  return `${value > 0 ? "+" : ""}${Math.round(value)}px`;
}

function formatGeoVLegAspect(value) {
  return value.toFixed(2);
}

function formatGeoVLegRotation(value) {
  return `${Math.round(value)}°`;
}

function formatGeoVYShift(value) {
  if (!state.geoVYShiftLeg || value === 0) return `${Math.round(value)}px`;
  const signed = state.geoVYShiftSign * value;
  return `${signed > 0 ? "+" : ""}${Math.round(signed)}px`;
}

function geoVLegAnchorY(baseY, leg) {
  if (state.geoVYShiftLeg !== leg) return baseY;
  return baseY + state.geoVYShiftSign * state.geoVYShiftAmount;
}

function setRangeDisplay(id, labelId, value, format) {
  const input = document.getElementById(id);
  const label = document.getElementById(labelId);
  if (input) input.value = String(value);
  if (label) label.textContent = format(value);
}

function effectiveCircleSpacing() {
  if (state.letterMode === "circles") return state.spacing;
  return LETTER_SHAPE_DEFAULTS.blobby.spacing;
}

function syncBlobbyControlsUi() {
  const geometric = usingGeometric();
  const geoD = document.getElementById("geo-d-controls");
  const geoV = document.getElementById("geo-v-controls");
  const geoC = document.getElementById("geo-c-controls");
  const geoS = document.getElementById("geo-s-controls");
  const blobby = document.getElementById("blobby-shape-controls");
  const relax = document.getElementById("relax-section");
  const spacing = document.getElementById("circle-spacing-controls");
  const ellipseSize = document.getElementById("ellipse-size");
  if (geoD) geoD.hidden = !(geometric && state.template === "moon");
  if (geoV) geoV.hidden = !(geometric && state.template === "v");
  if (geoC) geoC.hidden = !(geometric && state.template === "cee");
  if (geoS) geoS.hidden = !(geometric && state.template === "sweep");
  if (blobby) blobby.hidden = geometric;
  if (relax) relax.hidden = state.letterMode !== "circles";
  if (spacing) spacing.hidden = geometric || state.letterMode !== "circles";
  if (ellipseSize) {
    let max = 200;
    if (state.template === "cee" && state.letterMode === "blobby") max = 250;
    else if (state.template === "v" && state.letterMode === "blobby") max = 235;
    else if (state.template === "sweep" && state.letterMode === "blobby") max = 210;
    else if (state.template === "sweep" && state.letterMode === "circles") max = 160;
    ellipseSize.max = String(max);
    if (state.ellipseSize > max) {
      state.ellipseSize = max;
      setRangeDisplay("ellipse-size", "ellipse-label", state.ellipseSize, (value) => String(value));
    }
  }
  syncEdgeLabelsUi();
}

function bindFillModeUi() {
  bindToggleGroup("fill-mode-grid", [
    { id: "circles", name: "Circles", preview: fillPreviewSvg("circles") },
    { id: "shape", name: "Shape", preview: fillPreviewSvg("shape") },
    { id: "split", name: "Split", preview: fillPreviewSvg("split") },
  ], () => state.fillMode, (id) => {
    if (id === "split" && !geometricSplitFillAvailable()) return;
    state.fillMode = id;
  });
}

function syncFillModeUi() {
  const grid = document.getElementById("fill-mode-grid");
  if (!grid) return;
  const splitAvailable = geometricSplitFillAvailable();
  grid.querySelectorAll("button").forEach((el) => {
    const enabled = el.dataset.id !== "split" || splitAvailable;
    el.disabled = !enabled;
    if (el.dataset.id === "split") {
      el.title = splitAvailable ? "Split" : "Split fill is only available for geometric shapes";
    }
  });
  if (!splitAvailable && state.fillMode === "split") {
    state.fillMode = "circles";
    syncToggleButtons("fill-mode-grid", state.fillMode);
  }
}

function bindToggleGroup(elementId, items, getValue, setValue) {
  const grid = document.getElementById(elementId);
  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.id = item.id;
    button.setAttribute("aria-pressed", String(item.id === getValue()));
    if (item.preview) {
      button.classList.add("preview-btn");
      button.setAttribute("aria-label", item.name);
      button.setAttribute("title", item.name);
      button.innerHTML = item.preview;
    } else {
      button.textContent = item.name;
    }
    button.addEventListener("click", () => {
      setValue(item.id);
      grid.querySelectorAll("button").forEach((el) => {
        el.setAttribute("aria-pressed", String(el.dataset.id === getValue()));
      });
      redraw();
    });
    grid.appendChild(button);
  });
}

function bindRange(id, labelId, onChange, format) {
  const input = document.getElementById(id);
  const label = document.getElementById(labelId);
  const fmt = format || (id === "spacing" ? (v) => v.toFixed(2) : (v) => String(v));
  input.addEventListener("input", () => {
    const value = Number(input.value);
    label.textContent = fmt(value);
    onChange(value);
    redraw();
  });
}

function paletteColors() {
  return PALETTES.find((item) => item.id === state.palette)?.colors ?? PALETTES[0].colors;
}

function applyPalette(id, options = {}) {
  const palette = PALETTES.find((item) => item.id === id);
  if (!palette) return;
  state.palette = id;
  const previous = selectedIndices().map((index) => orderedPalette[index]);
  orderedPalette = orderPaletteForGradient(palette.colors);
  state.colorPath = remapColorPath(previous);
  renderPaletteWheel();
  refreshActiveColors();
  rebuildPath();
  if (options.redraw !== false) redraw();
}

function selectedIndices() {
  const n = orderedPalette.length;
  return state.colorPath
    .filter((index) => Number.isInteger(index) && index >= 0 && index < n)
    .slice(0, MAX_GRADIENT_COLORS);
}

function canConnect(fromHex, toHex) {
  if (!fromHex || !toHex || fromHex === toHex) return false;
  const allowed = COLOR_CONNECTIONS[fromHex];
  if (!allowed) return true;
  return allowed.has(toHex);
}

function connectableIndices(fromIndex, usedPath) {
  if (usedPath.length >= MAX_GRADIENT_COLORS) return [];
  const used = new Set(usedPath);
  const fromHex = orderedPalette[fromIndex];
  const next = [];
  for (let i = 0; i < orderedPalette.length; i++) {
    if (used.has(i)) continue;
    if (canConnect(fromHex, orderedPalette[i])) next.push(i);
  }
  return next;
}

function defaultColorPath(count = 4) {
  const n = orderedPalette.length;
  if (n === 0) return [];
  const path = [0];
  const target = Math.min(Math.max(1, count), n, MAX_GRADIENT_COLORS);
  while (path.length < target) {
    const from = path[path.length - 1];
    const choices = connectableIndices(from, path);
    if (!choices.length) break;
    const preferred = choices.find((index) => index > from) ?? choices[0];
    path.push(preferred);
  }
  return path;
}

function randomColorPath() {
  const n = orderedPalette.length;
  if (n === 0) return [];
  const path = [Math.floor(Math.random() * n)];
  const cap = Math.min(n, MAX_GRADIENT_COLORS);
  const maxLen = Math.min(cap, 2 + Math.floor(Math.random() * Math.max(1, cap - 1)));
  while (path.length < maxLen) {
    const choices = connectableIndices(path[path.length - 1], path);
    if (!choices.length) break;
    path.push(choices[Math.floor(Math.random() * choices.length)]);
  }
  return path;
}

function remapColorPath(previousHexes) {
  const n = orderedPalette.length;
  if (n === 0) return [];
  const next = [];
  for (const hex of previousHexes) {
    const index = orderedPalette.indexOf(hex);
    if (index < 0) break;
    if (next.length && !canConnect(orderedPalette[next[next.length - 1]], hex)) break;
    if (next.includes(index)) break;
    if (next.length >= MAX_GRADIENT_COLORS) break;
    next.push(index);
  }
  return next.length ? next : defaultColorPath();
}

function refreshActiveColors() {
  activeColors = selectedIndices().map((index) => orderedPalette[index]);
  updateWheelSelection();
}

function swatchAngle(index, count) {
  return -Math.PI / 2 + (index / Math.max(count, 1)) * Math.PI * 2;
}

function computeWheelLayout(count) {
  const n = Math.max(count, 1);
  const spacing = SWATCH_SIZE + SWATCH_GAP;
  const radius = n <= 1 ? 0 : spacing / 2 / Math.sin(Math.PI / n);
  const size = Math.ceil(2 * (radius + SWATCH_SIZE / 2 + SWATCH_HALO));
  return { radius, size, cx: size / 2, cy: size / 2 };
}

function swatchPoint(index, count = orderedPalette.length) {
  const angle = swatchAngle(index, count);
  return polar(wheelLayout.cx, wheelLayout.cy, wheelLayout.radius, angle);
}

function renderPaletteWheel() {
  const wheel = document.getElementById("palette-wheel");
  const svg = wheel.querySelector(".palette-wheel-svg");
  const dots = document.getElementById("palette-wheel-dots");
  const n = orderedPalette.length;
  wheelLayout = computeWheelLayout(n);
  wheel.style.width = `${wheelLayout.size}px`;
  wheel.style.height = `${wheelLayout.size}px`;
  svg.setAttribute("viewBox", `0 0 ${wheelLayout.size} ${wheelLayout.size}`);
  dots.replaceChildren(
    ...orderedPalette.map((hex, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "palette-dot";
      button.dataset.index = String(index);
      button.style.background = hex;
      button.setAttribute("aria-label", `Color ${index + 1} of ${n}`);
      const point = swatchPoint(index, n);
      button.style.left = `${point.x}px`;
      button.style.top = `${point.y}px`;
      return button;
    })
  );
  updateWheelSelection();
}

function polar(cx, cy, radius, angle) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function svgGradient(id, from, to, a, b) {
  const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  gradient.id = id;
  gradient.setAttribute("gradientUnits", "userSpaceOnUse");
  gradient.setAttribute("x1", String(a.x));
  gradient.setAttribute("y1", String(a.y));
  gradient.setAttribute("x2", String(b.x));
  gradient.setAttribute("y2", String(b.y));
  const start = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  start.setAttribute("offset", "0");
  start.setAttribute("stop-color", from);
  const end = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  end.setAttribute("offset", "1");
  end.setAttribute("stop-color", to);
  gradient.append(start, end);
  return gradient;
}

function svgLine(a, b, stroke, className) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", String(a.x));
  line.setAttribute("y1", String(a.y));
  line.setAttribute("x2", String(b.x));
  line.setAttribute("y2", String(b.y));
  line.setAttribute("stroke", stroke);
  if (className) line.setAttribute("class", className);
  return line;
}

function connectionOrigin(drag) {
  if (drag?.active) return drag.startIndex;
  const path = selectedIndices();
  return path.length ? path[path.length - 1] : -1;
}

function connectionUsedPath(drag) {
  const path = selectedIndices();
  if (!drag?.active) return path;
  if (path.length && drag.startIndex === path[path.length - 1]) return path;
  return [drag.startIndex];
}

function renderWheelLinks(path, drag) {
  const defs = document.getElementById("palette-wheel-defs");
  const links = document.getElementById("palette-wheel-links");
  const preview = document.getElementById("palette-wheel-preview");
  defs.replaceChildren();
  links.replaceChildren();

  const n = orderedPalette.length;
  for (let i = 1; i < path.length; i++) {
    const a = swatchPoint(path[i - 1], n);
    const b = swatchPoint(path[i], n);
    const id = `palette-link-${i - 1}`;
    defs.appendChild(svgGradient(id, orderedPalette[path[i - 1]], orderedPalette[path[i]], a, b));
    links.appendChild(svgLine(a, b, `url(#${id})`, "palette-wheel-link"));
  }

  if (!drag?.active || !drag.didMove || drag.startIndex < 0) {
    preview.removeAttribute("d");
    preview.removeAttribute("stroke");
    return;
  }
  const origin = swatchPoint(drag.startIndex, n);
  const hover = drag.hoverIndex;
  const used = connectionUsedPath(drag);
  const canDrop = hover >= 0 && hover !== drag.startIndex && used.includes(hover) === false
    && canConnect(orderedPalette[drag.startIndex], orderedPalette[hover]);
  const dest = canDrop ? swatchPoint(hover, n) : drag.pointer;
  preview.setAttribute("d", `M ${origin.x} ${origin.y} L ${dest.x} ${dest.y}`);
  if (canDrop) {
    defs.appendChild(svgGradient(
      "palette-link-preview",
      orderedPalette[drag.startIndex],
      orderedPalette[hover],
      origin,
      dest
    ));
    preview.setAttribute("stroke", "url(#palette-link-preview)");
  } else {
    preview.setAttribute("stroke", "#555");
  }
}

function updateWheelSelection(drag = null) {
  const path = selectedIndices();
  const selected = new Set(path);
  const origin = connectionOrigin(drag);
  const used = connectionUsedPath(drag);
  const targets = origin >= 0 ? new Set(connectableIndices(origin, used)) : null;
  const hover = drag?.active ? drag.hoverIndex : -1;

  document.querySelectorAll(".palette-dot").forEach((el) => {
    const index = Number(el.dataset.index);
    const isSelected = selected.has(index);
    const isTarget = !targets || targets.has(index);
    el.classList.toggle("is-selected", isSelected);
    el.classList.toggle("is-start", path[0] === index);
    el.classList.toggle("is-end", path.length > 0 && path[path.length - 1] === index);
    const isDisabled = index !== origin && Boolean(targets) && !isTarget && !isSelected;
    el.classList.toggle("is-disabled", isDisabled);
    el.classList.toggle("is-connect-target", hover === index && isTarget);
    el.setAttribute("aria-pressed", String(isSelected && !isDisabled));
    el.setAttribute("aria-disabled", String(isDisabled));
  });

  renderWheelLinks(path, drag);
}

function wheelPoint(wheel, event) {
  const rect = wheel.getBoundingClientRect();
  const scaleX = wheelLayout.size / Math.max(rect.width, 1);
  const scaleY = wheelLayout.size / Math.max(rect.height, 1);
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function indexFromPointer(wheel, event, maxDist = SWATCH_SIZE) {
  const hit = event.target.closest?.("[data-index]");
  if (hit && !event.target.closest?.(".palette-wheel-svg")) {
    return Number(hit.dataset.index);
  }
  const pt = wheelPoint(wheel, event);
  let best = -1;
  let bestDist = maxDist;
  const n = orderedPalette.length;
  for (let i = 0; i < n; i++) {
    const point = swatchPoint(i, n);
    const dist = Math.hypot(pt.x - point.x, pt.y - point.y);
    if (dist <= bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

function applyColorClick(index) {
  const path = selectedIndices();
  if (path.includes(index)) {
    state.colorPath = path.filter((item) => item !== index);
    return;
  }
  const last = path[path.length - 1];
  if (
    path.length
    && path.length < MAX_GRADIENT_COLORS
    && canConnect(orderedPalette[last], orderedPalette[index])
  ) {
    state.colorPath = path.concat(index);
    return;
  }
  state.colorPath = [index];
}

function applyColorConnect(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex === fromIndex) return false;
  if (!canConnect(orderedPalette[fromIndex], orderedPalette[toIndex])) return false;
  const path = selectedIndices();
  const extending = path.length && fromIndex === path[path.length - 1];
  if (extending) {
    if (path.length >= MAX_GRADIENT_COLORS) return false;
    if (path.includes(toIndex)) return false;
    state.colorPath = path.concat(toIndex);
    return true;
  }
  if (path.includes(fromIndex)) return false;
  state.colorPath = [fromIndex, toIndex];
  return true;
}

function bindPaletteWheel() {
  const wheel = document.getElementById("palette-wheel");
  const drag = {
    active: false,
    didMove: false,
    connectDrag: false,
    startIndex: -1,
    hoverIndex: -1,
    pointer: { x: 0, y: 0 },
    originX: 0,
    originY: 0,
  };

  const stopDrag = () => {
    drag.active = false;
    drag.didMove = false;
    drag.connectDrag = false;
    drag.startIndex = -1;
    drag.hoverIndex = -1;
    wheel.classList.remove("is-dragging");
    updateWheelSelection();
  };

  wheel.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || orderedPalette.length === 0) return;
    const startIndex = indexFromPointer(wheel, event);
    if (startIndex < 0) return;
    event.preventDefault();
    const path = selectedIndices();
    const last = path[path.length - 1];
    drag.startIndex = startIndex;
    drag.hoverIndex = startIndex;
    drag.didMove = false;
    drag.connectDrag = !path.includes(startIndex) || startIndex === last;
    drag.active = true;
    drag.originX = event.clientX;
    drag.originY = event.clientY;
    drag.pointer = wheelPoint(wheel, event);
    wheel.setPointerCapture(event.pointerId);
    if (drag.connectDrag) {
      wheel.classList.add("is-dragging");
      updateWheelSelection(drag);
    }
  });

  wheel.addEventListener("pointermove", (event) => {
    if (!drag.active || !drag.connectDrag) return;
    const dist = Math.hypot(event.clientX - drag.originX, event.clientY - drag.originY);
    if (!drag.didMove && dist < DRAG_THRESHOLD_PX) return;
    drag.didMove = true;
    drag.pointer = wheelPoint(wheel, event);
    drag.hoverIndex = indexFromPointer(wheel, event);
    updateWheelSelection(drag);
  });

  const endDrag = (event) => {
    if (!drag.active) return;
    const startIndex = drag.startIndex;
    const didMove = drag.didMove;
    const connectDrag = drag.connectDrag;
    const hoverIndex = indexFromPointer(wheel, event);
    stopDrag();
    if (startIndex < 0) return;
    if (!didMove) applyColorClick(startIndex);
    else if (connectDrag) applyColorConnect(startIndex, hoverIndex);
    refreshActiveColors();
    redraw();
  };

  wheel.addEventListener("pointerup", endDrag);
  wheel.addEventListener("pointercancel", () => {
    if (!drag.active) return;
    stopDrag();
  });
}

function rebuildPath() {
  if (!generatedPath) generatePath();
  invalidateSilhouetteCache();
  const template = generatedPath;
  updateCanvasGuidelines();
  const pathScale = state.rescaleLetters
    ? computeRescalePathScale(template)
    : state.pathScale;
  const { mapPoint, ox, oy, w, h } = layoutAtPathScale(template, pathScale);
  canvasPath.unmap = makeUnmapper(template.bbox, ox, oy, w, h, template.preserveAspect);
  canvasPath.hideHandles = Boolean(template.hideHandles);
  if (template.kind === "geometric") {
    canvasPath.geometric = (template.primitives || []).map((item) => mapPrimitive(item, mapPoint));
    if (
      (state.template === "cee" || state.template === "sweep")
      && state.letterMode === "geometric"
    ) {
      canvasPath.geometric = canvasPath.geometric.map((item) => {
        const offsets = geometricPieceOffsets(item.variant);
        if (!offsets.x && !offsets.y) return item;
        const { dx, dy } = geometricOffsetCanvasDelta(mapPoint, offsets.x, offsets.y);
        return offsetCanvasGeometric([item], dx, dy)[0];
      });
    }
    canvasPath.segments = [];
    canvasPath.anchors = [];
    canvasPath.origins = [];
    pathPoints = sampleGeometricPoints(canvasPath.geometric);
    relaxState.from = copyPoints(pathPoints);
    relaxState.to = null;
  } else {
    canvasPath.geometric = [];
    canvasPath.segments = template.segments.map((seg) => {
      const p0 = mapPoint(seg[0], seg[1]);
      const c1 = mapPoint(seg[2], seg[3]);
      const c2 = mapPoint(seg[4], seg[5]);
      const p3 = mapPoint(seg[6], seg[7]);
      return [p0.x, p0.y, c1.x, c1.y, c2.x, c2.y, p3.x, p3.y];
    });
    canvasPath.anchors = template.anchors.map((p) => mapPoint(p.x, p.y));
    canvasPath.origins = mapOriginPoints(template, mapPoint);
    const spacing = Math.max(1, state.ellipseSize * effectiveCircleSpacing());
    pathPoints = resamplePathPoints(
      canvasPath.segments,
      canvasPath.anchors,
      spacing,
      Boolean(generatedPath && generatedPath.closed),
    );
    prepareRelaxTargets();
  }
  if (state.rescaleLetters) {
    const bounds = measureLetterCanvasBounds(template, pathScale);
    const band = guidelineBand();
    applyCanvasOffsetY(band.center - bounds.center);
  }
  syncRescaleUi(pathScale);
}

function layoutAtPathScale(template, pathScale) {
  const padX = width * 0.06;
  const padY = height * 0.08;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const scale = pathScale * (template.fitScale || 1);
  const w = innerW * scale;
  const h = innerH * scale;
  const ox = (width - w) / 2;
  const oy = (height - h) / 2;
  return {
    mapPoint: makeMapper(template.bbox, ox, oy, w, h, template.preserveAspect),
    ox,
    oy,
    w,
    h,
  };
}

function guidelineBand() {
  const capY = canvasPath.guidelines.cap[1];
  const baselineY = canvasPath.guidelines.baseline[1];
  return {
    top: capY - GUIDELINE_OVERFLOW,
    bottom: baselineY + GUIDELINE_OVERFLOW,
    height: baselineY - capY + GUIDELINE_OVERFLOW * 2,
    center: (capY + baselineY) / 2,
  };
}

function mapTemplateSegments(template, mapPoint) {
  return template.segments.map((seg) => {
    const p0 = mapPoint(seg[0], seg[1]);
    const c1 = mapPoint(seg[2], seg[3]);
    const c2 = mapPoint(seg[4], seg[5]);
    const p3 = mapPoint(seg[6], seg[7]);
    return [p0.x, p0.y, c1.x, c1.y, c2.x, c2.y, p3.x, p3.y];
  });
}

function boundsFromCanvasPoints(points, pad = 0) {
  let minY = Infinity;
  let maxY = -Infinity;
  points.forEach((point) => {
    minY = Math.min(minY, point.y - pad);
    maxY = Math.max(maxY, point.y + pad);
  });
  if (!Number.isFinite(minY) || !Number.isFinite(maxY)) {
    return { minY: 0, maxY: 0, height: 0, center: 0 };
  }
  return {
    minY,
    maxY,
    height: maxY - minY,
    center: (minY + maxY) / 2,
  };
}

function geometricCanvasBounds(primitives, strokePad) {
  const points = [];
  (primitives || []).forEach((item) => {
    if (item.type === "rect") {
      points.push(
        { x: item.x, y: item.y },
        { x: item.x, y: item.y + item.h },
        { x: item.x + item.w, y: item.y },
        { x: item.x + item.w, y: item.y + item.h },
      );
      return;
    }
    if (item.type === "rotatedRect") {
      rotatedRectCorners(item).forEach((corner) => points.push(corner));
      return;
    }
    if (isThickStrokePrimitive(item)) {
      const bounds = strokePathOutlineBounds(item, SHAPE_STROKE_PX * 2, strokePad);
      points.push(
        { x: bounds.minX, y: bounds.minY },
        { x: bounds.maxX, y: bounds.maxY },
      );
      return;
    }
    if (item.type === "semicircle") {
      for (let i = 0; i <= 24; i++) {
        const angle = -Math.PI / 2 + item.rotation + (i / 24) * Math.PI;
        points.push({
          x: item.cx + item.r * Math.cos(angle),
          y: item.cy + item.r * Math.sin(angle),
        });
      }
    }
  });
  return boundsFromCanvasPoints(points, strokePad);
}

function measureLetterCanvasBounds(template, pathScale) {
  const strokePad = SHAPE_STROKE_PX;
  const { mapPoint } = layoutAtPathScale(template, pathScale);
  if (template.kind === "geometric") {
    const primitives = (template.primitives || []).map((item) => mapPrimitive(item, mapPoint));
    return geometricCanvasBounds(primitives, strokePad);
  }
  const radius = state.ellipseSize / 2 + strokePad;
  const segments = mapTemplateSegments(template, mapPoint);
  const samples = sampleBeziers(segments);
  const spacing = Math.max(1, state.ellipseSize * effectiveCircleSpacing());
  const points = resampleByDistance(samples, spacing, Boolean(template.closed));
  const allPoints = samples.concat(points);
  return boundsFromCanvasPoints(allPoints, radius);
}

function computeRescalePathScale(template) {
  const band = guidelineBand();
  if (band.height <= 0) return state.pathScale;
  let lo = 0.05;
  let hi = 2;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const bounds = measureLetterCanvasBounds(template, mid);
    if (bounds.height <= band.height) lo = mid;
    else hi = mid;
  }
  return lo;
}

function shiftPrimitiveY(primitive, offsetY) {
  if (primitive.type === "rect") {
    return { ...primitive, y: primitive.y + offsetY };
  }
  if (primitive.type === "semicircle") {
    return { ...primitive, cy: primitive.cy + offsetY };
  }
  if (primitive.type === "rotatedRect") {
    return { ...primitive, anchorY: primitive.anchorY + offsetY };
  }
  if (primitive.type === "lStroke" || primitive.type === "bezierStroke") {
    return { ...primitive, anchorY: primitive.anchorY + offsetY };
  }
  return primitive;
}

function applyCanvasOffsetY(offsetY) {
  if (!offsetY) return;
  canvasPath.segments = canvasPath.segments.map((seg) => [
    seg[0], seg[1] + offsetY,
    seg[2], seg[3] + offsetY,
    seg[4], seg[5] + offsetY,
    seg[6], seg[7] + offsetY,
  ]);
  canvasPath.anchors = canvasPath.anchors.map((point) => ({
    ...point,
    y: point.y + offsetY,
  }));
  canvasPath.origins = canvasPath.origins.map((origin) => ({
    ...origin,
    y: origin.y + offsetY,
    movedY: origin.movedY + offsetY,
  }));
  canvasPath.geometric = canvasPath.geometric.map((item) => shiftPrimitiveY(item, offsetY));
  pathPoints = pathPoints.map((point) => ({ ...point, y: point.y + offsetY }));
  if (relaxState.from) {
    relaxState.from = relaxState.from.map((point) => ({ ...point, y: point.y + offsetY }));
  }
  if (relaxState.to) {
    relaxState.to = relaxState.to.map((point) => ({ ...point, y: point.y + offsetY }));
  }
}

function syncEdgeLabelS69State() {
  const chars = activeEdgeLabelChars();
  const existing = new Map(state.geoManualLabelPlacements.map((item) => [item.char, item]));
  state.geoManualLabelPlacements = chars.map((char) => existing.get(char) || {
    char,
    x: null,
    y: null,
    rotation: 0,
    placed: false,
    anchor: DEFAULT_MANUAL_LABEL_ANCHOR,
  });
  if (state.geoLabelCornerIndices.length !== chars.length) {
    state.geoLabelCornerIndices = geometricDefaultLabelCornerIndices().slice();
  }
  geoManualLabelDrag = null;
  rebuildManualLetterGrid();
}

function rebuildManualLetterGrid() {
  const grid = document.getElementById("geo-manual-letter-grid");
  if (!grid) return;
  grid.replaceChildren();
  bindToggleGroup(
    "geo-manual-letter-grid",
    activeEdgeLabelChars().map((char) => ({ id: char, name: char })),
    () => state.geoManualLabelPlacements[state.geoManualLabelEditIndex]?.char || activeEdgeLabelChars()[0],
    (char) => {
      const index = activeEdgeLabelChars().indexOf(char);
      if (index >= 0) state.geoManualLabelEditIndex = index;
      syncManualLabelUi();
      redraw();
    },
  );
}

function bindEdgeLabelsUi() {
  const input = document.getElementById("edge-labels");
  if (!input) return;
  input.checked = state.edgeLabels;
  input.addEventListener("change", () => {
    state.edgeLabels = input.checked;
    syncEdgeLabelsUi();
    redraw();
  });
  syncEdgeLabelsUi();
}

function bindEdgeLabelS69Ui() {
  const input = document.getElementById("edge-label-s69");
  if (!input) return;
  input.checked = state.edgeLabelS69;
  input.addEventListener("change", () => {
    state.edgeLabelS69 = input.checked;
    syncEdgeLabelS69State();
    syncEdgeLabelsUi();
    redraw();
  });
}

function bindEdgeLabelDirectionUi() {
  const button = document.getElementById("edge-label-reverse");
  if (!button) return;
  button.addEventListener("click", () => {
    state.edgeLabelReversed = !state.edgeLabelReversed;
    syncEdgeLabelsUi();
    redraw();
  });
}

function syncManualLayoutModeSwitch() {
  syncSegmentedControl("geo-manual-layout-mode-control", state.geoManualLabelLayoutMode);
}

function bindManualLayoutModeSwitch() {
  const control = document.getElementById("geo-manual-layout-mode-control");
  if (!control) return;
  control.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      setManualLabelLayoutMode(button.dataset.id);
    });
  });
}

function bindManualLabelUi() {
  bindManualLayoutModeSwitch();
  syncManualLayoutModeSwitch();

  rebuildManualLetterGrid();

  const startOverButton = document.getElementById("geo-manual-label-start-over");
  if (startOverButton) {
    startOverButton.addEventListener("click", () => {
      restartManualLabelPlacement();
    });
  }

  bindManualLabelRotationUi();
}

function clampManualLabelRotation(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(180, Math.max(-180, Math.round(value)));
}

function syncManualLabelRotationControls(rotation) {
  const clamped = clampManualLabelRotation(rotation);
  const range = document.getElementById("geo-manual-label-rotation");
  const number = document.getElementById("geo-manual-label-rotation-input");
  if (range) range.value = String(clamped);
  if (number) number.value = String(clamped);
  return clamped;
}

function bindManualLabelRotationUi() {
  const range = document.getElementById("geo-manual-label-rotation");
  const number = document.getElementById("geo-manual-label-rotation-input");
  if (!range || !number) return;

  const applyRotation = (value) => {
    const placement = manualLabelPlacement(state.geoManualLabelEditIndex);
    if (!placement) return;
    placement.rotation = syncManualLabelRotationControls(value);
    redraw();
  };

  range.addEventListener("input", () => applyRotation(Number(range.value)));
  number.addEventListener("input", () => applyRotation(Number(number.value)));
  number.addEventListener("change", () => applyRotation(Number(number.value)));
}

function syncManualLabelUi() {
  const section = document.getElementById("geo-manual-label-section");
  const controls = document.getElementById("geo-manual-letter-controls");
  const hint = document.getElementById("geo-manual-label-hint");
  const startOverButton = document.getElementById("geo-manual-label-start-over");
  const letterGrid = document.getElementById("geo-manual-letter-grid");
  const manualLayout = supportsManualLabelLayout();
  const editing = manualLayout && state.geoManualLabelLayoutMode === "editing";
  const placement = manualLabelPlacement(state.geoManualLabelEditIndex);

  if (section) section.hidden = !manualLayout;
  if (letterGrid) letterGrid.hidden = state.geoManualLabelLayoutMode !== "editing";
  if (controls) controls.hidden = !editing || !placement?.placed;
  if (manualLayout) syncManualLayoutModeSwitch();

  const labelChars = activeEdgeLabelChars();
  const placedCount = manualLabelPlacementCount();
  const nextIndex = nextManualLabelPlacementIndex();
  if (editing) {
    const selectedChar = placement?.char || labelChars[state.geoManualLabelEditIndex];
    syncToggleButtons("geo-manual-letter-grid", selectedChar);
    if (placement?.placed) {
      syncManualLabelRotationControls(placement.rotation);
    }
  }

  if (startOverButton) {
    startOverButton.hidden = !editing;
    startOverButton.disabled = !state.edgeLabels || placedCount === 0;
  }

  if (hint) {
    if (!manualLayout) {
      hint.textContent = "Letter editing is available in geometric or circles mode.";
    } else if (state.geoManualLabelLayoutMode === "fixed") {
      if (placedCount === 0 && usingGeometric() && !templateHasDefaultGeometricLabels()) {
        hint.textContent = "No letters yet. Switch to editing to place them on the canvas.";
      } else if (placedCount === 0) {
        hint.textContent = "Default letters are shown. Switch to editing to reposition them.";
      } else {
        hint.textContent = "Letters are locked in place. Switch to editing to reposition or rotate them.";
      }
    } else if (nextIndex >= 0) {
      const nextChar = labelChars[nextIndex];
      hint.textContent = `Click inside the highlighted zone to place ${nextChar} (${nextIndex + 1}/${labelChars.length}), or drag existing letters.`;
    } else if (placedCount === labelChars.length) {
      hint.textContent = "All letters placed. Drag to reposition, or switch to fixed to lock them.";
    } else {
      hint.textContent = "Drag labels to reposition, or select one below to adjust rotation.";
    }
  }
}

function syncModeHint() {
  const hint = document.getElementById("mode-hint");
  if (!hint || state.appMode === "sheet") return;
  if (creationSheet.editingIndex >= 0) {
    hint.textContent = `Editing sticker ${creationSheet.editingIndex + 1}. Switch to Sheet to update the sheet.`;
    return;
  }
  if (supportsManualLabelLayout() && state.geoManualLabelLayoutMode === "editing") {
    const nextIndex = nextManualLabelPlacementIndex();
    if (nextIndex >= 0) {
      const labelChars = activeEdgeLabelChars();
      const nextChar = labelChars[nextIndex];
      hint.textContent = `Editing letters: click to place ${nextChar} (${nextIndex + 1}/${labelChars.length}). Esc exits editing.`;
      return;
    }
  }
  hint.textContent = "R regenerates. D shows handles. G shows guidelines. S saves.";
}

function syncEdgeLabelsUi() {
  const input = document.getElementById("edge-labels");
  const s69Input = document.getElementById("edge-label-s69");
  const offsetSlider = document.getElementById("edge-label-offset");
  const startSlider = document.getElementById("edge-label-start");
  const gapSlider = document.getElementById("edge-label-gap");
  const disabled = !state.edgeLabels;
  const geometric = usingGeometric();
  const circles = state.letterMode === "circles";
  const customPlacements = hasCustomManualLabelPlacements();
  const editingLabels = supportsManualLabelLayout() && state.geoManualLabelLayoutMode === "editing";
  const manualCirclesLabels = circles && (editingLabels || customPlacements);
  const [startMin, startMax] = edgeLabelStartLimits();
  if (input) input.checked = state.edgeLabels;
  if (s69Input) {
    s69Input.checked = state.edgeLabelS69;
    s69Input.disabled = disabled;
  }
  if (offsetSlider) {
    offsetSlider.disabled = disabled || editingLabels || customPlacements
      || (geometric && !templateHasDefaultGeometricLabels())
      || manualCirclesLabels;
  }
  if (startSlider) {
    startSlider.disabled = disabled || geometric || manualCirclesLabels;
    startSlider.min = String(startMin);
    startSlider.max = String(startMax);
    state.edgeLabelStart = Math.max(startMin, Math.min(startMax, state.edgeLabelStart));
  }
  if (gapSlider) gapSlider.disabled = disabled || geometric || manualCirclesLabels;
  syncManualLabelUi();
  const directionRow = document.getElementById("edge-label-direction-row");
  const directionButton = document.getElementById("edge-label-reverse");
  const showDirection = supportsEdgeLabelDirectionToggle();
  if (directionRow) directionRow.hidden = !showDirection;
  if (directionButton) {
    directionButton.disabled = disabled || !showDirection;
    directionButton.textContent = edgeLabelDirectionLabel();
    directionButton.setAttribute("aria-pressed", String(edgeLabelOrderReversed()));
  }
  setRangeDisplay(
    "edge-label-offset",
    "edge-label-offset-label",
    state.edgeLabelOffset,
    (value) => `${Math.round(value)}px`,
  );
  setRangeDisplay(
    "edge-label-start",
    "edge-label-start-label",
    state.edgeLabelStart,
    (value) => `${Math.round(value)}px`,
  );
  setRangeDisplay(
    "edge-label-gap",
    "edge-label-gap-label",
    state.edgeLabelGap,
    (value) => `${Math.round(value)}px`,
  );
}

function bindRescaleUi() {
  const input = document.getElementById("rescale-letters");
  if (!input) return;
  input.checked = state.rescaleLetters;
  input.addEventListener("change", () => {
    state.rescaleLetters = input.checked;
    rebuildPath();
    redraw();
  });
}

function syncRescaleUi(effectivePathScale = state.pathScale) {
  const input = document.getElementById("rescale-letters");
  const slider = document.getElementById("path-scale");
  if (input) input.checked = state.rescaleLetters;
  if (slider) slider.disabled = state.rescaleLetters;
  if (effectivePathScale != null) {
    setRangeDisplay(
      "path-scale",
      "path-scale-label",
      effectivePathScale,
      (value) => `${Math.round(value * 100)}%`,
    );
  }
}

function updateCanvasGuidelines() {
  const midY = height / 2;
  const half = GUIDELINE_HEIGHT / 2;
  const capY = midY - half;
  const baselineY = midY + half;
  canvasPath.guidelines = {
    cap: [0, capY, width, capY],
    baseline: [0, baselineY, width, baselineY],
  };
}

function copyPoints(points) {
  return points.map((point) => ({ x: point.x, y: point.y }));
}

function prepareRelaxTargets() {
  relaxState.from = copyPoints(pathPoints);
  relaxState.to = null;
  if (!relaxState.weights || relaxState.weights.length !== pathPoints.length) {
    relaxState.weights = pathPoints.map(() => Math.random());
  }
  applyRelaxMix();
}

function applyRelaxMix() {
  const from = relaxState.from;
  if (!from || from.length !== pathPoints.length) return;
  const amount = state.letterMode === "circles"
    ? Math.max(0, Math.min(1, state.relaxAmount))
    : 0;
  if (amount <= 0) {
    for (let i = 0; i < pathPoints.length; i++) {
      pathPoints[i].x = from[i].x;
      pathPoints[i].y = from[i].y;
    }
    return;
  }
  if (!relaxState.to || relaxState.to.length !== from.length) {
    relaxState.to = computeRelaxedPoints(from);
  }
  const to = relaxState.to;
  const variation = Math.max(0, Math.min(1, state.relaxVariation));
  const weights = relaxState.weights || [];
  for (let i = 0; i < pathPoints.length; i++) {
    const random = weights[i] ?? 1;
    const mix = amount * (1 - variation * (1 - random));
    pathPoints[i].x = from[i].x + (to[i].x - from[i].x) * mix;
    pathPoints[i].y = from[i].y + (to[i].y - from[i].y) * mix;
  }
}

function pathCentroid(points) {
  if (!points.length) return { x: 0, y: 0 };
  let x = 0;
  let y = 0;
  for (let i = 0; i < points.length; i++) {
    x += points[i].x;
    y += points[i].y;
  }
  return { x: x / points.length, y: y / points.length };
}

function recenterPoints(points, origin) {
  const c = pathCentroid(points);
  const dx = origin.x - c.x;
  const dy = origin.y - c.y;
  if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return;
  for (let i = 0; i < points.length; i++) {
    points[i].x += dx;
    points[i].y += dy;
  }
}

function consecutiveCount(n, closed) {
  if (n < 2) return 0;
  return closed ? n : n - 1;
}

function pairAxis(a, b, i, j) {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let dist = Math.hypot(dx, dy);
  if (dist < 1e-6) {
    const angle = (i * 12.9898 + j * 78.233) % (Math.PI * 2);
    dx = Math.cos(angle);
    dy = Math.sin(angle);
    dist = 1e-6;
  }
  return { dx, dy, dist };
}

function resolvePackedCircles(points, minDist, maxDist, closed, pullNeighbors) {
  const n = points.length;
  if (n < 2) return 0;
  const links = consecutiveCount(n, closed);
  let maxMove = 0;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = points[i];
      const b = points[j];
      const { dx, dy, dist } = pairAxis(a, b, i, j);
      if (dist >= minDist) continue;
      const corr = ((minDist - dist) / dist) * 0.5 * RELAX_PUSH;
      const mx = dx * corr;
      const my = dy * corr;
      a.x -= mx;
      a.y -= my;
      b.x += mx;
      b.y += my;
      maxMove = Math.max(maxMove, Math.hypot(mx, my) * 2);
    }
  }

  if (pullNeighbors) {
    for (let i = 0; i < links; i++) {
      const j = (i + 1) % n;
      const a = points[i];
      const b = points[j];
      const { dx, dy, dist } = pairAxis(a, b, i, j);
      if (dist <= maxDist) continue;
      const corr = ((maxDist - dist) / dist) * 0.5 * RELAX_PULL;
      const mx = dx * corr;
      const my = dy * corr;
      a.x -= mx;
      a.y -= my;
      b.x += mx;
      b.y += my;
      maxMove = Math.max(maxMove, Math.hypot(mx, my) * 2);
    }
  }

  return maxMove;
}

function hasOverlaps(points, diameter) {
  const n = points.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.hypot(points[j].x - points[i].x, points[j].y - points[i].y) < diameter - 0.6) {
        return true;
      }
    }
  }
  return false;
}

function packingSatisfied(points, diameter, maxDist, closed) {
  const n = points.length;
  if (n < 2) return true;
  const links = consecutiveCount(n, closed);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dist = Math.hypot(points[j].x - points[i].x, points[j].y - points[i].y);
      if (dist < diameter - 0.6) return false;
    }
  }
  for (let i = 0; i < links; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    if (dist > maxDist + 0.6) return false;
  }
  return true;
}

function computeRelaxedPoints(source) {
  if (source.length < 2) return copyPoints(source);
  const points = copyPoints(source);
  const origin = pathCentroid(points);
  const closed = Boolean(generatedPath && generatedPath.closed);
  const diameter = state.ellipseSize;
  const links = consecutiveCount(points.length, closed);
  let nearest = Infinity;
  for (let i = 0; i < links; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    nearest = Math.min(nearest, Math.hypot(b.x - a.x, b.y - a.y));
  }
  let sep = Math.min(diameter, Math.max(1, nearest || 1));
  let settledFrames = 0;
  for (let frame = 0; frame < 720; frame++) {
    if (sep < diameter) {
      const remain = diameter - sep;
      sep = Math.min(diameter, sep + Math.max(0.9, remain * 0.05));
    }
    const minDist = sep;
    const maxDist = minDist + RELAX_MAX_GAP;
    const grown = sep >= diameter - 0.05;
    if (grown && !hasOverlaps(points, diameter)) {
      settledFrames += 1;
      if (settledFrames > 5) break;
    } else {
      settledFrames = 0;
    }
    const iters = grown ? RELAX_ITERS + 8 : RELAX_ITERS;
    for (let iter = 0; iter < iters; iter++) {
      resolvePackedCircles(points, minDist, maxDist, closed, false);
    }
    recenterPoints(points, origin);
  }
  return points;
}

function getRelaxStats() {
  const diameter = state.ellipseSize;
  const n = pathPoints.length;
  let minAll = Infinity;
  let overlaps = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dist = Math.hypot(pathPoints[j].x - pathPoints[i].x, pathPoints[j].y - pathPoints[i].y);
      if (dist < minAll) minAll = dist;
      if (dist < diameter - 0.6) overlaps += 1;
    }
  }
  return {
    count: n,
    diameter,
    minAll: minAll === Infinity ? 0 : minAll,
    overlaps,
    amount: state.relaxAmount,
    variation: state.relaxVariation,
    fromCount: relaxState.from ? relaxState.from.length : 0,
    toCount: relaxState.to ? relaxState.to.length : 0,
    weightCount: relaxState.weights ? relaxState.weights.length : 0,
  };
}

function sampleBeziers(segments) {
  const points = [];
  segments.forEach((seg, index) => {
    const [x0, y0, x1, y1, x2, y2, x3, y3] = seg;
    const steps = 48;
    const start = index === 0 ? 0 : 1;
    for (let i = start; i <= steps; i++) {
      const t = i / steps;
      points.push({
        x: bezierPoint(x0, x1, x2, x3, t),
        y: bezierPoint(y0, y1, y2, y3, t),
      });
    }
  });
  return points;
}

function regenerateCurrentPath() {
  maybeRandomizeTemplateShape();
  generatePath();
  rebuildPath();
  if (usingGeometric()) resetGeometricLabelEditingState();
  syncBlobbyControlsUi();
  syncEdgeLabelsUi();
  syncFillModeUi();
  redraw();
}

function generatePath() {
  relaxState.weights = null;
  pathEdit.drag = null;
  pathEdit.hover = null;
  state.radialEdge = pick(["left", "right", "top", "bottom"]);
  const template = TEMPLATES.find((item) => item.id === state.template);
  if (state.letterMode === "geometric" && GEOMETRIC_LETTERS.has(template.id)) {
    const geometric = generateGeometricLetter(template.id);
    if (geometric) {
      generatedPath = geometric;
      return;
    }
  }
  if (template.id === "sweep") {
    generatedPath = generateSweepPath();
  } else if (template.id === "v") {
    generatedPath = generateAcceptedVeePath();
    return;
  } else if (template.id === "cee") {
    generatedPath = generateCeePath();
  } else {
    generatedPath = {
      anchors: template.anchors.map((point) => ({ id: point.id, x: point.x, y: point.y })),
      segments: template.segments
        ? template.segments.map((seg) => seg.slice())
        : smoothCubicsThrough(template.anchors, template.closed),
      bbox: template.bbox,
      preserveAspect: Boolean(template.preserveAspect),
      closed: template.closed,
      hideHandles: Boolean(template.hideHandles),
      fitScale: template.fitScale || 1,
    };
  }
  jitterGeneratedPath(generatedPath);
}

function generateGeometricLetter(templateId) {
  if (templateId === "moon") return generateGeometricD();
  if (templateId === "v") return generateGeometricV();
  if (templateId === "sweep") return generateGeometricS();
  if (templateId === "cee") return generateGeometricC();
  return null;
}

function semicircleMinX(cx, cy, r, rotationRad) {
  const a0 = -Math.PI / 2 + rotationRad;
  const a1 = Math.PI / 2 + rotationRad;
  let minX = Infinity;
  for (let i = 0; i <= 48; i++) {
    const angle = a0 + (i / 48) * (a1 - a0);
    minX = Math.min(minX, cx + r * Math.cos(angle));
  }
  minX = Math.min(minX, cx + r * Math.cos(a0), cx + r * Math.cos(a1));
  return minX;
}

function geometricDBowlTouchesStem(stemW, radius, shiftX, shiftY, rotationDeg) {
  const cx = stemW + shiftX;
  const cy = radius + shiftY;
  const rotationRad = rotationDeg * (Math.PI / 180);
  return semicircleMinX(cx, cy, radius, rotationRad) <= stemW + 1e-6;
}

function resolveGeometricDBowlRotationForTouch(stemW, radius, shiftX, shiftY, preferredDeg) {
  const minRot = GEO_D_BOWL_ROTATION[0];
  const maxRot = GEO_D_BOWL_ROTATION[1];
  const clampedPreferred = clamp(preferredDeg, minRot, maxRot);
  if (geometricDBowlTouchesStem(stemW, radius, shiftX, shiftY, clampedPreferred)) {
    return clampedPreferred;
  }

  const candidates = [];
  const steps = 160;
  for (let i = 0; i <= steps; i++) {
    const rot = minRot + (i / steps) * (maxRot - minRot);
    if (geometricDBowlTouchesStem(stemW, radius, shiftX, shiftY, rot)) {
      candidates.push(rot);
    }
  }
  if (candidates.length === 0) {
    let bestRot = clampedPreferred;
    let bestMinX = Infinity;
    for (let i = 0; i <= steps; i++) {
      const rot = minRot + (i / steps) * (maxRot - minRot);
      const cx = stemW + shiftX;
      const minX = semicircleMinX(cx, radius + shiftY, radius, rot * (Math.PI / 180));
      if (minX < bestMinX) {
        bestMinX = minX;
        bestRot = rot;
      }
    }
    return bestRot;
  }

  let closest = candidates[0];
  let closestDist = Math.abs(closest - clampedPreferred);
  candidates.forEach((rot) => {
    const dist = Math.abs(rot - clampedPreferred);
    if (dist < closestDist) {
      closest = rot;
      closestDist = dist;
    }
  });
  return closest;
}

function randomizeGeometricDShape() {
  const stemW = GEO_D_STEM_W;
  const radius = GEO_D_H / 2;
  state.geoDBowlShiftX = randRange(-GEO_D_BOWL_SHIFT_X, GEO_D_BOWL_SHIFT_X);
  state.geoDBowlShiftY = randRange(GEO_D_BOWL_SHIFT_Y[0], GEO_D_BOWL_SHIFT_Y[1]);
  const preferredRotation = randRange(GEO_D_BOWL_ROTATION[0], GEO_D_BOWL_ROTATION[1]);
  state.geoDBowlRotation = resolveGeometricDBowlRotationForTouch(
    stemW,
    radius,
    state.geoDBowlShiftX,
    state.geoDBowlShiftY,
    preferredRotation,
  );
}

function refreshGeometricDPath() {
  if (state.template !== "moon" || state.letterMode !== "geometric") return;
  generatedPath = generateGeometricD();
  rebuildPath();
}

function generateGeometricD() {
  const stemW = GEO_D_STEM_W;
  const height = GEO_D_H;
  const radius = height / 2;
  const rotation = clamp(state.geoDBowlRotation, GEO_D_BOWL_ROTATION[0], GEO_D_BOWL_ROTATION[1]) * (Math.PI / 180);
  const shiftX = clamp(state.geoDBowlShiftX, -GEO_D_BOWL_SHIFT_X, GEO_D_BOWL_SHIFT_X);
  const shiftY = clamp(state.geoDBowlShiftY, GEO_D_BOWL_SHIFT_Y[0], GEO_D_BOWL_SHIFT_Y[1]);
  const primitives = [
    { type: "rect", x: 0, y: 0, w: stemW, h: height },
    {
      type: "semicircle",
      cx: stemW + shiftX,
      cy: radius + shiftY,
      r: radius,
      rotation,
    },
  ];
  return {
    kind: "geometric",
    primitives,
    anchors: [],
    segments: [],
    bbox: geometricDBounds(stemW, height, radius),
    preserveAspect: true,
    closed: true,
    hideHandles: true,
  };
}

function geometricDBounds(stemW, height, radius) {
  const pad = height * 0.04;
  return {
    minX: Math.min(0, stemW - GEO_D_BOWL_SHIFT_X - radius) - pad,
    minY: Math.min(0, GEO_D_BOWL_SHIFT_Y[0]) - pad,
    maxX: Math.max(stemW, stemW + GEO_D_BOWL_SHIFT_X + radius) + pad,
    maxY: Math.max(height, radius + GEO_D_BOWL_SHIFT_Y[1] + radius) + pad,
  };
}

function randomizeGeometricVShape() {
  state.geoVLeftW = randRange(GEO_V_LEG_W[0], GEO_V_LEG_W[1]);
  state.geoVRightW = randRange(GEO_V_LEG_W[0], GEO_V_LEG_W[1]);
  state.geoVYShiftLeg = Math.random() < 0.5 ? "left" : "right";
  state.geoVYShiftSign = Math.random() < 0.5 ? -1 : 1;
  state.geoVYShiftAmount = randRange(GEO_V_LEG_Y_SHIFT[0], GEO_V_LEG_Y_SHIFT[1]);
  const signedYShift = state.geoVYShiftSign * state.geoVYShiftAmount;
  if (signedYShift > GEO_V_Y_SHIFT_GAP_THRESHOLD) {
    state.geoVLegGap = randRange(
      GEO_V_LEG_GAP_Y_SHIFT_UP[0],
      GEO_V_LEG_GAP_Y_SHIFT_UP[1],
    );
  } else {
    const inward = Math.random() < 0.5;
    state.geoVLegGap = inward
      ? randRange(GEO_V_LEG_GAP_INWARD[0], GEO_V_LEG_GAP_INWARD[1])
      : randRange(GEO_V_LEG_GAP_OUTWARD[0], GEO_V_LEG_GAP_OUTWARD[1]);
  }
}

function refreshGeometricVPath() {
  if (state.template !== "v" || state.letterMode !== "geometric") return;
  generatedPath = generateGeometricV();
  rebuildPath();
}

function refreshGeometricSPath() {
  if (state.template !== "sweep" || state.letterMode !== "geometric") return;
  generatedPath = generateGeometricS();
  rebuildPath();
}

function refreshGeometricCPath() {
  if (state.template !== "cee" || state.letterMode !== "geometric") return;
  generatedPath = generateGeometricC();
  rebuildPath();
}

function randomizeGeometricCShape() {
  state.geoCStrokeWeight = randRange(GEO_C_STROKE[0], GEO_C_STROKE[1]);
  state.geoCTopRotation = randRange(GEO_C_ROT[0], GEO_C_ROT[1]);
  state.geoCBotRotation = randRange(GEO_C_ROT[0], GEO_C_ROT[1]);
  state.geoCDistance = randRange(GEO_C_DISTANCE[0], GEO_C_DISTANCE[1]);
  state.geoCOverlap = randRange(GEO_C_OVERLAP[0], GEO_C_OVERLAP[1]);
}

function randomizeGeometricSShape() {
  state.geoSStrokeWeight = randRange(GEO_S_STROKE[0], GEO_S_STROKE[1]);
  state.geoSTopRotation = randRange(GEO_S_ROT[0], GEO_S_ROT[1]);
  state.geoSBotRotation = randRange(GEO_S_ROT[0], GEO_S_ROT[1]);
  state.geoSDistance = randRange(GEO_S_DISTANCE[0], GEO_S_DISTANCE[1]);
  state.geoSOverlap = randRange(GEO_S_OVERLAP[0], GEO_S_OVERLAP[1]);
}

function lStrokeLocalPoints(variant, legVertical, legHorizontal, flipX = false) {
  let points;
  if (variant === "top") {
    points = [
      { x: 0, y: 0 },
      { x: 0, y: legVertical },
      { x: -legHorizontal, y: legVertical },
    ];
  } else {
    points = [
      { x: 0, y: 0 },
      { x: 0, y: -legVertical },
      { x: legHorizontal, y: -legVertical },
    ];
  }
  if (!flipX) return points;
  return points.map((point) => ({ x: -point.x, y: point.y }));
}

function lStrokeWorldPoints(primitive) {
  const { anchorX, anchorY, legVertical, legHorizontal, rotation, variant, flipX } = primitive;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return lStrokeLocalPoints(variant, legVertical, legHorizontal, flipX).map((point) => ({
    x: anchorX + point.x * cos - point.y * sin,
    y: anchorY + point.x * sin + point.y * cos,
  }));
}

function rotateAboutPoint(cx, cy, x, y, rad) {
  const dx = x - cx;
  const dy = y - cy;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  };
}

function cubicBezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
}

function sampleBezierCurves(start, curves, steps = 32) {
  const points = [start];
  let current = start;
  (curves || []).forEach((curve) => {
    for (let i = 1; i <= steps; i++) {
      points.push(cubicBezierPoint(current, curve.cp1, curve.cp2, curve.end, i / steps));
    }
    current = curve.end;
  });
  return points;
}

function bezierStrokeLocalPoints(primitive) {
  const topPoints = sampleBezierCurves({ x: 0, y: 0 }, primitive.curves);
  if (primitive.reflectAxisY == null) return topPoints;
  return topPoints
    .map((point) => ({ x: point.x, y: 2 * primitive.reflectAxisY - point.y }))
    .reverse();
}

function bezierStrokeWorldPoints(primitive) {
  const cos = Math.cos(primitive.rotation);
  const sin = Math.sin(primitive.rotation);
  return bezierStrokeLocalPoints(primitive).map((point) => ({
    x: primitive.anchorX + point.x * cos - point.y * sin,
    y: primitive.anchorY + point.x * sin + point.y * cos,
  }));
}

function strokePathWorldPoints(primitive) {
  if (primitive.type === "lStroke") return lStrokeWorldPoints(primitive);
  if (primitive.type === "bezierStroke") return bezierStrokeWorldPoints(primitive);
  return [];
}

function lStrokeBounds(primitive, pad = 0) {
  const pts = strokePathWorldPoints(primitive);
  const half = primitive.strokeWeight / 2 + pad;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  pts.forEach((point) => {
    minX = Math.min(minX, point.x - half);
    maxX = Math.max(maxX, point.x + half);
    minY = Math.min(minY, point.y - half);
    maxY = Math.max(maxY, point.y + half);
  });
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const dy = pts[i + 1].y - pts[i].y;
    const len = Math.hypot(dx, dy);
    if (len <= 0) continue;
    const nx = (-dy / len) * half;
    const ny = (dx / len) * half;
    [pts[i], pts[i + 1]].forEach((point) => {
      minX = Math.min(minX, point.x + nx, point.x - nx);
      maxX = Math.max(maxX, point.x + nx, point.x - nx);
      minY = Math.min(minY, point.y + ny, point.y - ny);
      maxY = Math.max(maxY, point.y + ny, point.y - ny);
    });
  }
  return { minX, minY, maxX, maxY };
}

function lStrokeUnit(dx, dy) {
  const len = Math.hypot(dx, dy);
  if (len <= 1e-9) return { x: 1, y: 0 };
  return { x: dx / len, y: dy / len };
}

function lStrokeLineIntersection(p1, d1, p2, d2) {
  const cross = d1.x * d2.y - d1.y * d2.x;
  if (Math.abs(cross) < 1e-9) {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  }
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const t = (dx * d2.y - dy * d2.x) / cross;
  return { x: p1.x + t * d1.x, y: p1.y + t * d1.y };
}

function offsetClosedPolygon(points, offset) {
  const n = points.length;
  if (n < 3 || offset <= 0) return points.slice();
  const segments = [];
  for (let i = 0; i < n; i++) {
    const p0 = points[i];
    const p1 = points[(i + 1) % n];
    const dir = lStrokeUnit(p1.x - p0.x, p1.y - p0.y);
    segments.push({ dir, normal: { x: -dir.y, y: dir.x } });
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const prev = segments[(i - 1 + n) % n];
    const next = segments[i];
    const corner = points[i];
    const prevPt = {
      x: corner.x + prev.normal.x * offset,
      y: corner.y + prev.normal.y * offset,
    };
    const nextPt = {
      x: corner.x + next.normal.x * offset,
      y: corner.y + next.normal.y * offset,
    };
    out.push(lStrokeLineIntersection(prevPt, prev.dir, nextPt, next.dir));
  }
  return out;
}

function lStrokeFillCorners(primitive, outlinePad = 0) {
  const pts = strokePathWorldPoints(primitive);
  const hw = (primitive.strokeWeight + outlinePad) / 2;
  if (pts.length < 2 || hw <= 0) return [];

  const segments = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const dir = lStrokeUnit(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    segments.push({ dir, normal: { x: -dir.y, y: dir.x } });
  }

  const capExtend = outlinePad > 0 ? outlinePad * 0.5 : 0;
  const left = [];
  const right = [];
  const first = segments[0];
  left.push({
    x: pts[0].x - first.dir.x * capExtend + first.normal.x * hw,
    y: pts[0].y - first.dir.y * capExtend + first.normal.y * hw,
  });
  right.push({
    x: pts[0].x - first.dir.x * capExtend - first.normal.x * hw,
    y: pts[0].y - first.dir.y * capExtend - first.normal.y * hw,
  });

  for (let i = 1; i < pts.length - 1; i++) {
    const prev = segments[i - 1];
    const next = segments[i];
    const corner = pts[i];
    const leftPrev = {
      x: corner.x + prev.normal.x * hw,
      y: corner.y + prev.normal.y * hw,
    };
    const leftNext = {
      x: corner.x + next.normal.x * hw,
      y: corner.y + next.normal.y * hw,
    };
    left.push(lStrokeLineIntersection(leftPrev, prev.dir, leftNext, next.dir));

    const rightPrev = {
      x: corner.x - prev.normal.x * hw,
      y: corner.y - prev.normal.y * hw,
    };
    const rightNext = {
      x: corner.x - next.normal.x * hw,
      y: corner.y - next.normal.y * hw,
    };
    right.push(lStrokeLineIntersection(rightPrev, prev.dir, rightNext, next.dir));
  }

  const last = segments[segments.length - 1];
  const end = pts[pts.length - 1];
  left.push({
    x: end.x + last.dir.x * capExtend + last.normal.x * hw,
    y: end.y + last.dir.y * capExtend + last.normal.y * hw,
  });
  right.push({
    x: end.x + last.dir.x * capExtend - last.normal.x * hw,
    y: end.y + last.dir.y * capExtend - last.normal.y * hw,
  });

  return left.concat(right.reverse());
}

function strokePathOutlineBounds(primitive, outlinePad = SHAPE_STROKE_PX * 2, pad = 0) {
  const corners = lStrokeFillCorners(primitive, outlinePad);
  if (!corners.length) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  corners.forEach((point) => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });
  return {
    minX: minX - pad,
    minY: minY - pad,
    maxX: maxX + pad,
    maxY: maxY + pad,
  };
}

function lStrokeFillPath(primitive, outlinePad = 0) {
  const corners = lStrokeFillCorners(primitive, outlinePad);
  const path = new Path2D();
  if (!corners.length) return path;
  path.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < corners.length; i++) {
    path.lineTo(corners[i].x, corners[i].y);
  }
  path.closePath();
  return path;
}

function lStrokeUnionPath(primitives, outlinePad = 0) {
  const path = new Path2D();
  (primitives || []).forEach((item) => path.addPath(lStrokeFillPath(item, outlinePad)));
  return path;
}

function fillLStrokeOnContext(ctx, primitive, outlinePad = 0) {
  const corners = lStrokeFillCorners(primitive, outlinePad);
  if (corners.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < corners.length; i++) {
    ctx.lineTo(corners[i].x, corners[i].y);
  }
  ctx.closePath();
  ctx.fill();
}

function fillLPrimitive(ctx, primitive, options = {}) {
  fillLStrokeOnContext(ctx, primitive, options.outlinePad || 0);
}

function geometricCCurveData(flipX = false) {
  return GEO_C_TOP_CURVES.map((curve) => ({
    cp1: { x: flipX ? -curve.cp1.x : curve.cp1.x, y: curve.cp1.y },
    cp2: { x: flipX ? -curve.cp2.x : curve.cp2.x, y: curve.cp2.y },
    end: { x: flipX ? -curve.end.x : curve.end.x, y: curve.end.y },
  }));
}

function geometricCProbePrimitive(variant, rotation, strokeWeight) {
  return {
    type: "bezierStroke",
    variant,
    anchorX: 0,
    anchorY: 0,
    strokeWeight,
    rotation,
    curves: geometricCCurveData(),
    reflectAxisY: variant === "top" ? GEO_C_REFLECT_Y : null,
  };
}

function geometricCVerticalSpread(
  distance = state.geoCDistance,
  overlap = state.geoCOverlap,
) {
  return distance - overlap;
}

function geometricCOutlineCorner(primitive, corner) {
  const bounds = strokePathOutlineBounds(primitive, SHAPE_STROKE_PX * 2);
  if (corner === "topLeft") return { x: bounds.minX, y: bounds.minY };
  if (corner === "bottomLeft") return { x: bounds.minX, y: bounds.maxY };
  if (corner === "topRight") return { x: bounds.maxX, y: bounds.minY };
  return { x: bounds.maxX, y: bounds.maxY };
}

function geometricCCornerOffset(variant, corner, rotation, strokeWeight) {
  return geometricCOutlineCorner(
    geometricCProbePrimitive(variant, rotation, strokeWeight),
    corner,
  );
}

function geometricBezierBaselineAnchors(strokeWeight, topRotationDeg, botRotationDeg) {
  const topRotation = topRotationDeg * (Math.PI / 180);
  const botRotation = botRotationDeg * (Math.PI / 180);
  const botTopLeft = geometricCCornerOffset("bottom", "topLeft", botRotation, strokeWeight);
  const topBottomLeft = geometricCCornerOffset("top", "bottomLeft", topRotation, strokeWeight);
  const botAnchorX = GEO_C_ANCHOR_X + GEO_C_BASE_BOT_X;
  const botAnchorY = GEO_C_ANCHOR_Y;
  const jointX = botAnchorX + botTopLeft.x;
  const jointY = botAnchorY + botTopLeft.y;
  return {
    topAnchorX: jointX - topBottomLeft.x,
    topAnchorY: jointY - topBottomLeft.y,
    botAnchorX,
    botAnchorY,
    jointX,
    jointY,
  };
}

function geometricBezierAnchorsFromParams(
  strokeWeight,
  topRotationDeg,
  botRotationDeg,
  distance,
  overlap,
) {
  const base = geometricBezierBaselineAnchors(strokeWeight, topRotationDeg, botRotationDeg);
  const spread = distance - overlap;
  return {
    topAnchorX: base.topAnchorX,
    topAnchorY: base.topAnchorY - spread / 2,
    botAnchorX: base.botAnchorX,
    botAnchorY: base.botAnchorY + spread / 2,
    jointX: base.jointX,
    jointY: base.jointY + spread / 2,
  };
}

function geometricCAnchorsFromParams() {
  return geometricBezierAnchorsFromParams(
    state.geoCStrokeWeight,
    state.geoCTopRotation,
    state.geoCBotRotation,
    state.geoCDistance,
    state.geoCOverlap,
  );
}

function geometricSAnchorsFromParams() {
  return geometricBezierAnchorsFromParams(
    state.geoSStrokeWeight,
    state.geoSTopRotation,
    state.geoSBotRotation,
    state.geoSDistance,
    state.geoSOverlap,
  );
}

function geometricCJointPoint() {
  const top = (canvasPath.geometric || []).find((item) => item.variant === "top");
  const bottom = (canvasPath.geometric || []).find((item) => item.variant === "bottom");
  if (!top || !bottom) return geometricCAnchorsFromParams();
  const topCorner = geometricCOutlineCorner(top, "bottomLeft");
  const botCorner = geometricCOutlineCorner(bottom, "topLeft");
  return {
    jointX: (topCorner.x + botCorner.x) / 2,
    jointY: (topCorner.y + botCorner.y) / 2,
    topCorner,
    botCorner,
  };
}

function generateGeometricC() {
  const strokeWeight = state.geoCStrokeWeight;
  const topRotation = state.geoCTopRotation * (Math.PI / 180);
  const botRotation = state.geoCBotRotation * (Math.PI / 180);
  const curves = geometricCCurveData();
  const { topAnchorX, topAnchorY, botAnchorX, botAnchorY } = geometricCAnchorsFromParams();
  const primitives = [
    {
      type: "bezierStroke",
      variant: "top",
      anchorX: topAnchorX,
      anchorY: topAnchorY,
      strokeWeight,
      rotation: topRotation,
      curves,
      reflectAxisY: GEO_C_REFLECT_Y,
    },
    {
      type: "bezierStroke",
      variant: "bottom",
      anchorX: botAnchorX,
      anchorY: botAnchorY,
      strokeWeight,
      rotation: botRotation,
      curves,
      reflectAxisY: null,
    },
  ];
  return {
    kind: "geometric",
    primitives,
    anchors: [],
    segments: [],
    bbox: geometricPrimitiveBounds(primitives, SHAPE_STROKE_PX),
    preserveAspect: true,
    closed: true,
    hideHandles: true,
  };
}

function generateGeometricS() {
  const strokeWeight = state.geoSStrokeWeight;
  const topRotation = state.geoSTopRotation * (Math.PI / 180);
  const botRotation = state.geoSBotRotation * (Math.PI / 180);
  const groupRot = (GEO_S_GROUP_ROT_DEG * Math.PI) / 180;
  const curves = geometricCCurveData();
  const bottomCurves = geometricCCurveData(true);
  const { topAnchorX, topAnchorY, botAnchorX, botAnchorY } = geometricSAnchorsFromParams();
  const pieces = [
    {
      variant: "top",
      anchorX: topAnchorX,
      anchorY: topAnchorY,
      rotation: topRotation,
      curves,
      reflectAxisY: GEO_C_REFLECT_Y,
    },
    {
      variant: "bottom",
      anchorX: botAnchorX,
      anchorY: botAnchorY,
      rotation: botRotation,
      curves: bottomCurves,
      reflectAxisY: null,
    },
  ];
  const primitives = pieces.map((piece) => {
    const anchor = rotateAboutPoint(
      GEO_S_CENTER_X,
      GEO_S_CENTER_Y,
      piece.anchorX,
      piece.anchorY,
      groupRot,
    );
    return {
      type: "bezierStroke",
      variant: piece.variant,
      anchorX: anchor.x,
      anchorY: anchor.y,
      strokeWeight,
      rotation: piece.rotation + groupRot,
      curves: piece.curves,
      reflectAxisY: piece.reflectAxisY,
    };
  });
  return {
    kind: "geometric",
    primitives,
    anchors: [],
    segments: [],
    bbox: geometricPrimitiveBounds(primitives, SHAPE_STROKE_PX),
    preserveAspect: true,
    closed: true,
    hideHandles: true,
  };
}

function generateGeometricV() {
  const anchorY = GEO_V_H;
  const gap = clamp(state.geoVLegGap, GEO_V_LEG_GAP[0], GEO_V_LEG_GAP[1]);
  const leftAnchorX = GEO_V_CENTER_X - gap / 2;
  const rightAnchorX = GEO_V_CENTER_X + gap / 2;
  const leftW = clamp(state.geoVLeftW, GEO_V_LEG_W[0], GEO_V_LEG_W[1]);
  const rightW = clamp(state.geoVRightW, GEO_V_LEG_W[0], GEO_V_LEG_W[1]);
  const leftAspect = clamp(state.geoVLegAspect1, GEO_V_LEG_ASPECT[0], GEO_V_LEG_ASPECT[1]);
  const rightAspect = clamp(state.geoVLegAspect2, GEO_V_LEG_ASPECT[0], GEO_V_LEG_ASPECT[1]);
  const leftH = leftW * leftAspect;
  const rightH = rightW * rightAspect;
  const leftAngle = clamp(state.geoVLegRotation1, GEO_V_LEFT_ANGLE[0], GEO_V_LEFT_ANGLE[1]) * (Math.PI / 180);
  const rightAngle = clamp(state.geoVLegRotation2, GEO_V_RIGHT_ANGLE[0], GEO_V_RIGHT_ANGLE[1]) * (Math.PI / 180);
  const leftAnchorY = geoVLegAnchorY(anchorY, "left");
  const rightAnchorY = geoVLegAnchorY(anchorY, "right");
  const primitives = [
    {
      type: "rotatedRect",
      anchorX: leftAnchorX,
      anchorY: leftAnchorY,
      w: leftW,
      h: leftH,
      rotation: leftAngle,
      corner: "bottom-right",
    },
    {
      type: "rotatedRect",
      anchorX: rightAnchorX,
      anchorY: rightAnchorY,
      w: rightW,
      h: rightH,
      rotation: rightAngle,
      corner: "bottom-left",
    },
  ];
  return {
    kind: "geometric",
    primitives,
    anchors: [],
    segments: [],
    bbox: geometricPrimitiveBounds(primitives, GEO_V_H * 0.04),
    preserveAspect: true,
    closed: true,
    hideHandles: true,
  };
}

function rotatedRectLocalCorners(w, h, corner) {
  if (corner === "bottom-right") {
    return [
      { x: -w, y: -h },
      { x: 0, y: -h },
      { x: 0, y: 0 },
      { x: -w, y: 0 },
    ];
  }
  return [
    { x: 0, y: -h },
    { x: w, y: -h },
    { x: w, y: 0 },
    { x: 0, y: 0 },
  ];
}

function rotatedRectCorners(primitive) {
  const { anchorX, anchorY, w, h, rotation, corner } = primitive;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return rotatedRectLocalCorners(w, h, corner).map((point) => ({
    x: anchorX + point.x * cos - point.y * sin,
    y: anchorY + point.x * sin + point.y * cos,
  }));
}

function geometricPrimitiveBounds(primitives, pad = 0) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  (primitives || []).forEach((primitive) => {
    const corners = primitive.type === "rotatedRect"
      ? rotatedRectCorners(primitive)
      : isThickStrokePrimitive(primitive)
        ? (() => {
          const bounds = strokePathOutlineBounds(primitive, SHAPE_STROKE_PX * 2);
          return [
            { x: bounds.minX, y: bounds.minY },
            { x: bounds.maxX, y: bounds.minY },
            { x: bounds.maxX, y: bounds.maxY },
            { x: bounds.minX, y: bounds.maxY },
          ];
        })()
        : primitive.type === "rect"
          ? [
            { x: primitive.x, y: primitive.y },
            { x: primitive.x + primitive.w, y: primitive.y },
            { x: primitive.x + primitive.w, y: primitive.y + primitive.h },
            { x: primitive.x, y: primitive.y + primitive.h },
          ]
          : [];
    corners.forEach((point) => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });
  return {
    minX: minX - pad,
    minY: minY - pad,
    maxX: maxX + pad,
    maxY: maxY + pad,
  };
}

function offsetCanvasGeometric(primitives, dx, dy) {
  if (!dx && !dy) return primitives;
  return primitives.map((primitive) => {
    if (primitive.type === "bezierStroke" || primitive.type === "lStroke" || primitive.type === "rotatedRect") {
      return { ...primitive, anchorX: primitive.anchorX + dx, anchorY: primitive.anchorY + dy };
    }
    if (primitive.type === "rect") {
      return { ...primitive, x: primitive.x + dx, y: primitive.y + dy };
    }
    if (primitive.type === "semicircle") {
      return { ...primitive, cx: primitive.cx + dx, cy: primitive.cy + dy };
    }
    return primitive;
  });
}

function geometricOffsetCanvasDelta(mapPoint, offsetX, offsetY) {
  if (!offsetX && !offsetY) return { dx: 0, dy: 0 };
  const base = mapPoint(0, 0);
  const shifted = mapPoint(offsetX, offsetY);
  return { dx: shifted.x - base.x, dy: shifted.y - base.y };
}

function geometricPieceOffsets(variant) {
  if (state.template === "sweep") {
    if (variant === "top") return { x: state.geoSTopOffsetX, y: state.geoSTopOffsetY };
    return { x: state.geoSBotOffsetX, y: state.geoSBotOffsetY };
  }
  if (variant === "top") return { x: state.geoCTopOffsetX, y: state.geoCTopOffsetY };
  return { x: state.geoCBotOffsetX, y: state.geoCBotOffsetY };
}

function setGeometricPieceOffsets(variant, offsetX, offsetY) {
  if (state.template === "sweep") {
    if (variant === "top") {
      state.geoSTopOffsetX = offsetX;
      state.geoSTopOffsetY = offsetY;
    } else {
      state.geoSBotOffsetX = offsetX;
      state.geoSBotOffsetY = offsetY;
    }
    return;
  }
  if (variant === "top") {
    state.geoCTopOffsetX = offsetX;
    state.geoCTopOffsetY = offsetY;
  } else {
    state.geoCBotOffsetX = offsetX;
    state.geoCBotOffsetY = offsetY;
  }
}

function geometricBezierDistanceState() {
  if (state.template === "sweep") {
    return { distance: state.geoSDistance, overlap: state.geoSOverlap };
  }
  return { distance: state.geoCDistance, overlap: state.geoCOverlap };
}

function geometricBezierRotationState(variant) {
  if (state.template === "sweep") {
    return variant === "top" ? state.geoSTopRotation : state.geoSBotRotation;
  }
  return variant === "top" ? state.geoCTopRotation : state.geoCBotRotation;
}

function setGeometricBezierRotation(variant, deg) {
  if (state.template === "sweep") {
    if (variant === "top") state.geoSTopRotation = deg;
    else state.geoSBotRotation = deg;
    refreshGeometricSPath();
    return;
  }
  if (variant === "top") state.geoCTopRotation = deg;
  else state.geoCBotRotation = deg;
  refreshGeometricCPath();
}

function refreshActiveGeometricBezierPath() {
  if (state.template === "sweep") refreshGeometricSPath();
  else refreshGeometricCPath();
}

function mapPrimitive(primitive, mapPoint) {
  if (primitive.type === "rect") {
    const a = mapPoint(primitive.x, primitive.y);
    const b = mapPoint(primitive.x + primitive.w, primitive.y + primitive.h);
    return {
      type: "rect",
      x: a.x,
      y: a.y,
      w: b.x - a.x,
      h: b.y - a.y,
    };
  }
  if (primitive.type === "semicircle") {
    const center = mapPoint(primitive.cx, primitive.cy);
    const edge = mapPoint(primitive.cx + primitive.r, primitive.cy);
    return {
      type: "semicircle",
      cx: center.x,
      cy: center.y,
      r: Math.hypot(edge.x - center.x, edge.y - center.y),
      rotation: primitive.rotation,
    };
  }
  if (primitive.type === "rotatedRect") {
    const anchor = mapPoint(primitive.anchorX, primitive.anchorY);
    const widthEdge = mapPoint(primitive.anchorX + primitive.w, primitive.anchorY);
    const heightEdge = mapPoint(primitive.anchorX, primitive.anchorY - primitive.h);
    return {
      type: "rotatedRect",
      anchorX: anchor.x,
      anchorY: anchor.y,
      w: Math.hypot(widthEdge.x - anchor.x, widthEdge.y - anchor.y),
      h: Math.hypot(heightEdge.x - anchor.x, heightEdge.y - anchor.y),
      rotation: primitive.rotation,
      corner: primitive.corner,
    };
  }
  if (primitive.type === "lStroke") {
    const anchor = mapPoint(primitive.anchorX, primitive.anchorY);
    const verticalSign = primitive.variant === "top" ? 1 : -1;
    const horizontalSign = primitive.flipX ? -1 : primitive.variant === "top" ? -1 : 1;
    const verticalEnd = mapPoint(
      primitive.anchorX,
      primitive.anchorY + verticalSign * primitive.legVertical,
    );
    const cornerEnd = mapPoint(
      primitive.anchorX + horizontalSign * primitive.legHorizontal,
      primitive.anchorY + verticalSign * primitive.legVertical,
    );
    const strokeEdge = mapPoint(primitive.anchorX + primitive.strokeWeight, primitive.anchorY);
    return {
      type: "lStroke",
      variant: primitive.variant,
      flipX: Boolean(primitive.flipX),
      anchorX: anchor.x,
      anchorY: anchor.y,
      legVertical: Math.hypot(verticalEnd.x - anchor.x, verticalEnd.y - anchor.y),
      legHorizontal: Math.hypot(cornerEnd.x - verticalEnd.x, cornerEnd.y - verticalEnd.y),
      strokeWeight: Math.hypot(strokeEdge.x - anchor.x, strokeEdge.y - anchor.y),
      rotation: primitive.rotation,
    };
  }
  if (primitive.type === "bezierStroke") {
    const anchor = mapPoint(primitive.anchorX, primitive.anchorY);
    const mapLocal = (point) => {
      const mapped = mapPoint(primitive.anchorX + point.x, primitive.anchorY + point.y);
      return { x: mapped.x - anchor.x, y: mapped.y - anchor.y };
    };
    const mapLocalY = (y) => {
      const mapped = mapPoint(primitive.anchorX, primitive.anchorY + y);
      return mapped.y - anchor.y;
    };
    const strokeEdge = mapPoint(primitive.anchorX + primitive.strokeWeight, primitive.anchorY);
    return {
      type: "bezierStroke",
      variant: primitive.variant,
      anchorX: anchor.x,
      anchorY: anchor.y,
      strokeWeight: Math.hypot(strokeEdge.x - anchor.x, strokeEdge.y - anchor.y),
      rotation: primitive.rotation,
      curves: primitive.curves.map((curve) => ({
        cp1: mapLocal(curve.cp1),
        cp2: mapLocal(curve.cp2),
        end: mapLocal(curve.end),
      })),
      reflectAxisY: primitive.reflectAxisY == null ? null : mapLocalY(primitive.reflectAxisY),
    };
  }
  return primitive;
}

function primitivePath(primitive) {
  const path = new Path2D();
  if (primitive.type === "rect") {
    path.rect(primitive.x, primitive.y, primitive.w, primitive.h);
    return path;
  }
  if (primitive.type === "rotatedRect") {
    const corners = rotatedRectCorners(primitive);
    path.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      path.lineTo(corners[i].x, corners[i].y);
    }
    path.closePath();
    return path;
  }
  if (isThickStrokePrimitive(primitive)) {
    return lStrokeFillPath(primitive);
  }
  if (primitive.type === "semicircle") {
    const a0 = -Math.PI / 2 + primitive.rotation;
    const a1 = Math.PI / 2 + primitive.rotation;
    path.moveTo(
      primitive.cx + primitive.r * Math.cos(a0),
      primitive.cy + primitive.r * Math.sin(a0)
    );
    path.arc(primitive.cx, primitive.cy, primitive.r, a0, a1, false);
    path.closePath();
  }
  return path;
}

function geometricUnionPath(primitives) {
  const path = new Path2D();
  (primitives || []).forEach((item) => path.addPath(primitivePath(item)));
  return path;
}

function sampleGeometricPoints(primitives) {
  const points = [];
  (primitives || []).forEach((item) => {
    if (item.type === "rect") {
      points.push({ x: item.x, y: item.y });
      points.push({ x: item.x + item.w, y: item.y });
      points.push({ x: item.x + item.w, y: item.y + item.h });
      points.push({ x: item.x, y: item.y + item.h });
      return;
    }
    if (item.type === "rotatedRect") {
      rotatedRectCorners(item).forEach((corner) => points.push(corner));
      return;
    }
    if (isThickStrokePrimitive(item)) {
      points.push(...strokePathWorldPoints(item));
      return;
    }
    if (item.type === "semicircle") {
      for (let i = 0; i <= 24; i++) {
        const angle = -Math.PI / 2 + item.rotation + (i / 24) * Math.PI;
        points.push({
          x: item.cx + item.r * Math.cos(angle),
          y: item.cy + item.r * Math.sin(angle),
        });
      }
    }
  });
  return points;
}

function drawGeometricLStrokeOutline() {
  const primitives = canvasPath.geometric || [];
  if (!primitives.length) return;
  const ctx = drawingContext;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fill(lStrokeUnionPath(primitives, SHAPE_STROKE_PX * 2));
  ctx.restore();
}

function geometricPieceFillPath(item) {
  return usingGeometricLStroke() ? lStrokeFillPath(item) : primitivePath(item);
}

function fillGeometricPiece(ctx, item, index, total) {
  const fillPath = geometricPieceFillPath(item);
  const useRadial = state.fillMode === "split" && total > 1 && index === 1;

  ctx.save();
  if (useRadial) {
    const points = sampleGeometricPoints([item]);
    ctx.clip(fillPath);
    ctx.fillStyle = createRadialGradientForPoints(ctx, points, gradientPad());
    ctx.fillRect(0, 0, width, height);
  } else {
    const t = total === 1 ? 0 : index / (total - 1);
    const c = colorAt(t);
    ctx.fillStyle = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    ctx.fill(fillPath);
  }
  ctx.restore();
}

function drawGeometricLetter() {
  const primitives = canvasPath.geometric || [];
  if (!primitives.length) return;
  const ctx = drawingContext;

  if (usingGeometricLStroke()) {
    drawGeometricLStrokeOutline();
    primitives.forEach((item, index) => {
      fillGeometricPiece(ctx, item, index, primitives.length);
    });
    return;
  }

  const shape = geometricUnionPath(primitives);

  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = SHAPE_STROKE_PX * 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.fill(shape);
  ctx.stroke(shape);
  ctx.restore();

  primitives.forEach((item, index) => {
    fillGeometricPiece(ctx, item, index, primitives.length);
  });
}

function jitterGeneratedPath(path) {
  const source = path.anchors;
  if (!source || !source.length) return;
  const sourceCopy = source.map((point) => ({ id: point.id, x: point.x, y: point.y }));
  const range = state.jitterRadius * averageSegmentLength(sourceCopy, path.closed);
  path.sourceAnchors = sourceCopy;
  path.jitterRange = range;
  if (range <= 0) return;
  const jittered = jitterAnchors(sourceCopy, range);
  path.anchors = jittered;
  path.segments =
    path.resmooth === "sweep"
      ? sweepHermite(jittered, path.sweepStyle)
      : path.resmooth
        ? smoothCubicsThrough(jittered, path.closed)
        : path.polyline
          ? lineCubics(jittered)
          : jitterBezierSegments(path.segments, sourceCopy, jittered);
}

function uniqueAnchors(anchors) {
  const seen = new Set();
  return anchors.filter((point, index) => {
    const key = point.id || `i${index}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mapOriginPoints(template, mapPoint) {
  const sources = uniqueAnchors(template.sourceAnchors || []);
  const moved = uniqueAnchors(template.anchors || []);
  const range = template.jitterRange || 0;
  if (!sources.length || !range) return [];
  return sources.map((point, index) => {
    const origin = mapPoint(point.x, point.y);
    const offsetX = mapPoint(point.x + range, point.y);
    const offsetY = mapPoint(point.x, point.y + range);
    const jittered = moved[index] ? mapPoint(moved[index].x, moved[index].y) : origin;
    const rx = Math.abs(offsetX.x - origin.x);
    const ry = Math.abs(offsetY.y - origin.y);
    return {
      x: origin.x,
      y: origin.y,
      movedX: jittered.x,
      movedY: jittered.y,
      r: Math.min(rx, ry),
    };
  });
}

function jitterBezierSegments(segments, sourceAnchors, jitteredAnchors) {
  const deltas = jitteredAnchors.map((point, index) => ({
    x: point.x - sourceAnchors[index].x,
    y: point.y - sourceAnchors[index].y,
  }));
  return segments.map((seg, index) => {
    const d0 = deltas[index];
    const d3 = deltas[(index + 1) % deltas.length];
    return [
      seg[0] + d0.x,
      seg[1] + d0.y,
      seg[2] + d0.x,
      seg[3] + d0.y,
      seg[4] + d3.x,
      seg[5] + d3.y,
      seg[6] + d3.x,
      seg[7] + d3.y,
    ];
  });
}

function randRange(min, max) {
  return min + Math.random() * (max - min);
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

const SWEEP_BUILTIN_GOOD = {
  template: "sweep",
  anchors: [
    { x: 1, y: 0.18947368421052632 },
    { x: 0.5687703960289718, y: 0.1410887053546569 },
    { x: 0.46623363829891334, y: 0.4138810013393322 },
    { x: 0.4749738995464686, y: 0.8290546558345891 },
    { x: 0, y: 0.7578947368421053 },
  ],
  handles: [
    {
      out: { length: 0.2586044798689889, angle: -2.319344819177852, chordRatio: 0.5959513317251024 },
      in: { length: 0.06446696914702367, angle: -0.7282554478964366, chordRatio: 0.14856345928312342 },
    },
    {
      out: { length: 0.10255685366425242, angle: 2.413337205693354, chordRatio: 0.3519132353268393 },
      in: { length: 0.09789148362381284, angle: -2.0193445517629023, chordRatio: 0.33590450059807225 },
    },
    {
      out: { length: 0.14151643523160026, angle: 1.122248101826892, chordRatio: 0.34078531919203486 },
      in: { length: 0.14143791049080132, angle: -1.1281738143255016, chordRatio: 0.3405962239903797 },
    },
    {
      out: { length: 0.06518871530169862, angle: 2.0134188392642947, chordRatio: 0.13573210048890086 },
      in: { length: 0.27385937714227254, angle: 1.0844566025585258, chordRatio: 0.570213852598107 },
    },
  ],
};

const SWEEP_CIRCLES_BUILTIN_GOOD = {
  template: "sweep",
  labeledAt: "2026-09-11T05:05:53.846Z",
  anchors: [
    { x: 1, y: 0.1362126245847176 },
    { x: 0.44711538461538464, y: 0.15946843853820597 },
    { x: 0.4951923076923077, y: 0.4418604651162791 },
    { x: 0.5769230769230769, y: 0.8471760797342193 },
    { x: 0, y: 0.7308970099667774 },
  ],
  handles: [
    {
      out: { length: 0.17544553289672835, angle: -2.2526889414352906, chordRatio: 0.31704722544194835 },
      in: { length: 0.17269340442267425, angle: -0.9685906012363, chordRatio: 0.3120738603049047 },
    },
    {
      out: { length: 0.16125746200260757, angle: 2.1730020523534948, chordRatio: 0.5629410726136934 },
      in: { length: 0.1259167198870833, angle: -2.096019218824707, chordRatio: 0.4395684545257599 },
    },
    {
      out: { length: 0.10785262128614417, angle: 1.0455734347650814, chordRatio: 0.26084505273765374 },
      in: { length: 0.15659997658469846, angle: -1.0555532700683017, chordRatio: 0.3787421081085842 },
    },
    {
      out: { length: 0.08781237943884324, angle: 2.0860393835214905, chordRatio: 0.14920769319261953 },
      in: { length: 0.2891427837977899, angle: 1.1963011201492242, chordRatio: 0.4913012043342585 },
    },
  ],
};

function sweepLabeledSeeds() {
  const stored = (PATH_LABELS.good || []).filter((entry) => entry.template === "sweep" && entry.anchors?.length >= 5);
  return stored.length ? stored : [SWEEP_BUILTIN_GOOD, SWEEP_CIRCLES_BUILTIN_GOOD];
}

function sweepDirFromAngle(angle) {
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

function sweepEndTangentFromInHandle(inAngle) {
  return sweepDirFromAngle(inAngle + Math.PI);
}

function sweepStyleFromLabeledSeed(seed) {
  const handles = seed.handles;
  if (handles && handles.length >= 4) {
    const last = handles[handles.length - 1];
    return {
      roundness: randRange(0.48, 0.54),
      t0: sweepDirFromAngle(handles[0].out.angle),
      t1: { x: randRange(0.42, 0.62), y: 1 },
      t2: sweepEndTangentFromInHandle(last.in.angle),
      startTension: clamp(handles[0].out.chordRatio * 0.88, 0.42, 0.64),
      endTension: clamp(last.in.chordRatio * 0.88, 0.4, 0.66),
    };
  }
  return {
    roundness: randRange(0.48, 0.54),
    t0: sweepDirFromAngle(randRange(-2.7, -1.9)),
    t1: { x: randRange(0.42, 0.62), y: 1 },
    t2: sweepDirFromAngle(randRange(-2.2, -1.4)),
    startTension: randRange(0.48, 0.6),
    endTension: randRange(0.5, 0.62),
  };
}

function mutateSweepAnchors(anchors, amount) {
  return anchors.map((point, index) => {
    let x = point.x + randRange(-amount, amount);
    let y = point.y + randRange(-amount, amount);
    if (index === 0) {
      x = clamp(x, 0.86, 1);
      y = clamp(y, 0.12, 0.28);
    } else if (index === anchors.length - 1) {
      x = clamp(x, 0, 0.14);
      y = clamp(y, 0.66, 0.88);
    } else {
      x = clamp(x, 0.1, 0.9);
      y = clamp(y, 0.1, 0.9);
    }
    return { x, y };
  });
}

function generateSweepPathFromSeed(seed) {
  const sourceAnchors = seed.anchors.map((point) => ({ x: point.x, y: point.y }));
  const anchors = mutateSweepAnchors(sourceAnchors, randRange(0.02, 0.055));
  const style = sweepStyleFromLabeledSeed(seed);
  const segments = sweepHermite(anchors, style);
  return {
    anchors,
    segments,
    bbox: boundsOfPath(anchors, segments),
    preserveAspect: true,
    closed: false,
    resmooth: "sweep",
    sweepStyle: style,
  };
}

/**
 * Smooth letter-S with the original five anchors: start, top bowl,
 * waist, bottom bowl, end. Built as two cubics, then each is split
 * so the curve stays G1 while debug shows five points.
 *
 * Spine sits left / center / right so the bowls are unequal; terminals
 * can hook up the way the labeled goods do, instead of always landing
 * flat on a centered column.
 */
function generateClassicSweepPath() {
  const column = pick(["left", "center", "center", "right"]);
  const spineX =
    column === "left"
      ? randRange(0.28, 0.38)
      : column === "right"
        ? randRange(0.62, 0.74)
        : randRange(0.42, 0.56);
  const hookStart = Math.random() < (column === "right" ? 0.22 : 0.62);
  const hookEnd = Math.random() < (column === "left" ? 0.22 : 0.48);
  const aspect = randRange(0.4, 0.52);
  const slant = randRange(-0.16, -0.03);
  const fromDeg = (deg) => {
    const angle = (deg * Math.PI) / 180;
    return { x: Math.cos(angle), y: Math.sin(angle) };
  };
  const style = {
    roundness: randRange(0.46, 0.56),
    t0: hookStart ? fromDeg(randRange(-155, -108)) : fromDeg(randRange(168, 178)),
    t1: { x: randRange(0.4, 0.65), y: 1 },
    t2: hookEnd ? fromDeg(randRange(-125, -88)) : fromDeg(randRange(-178, -158)),
    startTension: hookStart ? randRange(0.5, 0.6) : randRange(0.38, 0.5),
    endTension: hookEnd ? randRange(0.52, 0.66) : randRange(0.36, 0.5),
  };

  const startY = hookStart ? randRange(0.12, 0.22) : randRange(0.04, 0.12);
  const endY = hookEnd ? randRange(0.8, 0.88) : randRange(0.9, 0.96);
  const place = (x, y) => ({
    x: x * aspect + (0.5 - y) * slant * aspect,
    y,
  });
  const coarse = [
    place(randRange(0.96, 1), startY),
    place(spineX + randRange(-0.02, 0.02), randRange(0.46, 0.54)),
    place(randRange(0, 0.04), endY),
  ];
  const halves = sweepHermite(coarse, style).flatMap((seg) => splitCubic(seg, 0.5));
  const anchors = [
    { x: halves[0][0], y: halves[0][1] },
    { x: halves[0][6], y: halves[0][7] },
    { x: halves[1][6], y: halves[1][7] },
    { x: halves[2][6], y: halves[2][7] },
    { x: halves[3][6], y: halves[3][7] },
  ];
  return {
    anchors,
    segments: halves,
    bbox: boundsOfPath(anchors, halves),
    preserveAspect: true,
    closed: false,
    resmooth: "sweep",
    sweepStyle: style,
  };
}

function generateSweepPath() {
  if (Math.random() < 0.5) {
    return generateClassicSweepPath();
  }
  return generateSweepPathFromSeed(pick(sweepLabeledSeeds()));
}

function splitCubic(seg, t = 0.5) {
  const p0 = { x: seg[0], y: seg[1] };
  const c1 = { x: seg[2], y: seg[3] };
  const c2 = { x: seg[4], y: seg[5] };
  const p3 = { x: seg[6], y: seg[7] };
  const lerp = (a, b) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });
  const p01 = lerp(p0, c1);
  const p12 = lerp(c1, c2);
  const p23 = lerp(c2, p3);
  const p012 = lerp(p01, p12);
  const p123 = lerp(p12, p23);
  const mid = lerp(p012, p123);
  return [
    [p0.x, p0.y, p01.x, p01.y, p012.x, p012.y, mid.x, mid.y],
    [mid.x, mid.y, p123.x, p123.y, p23.x, p23.y, p3.x, p3.y],
  ];
}

function sweepHermite(anchors, style) {
  const n = anchors.length;
  const { roundness, t0, t1, t2 } = style;
  const waist = Math.floor((n - 1) / 2);
  const midTension = n <= 3 ? roundness : 1 / 3;
  const startTension = style.startTension ?? midTension;
  const endTension = style.endTension ?? midTension;
  const dirAt = (index) => {
    if (index === 0) return t0;
    if (index === n - 1) return t2;
    if (index === waist) return t1;
    const prev = anchors[index - 1];
    const next = anchors[index + 1];
    return { x: next.x - prev.x, y: next.y - prev.y };
  };
  const tensionAt = (index) => {
    if (index === 0) return startTension;
    if (index === n - 1) return endTension;
    return midTension;
  };
  const segments = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = anchors[i];
    const p3 = anchors[i + 1];
    const chord = Math.hypot(p3.x - p0.x, p3.y - p0.y);
    const c1 = offsetAlong(p0, dirAt(i), chord * tensionAt(i));
    const c2 = offsetAlong(p3, { x: -dirAt(i + 1).x, y: -dirAt(i + 1).y }, chord * tensionAt(i + 1));
    segments.push([p0.x, p0.y, c1.x, c1.y, c2.x, c2.y, p3.x, p3.y]);
  }
  return segments;
}

function rotateVec(vec, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: vec.x * c - vec.y * s, y: vec.x * s + vec.y * c };
}

const VEE_MAX_ATTEMPTS = 40;
const VEE_MAX_LEG_RATIO = 1.38;
const VEE_MAX_TOP_DY = 0.38;
const VEE_MAX_INTERIOR = (68 * Math.PI) / 180;
const VEE_MAX_CHORD_RATIO = 0.48;
const VEE_MIN_APEX_TURN = Math.PI / 2;
const VEE_HANDLE_BOX_PAD = 0.05;
const VEE_FOLD_BULGE = 0.18;

/**
 * Canonical three-point V. Half the time the legs stay straight;
 * half the time they get concave/convex handlebars. Point wander
 * comes from the jitter-radius slider around these originals.
 * Rejects lopsided, shallow, or over-bowed results and tries again.
 */
function generateAcceptedVeePath() {
  let path;
  for (let i = 0; i < VEE_MAX_ATTEMPTS; i++) {
    path = generateVeePath();
    jitterGeneratedPath(path);
    if (veePathAcceptable(path)) return path;
  }
  return path;
}

function generateVeePath() {
  const anchors = [
    { x: 1.00024, y: 1.00021 },
    { x: 31.9068, y: 60.9699 },
    { x: 73.3112, y: 11.6222 },
  ];
  const curved = Math.random() < 0.5;
  return {
    anchors,
    segments: curved ? veeCubics(anchors) : lineCubics(anchors),
    bbox: { minX: 1.00024, minY: 1.00021, maxX: 73.3112, maxY: 60.9699 },
    preserveAspect: true,
    closed: false,
    fitScale: 0.78,
    polyline: !curved,
    hideHandles: !curved,
  };
}

function veePathAcceptable(path) {
  const [left, apex, right] = path.anchors || [];
  if (!left || !apex || !right) return true;
  const legL = Math.hypot(apex.x - left.x, apex.y - left.y) || 1e-6;
  const legR = Math.hypot(right.x - apex.x, right.y - apex.y) || 1e-6;
  if (Math.max(legL, legR) / Math.min(legL, legR) > VEE_MAX_LEG_RATIO) return false;
  const height = Math.max(left.y, apex.y, right.y) - Math.min(left.y, apex.y, right.y) || 1;
  if (Math.abs(left.y - right.y) / height > VEE_MAX_TOP_DY) return false;
  if (angleAtPoint(left, apex, right) > VEE_MAX_INTERIOR) return false;
  const segs = path.segments || [];
  if (segs.length < 2) return true;
  if (veeHandlesEscapeAnchorBox(path.anchors, segs)) return false;
  if (veeApexTurn(segs, apex) < VEE_MIN_APEX_TURN) return false;
  if (segs.some(veeHandleTooLong)) return false;
  const folded = segs.reduce((n, seg) => n + veeCubicReversalCount(seg), 0) >= 2;
  const bulky = segs.some((seg) => veeAbsBulge(seg) > VEE_FOLD_BULGE);
  if (folded && bulky) return false;
  return true;
}

function angleAtPoint(a, b, c) {
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v2x = c.x - b.x;
  const v2y = c.y - b.y;
  const n1 = Math.hypot(v1x, v1y) || 1;
  const n2 = Math.hypot(v2x, v2y) || 1;
  return Math.acos(clamp((v1x * v2x + v1y * v2y) / (n1 * n2), -1, 1));
}

function veeHandleTooLong(seg) {
  const chord = Math.hypot(seg[6] - seg[0], seg[7] - seg[1]) || 1;
  const outLen = Math.hypot(seg[2] - seg[0], seg[3] - seg[1]);
  const inLen = Math.hypot(seg[4] - seg[6], seg[5] - seg[7]);
  return outLen / chord > VEE_MAX_CHORD_RATIO || inLen / chord > VEE_MAX_CHORD_RATIO;
}

function veeApexTurn(segs, apex) {
  const arrx = apex.x - segs[0][4];
  const arry = apex.y - segs[0][5];
  const depx = segs[1][2] - apex.x;
  const depy = segs[1][3] - apex.y;
  const n1 = Math.hypot(arrx, arry) || 1;
  const n2 = Math.hypot(depx, depy) || 1;
  return Math.acos(clamp((arrx * depx + arry * depy) / (n1 * n2), -1, 1));
}

function veeHandlesEscapeAnchorBox(anchors, segs) {
  const [left, apex, right] = anchors;
  const topY = Math.min(left.y, right.y);
  const height = Math.max(left.y, apex.y, right.y) - Math.min(left.y, apex.y, right.y) || 1;
  const pad = height * VEE_HANDLE_BOX_PAD;
  return segs.some((seg) => {
    for (let i = 2; i <= 4; i += 2) {
      const y = seg[i + 1];
      if (y > apex.y + pad || y < topY - pad) return true;
    }
    return false;
  });
}

function veeAbsBulge(seg) {
  const dx = seg[6] - seg[0];
  const dy = seg[7] - seg[1];
  const mag2 = dx * dx + dy * dy || 1;
  const b1 = Math.abs(dx * (seg[3] - seg[1]) - dy * (seg[2] - seg[0])) / mag2;
  const b2 = Math.abs(dx * (seg[5] - seg[1]) - dy * (seg[4] - seg[0])) / mag2;
  return Math.max(b1, b2);
}

function veeCubicReversalCount(seg) {
  let prevX = seg[0];
  let prevDir = 0;
  let reversals = 0;
  for (let i = 1; i <= 20; i++) {
    const x = bezierPoint(seg[0], seg[2], seg[4], seg[6], i / 20);
    const delta = x - prevX;
    const dir = delta > 1e-6 ? 1 : delta < -1e-6 ? -1 : 0;
    if (dir && prevDir && dir !== prevDir) reversals += 1;
    if (dir) prevDir = dir;
    prevX = x;
  }
  return reversals;
}

function lineCubics(anchors) {
  const segments = [];
  for (let i = 0; i < anchors.length - 1; i++) {
    const p0 = anchors[i];
    const p3 = anchors[i + 1];
    const dx = p3.x - p0.x;
    const dy = p3.y - p0.y;
    segments.push([
      p0.x,
      p0.y,
      p0.x + dx / 3,
      p0.y + dy / 3,
      p0.x + (dx * 2) / 3,
      p0.y + (dy * 2) / 3,
      p3.x,
      p3.y,
    ]);
  }
  return segments;
}

function veeCubics(anchors) {
  const segments = [];
  let prevSign = 0;
  for (let i = 0; i < anchors.length - 1; i++) {
    const p0 = anchors[i];
    const p3 = anchors[i + 1];
    const dx = p3.x - p0.x;
    const dy = p3.y - p0.y;
    const mag = Math.hypot(dx, dy) || 1;
    let sign = pick([-1, 1]);
    if (prevSign && Math.random() < 0.7) sign = -prevSign;
    prevSign = sign;
    const t1 = randRange(0.22, 0.38);
    const t2 = randRange(0.22, 0.38);
    const nx = -dy / mag;
    const ny = dx / mag;
    const bulge1 = sign * randRange(0.1, 0.24) * mag;
    const bulge2 = sign * randRange(0.1, 0.24) * mag;
    const c1 = veeClampHandle(p0, dx, dy, nx, ny, t1, bulge1, mag);
    const c2 = veeClampHandle(p3, -dx, -dy, nx, ny, t2, bulge2, mag);
    segments.push([p0.x, p0.y, c1.x, c1.y, c2.x, c2.y, p3.x, p3.y]);
  }
  return segments;
}

function veeClampHandle(origin, dx, dy, nx, ny, t, bulge, mag) {
  let hx = dx * t + nx * bulge;
  let hy = dy * t + ny * bulge;
  const len = Math.hypot(hx, hy);
  const maxLen = VEE_MAX_CHORD_RATIO * mag;
  if (len > maxLen) {
    const scale = maxLen / len;
    hx *= scale;
    hy *= scale;
  }
  return { x: origin.x + hx, y: origin.y + hy };
}

/**
 * Open circular C, rebuilt from scratch each time. Always four anchors
 * like the original bezier (three cubics). Sweep stays a letter C —
 * never a short parenthesis, never a closed ring.
 */
function generateCeePath() {
  const character = pick(["bowl", "bowl", "long", "long", "hook"]);
  const sweep =
    character === "long"
      ? randRange(Math.PI * 1.28, Math.PI * 1.52)
      : character === "hook"
        ? randRange(Math.PI * 1.18, Math.PI * 1.42)
        : randRange(Math.PI * 1.15, Math.PI * 1.32);
  const r = randRange(0.42, 0.52);
  const aspect = randRange(0.94, 1.06);
  const rx = r;
  const ry = r * aspect;
  const cx = 0.5 + randRange(-0.03, 0.03);
  const cy = 0.5 + randRange(-0.03, 0.03);
  const tilt = randRange(-0.18, 0.18);
  const mid = Math.PI + randRange(-0.16, 0.16);
  const a0 = mid + sweep * randRange(0.42, 0.58);
  const a1 = a0 - sweep;
  const handleScale = randRange(0.94, 1.08);
  const { segments, anchors } = ellipticalArcCubics(cx, cy, rx, ry, a0, a1, tilt, handleScale, 3);
  if (character === "hook" && segments.length) {
    hookCeeEnds(segments);
  }
  return {
    anchors,
    segments,
    bbox: boundsOfPath(anchors, segments),
    preserveAspect: true,
    closed: false,
  };
}

function ellipticalArcCubics(cx, cy, rx, ry, a0, a1, tilt, handleScale = 1, maxSegments = Infinity) {
  const total = a1 - a0;
  const n = Math.min(maxSegments, Math.max(2, Math.ceil(Math.abs(total) / (Math.PI / 2))));
  const step = total / n;
  const segments = [];
  const anchors = [];
  const rot = (x, y) => {
    const dx = x - cx;
    const dy = y - cy;
    const c = Math.cos(tilt);
    const s = Math.sin(tilt);
    return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c };
  };
  for (let i = 0; i < n; i++) {
    const t0 = a0 + step * i;
    const t1 = a0 + step * (i + 1);
    const k = (4 / 3) * Math.tan((t1 - t0) / 4) * handleScale;
    const p0 = rot(cx + rx * Math.cos(t0), cy + ry * Math.sin(t0));
    const p3 = rot(cx + rx * Math.cos(t1), cy + ry * Math.sin(t1));
    const c1 = rot(
      cx + rx * (Math.cos(t0) - k * Math.sin(t0)),
      cy + ry * (Math.sin(t0) + k * Math.cos(t0))
    );
    const c2 = rot(
      cx + rx * (Math.cos(t1) + k * Math.sin(t1)),
      cy + ry * (Math.sin(t1) - k * Math.cos(t1))
    );
    if (i === 0) anchors.push(p0);
    anchors.push(p3);
    segments.push([p0.x, p0.y, c1.x, c1.y, c2.x, c2.y, p3.x, p3.y]);
  }
  return { segments, anchors };
}

function hookCeeEnds(segments) {
  const angle = randRange(0.18, 0.55) * pick([-1, 1]);
  const first = segments[0];
  const last = segments[segments.length - 1];
  const h0 = rotateVec({ x: first[2] - first[0], y: first[3] - first[1] }, angle);
  first[2] = first[0] + h0.x;
  first[3] = first[1] + h0.y;
  const h1 = rotateVec({ x: last[4] - last[6], y: last[5] - last[7] }, -angle);
  last[4] = last[6] + h1.x;
  last[5] = last[7] + h1.y;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function boundsOfPath(anchors, segments) {
  const points = anchors.map((point) => ({ x: point.x, y: point.y }));
  sampleBeziers(segments).forEach((point) => points.push(point));
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  points.forEach((point) => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });
  const padX = (maxX - minX) * 0.05 || 0.04;
  const padY = (maxY - minY) * 0.04 || 0.04;
  return {
    minX: minX - padX,
    minY: minY - padY,
    maxX: maxX + padX,
    maxY: maxY + padY,
  };
}

function jitterAnchors(anchors, range) {
  const deltas = new Map();
  return anchors.map((point, index) => {
    const key = point.id || `i${index}`;
    if (!deltas.has(key)) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * range;
      deltas.set(key, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
      });
    }
    const delta = deltas.get(key);
    return { id: point.id, x: point.x + delta.x, y: point.y + delta.y };
  });
}

function averageSegmentLength(anchors, closed) {
  const n = anchors.length;
  const count = closed ? n : Math.max(n - 1, 1);
  let sum = 0;
  for (let i = 0; i < count; i++) {
    const a = anchors[i];
    const b = anchors[(i + 1) % n];
    sum += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return sum / count;
}

function tangentAt(anchors, index, closed) {
  const n = anchors.length;
  let prev;
  let next;
  if (closed) {
    prev = anchors[(index - 1 + n) % n];
    next = anchors[(index + 1) % n];
  } else if (index === 0) {
    prev = anchors[0];
    next = anchors[1];
  } else if (index === n - 1) {
    prev = anchors[n - 2];
    next = anchors[n - 1];
  } else {
    prev = anchors[index - 1];
    next = anchors[index + 1];
  }
  return { x: next.x - prev.x, y: next.y - prev.y };
}

function offsetAlong(origin, tangent, length) {
  const mag = Math.hypot(tangent.x, tangent.y) || 1;
  return {
    x: origin.x + (tangent.x / mag) * length,
    y: origin.y + (tangent.y / mag) * length,
  };
}

function smoothCubicsThrough(anchors, closed, tension = 1 / 3) {
  const n = anchors.length;
  const count = closed ? n : n - 1;
  const segments = [];
  for (let i = 0; i < count; i++) {
    const p0 = anchors[i];
    const p3 = anchors[(i + 1) % n];
    const chord = Math.hypot(p3.x - p0.x, p3.y - p0.y);
    const handle = chord * tension;
    const c1 = offsetAlong(p0, tangentAt(anchors, i, closed), handle);
    const t1 = tangentAt(anchors, (i + 1) % n, closed);
    const c2 = offsetAlong(p3, { x: -t1.x, y: -t1.y }, handle);
    segments.push([p0.x, p0.y, c1.x, c1.y, c2.x, c2.y, p3.x, p3.y]);
  }
  return segments;
}

function makeMapper(bbox, ox, oy, w, h, preserveAspect) {
  const bw = bbox.maxX - bbox.minX || 1;
  const bh = bbox.maxY - bbox.minY || 1;
  if (preserveAspect) {
    const s = Math.min(w / bw, h / bh);
    const dw = bw * s;
    const dh = bh * s;
    const bx = ox + (w - dw) / 2;
    const by = oy + (h - dh) / 2;
    return (x, y) => ({
      x: bx + (x - bbox.minX) * s,
      y: by + (y - bbox.minY) * s,
    });
  }
  return (x, y) => ({
    x: ox + ((x - bbox.minX) / bw) * w,
    y: oy + ((y - bbox.minY) / bh) * h,
  });
}

function makeUnmapper(bbox, ox, oy, w, h, preserveAspect) {
  const bw = bbox.maxX - bbox.minX || 1;
  const bh = bbox.maxY - bbox.minY || 1;
  if (preserveAspect) {
    const s = Math.min(w / bw, h / bh) || 1;
    const dw = bw * s;
    const dh = bh * s;
    const bx = ox + (w - dw) / 2;
    const by = oy + (h - dh) / 2;
    return (x, y) => ({
      x: bbox.minX + (x - bx) / s,
      y: bbox.minY + (y - by) / s,
    });
  }
  return (x, y) => ({
    x: bbox.minX + ((x - ox) / w) * bw,
    y: bbox.minY + ((y - oy) / h) * bh,
  });
}

function mouseInCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function templateDragDelta(startX, startY, x, y) {
  if (!canvasPath.unmap) {
    return { dx: x - startX, dy: y - startY };
  }
  const start = canvasPath.unmap(startX, startY);
  const current = canvasPath.unmap(x, y);
  return { dx: current.x - start.x, dy: current.y - start.y };
}

function moveGeometricBezierPiece(variant, startOffsetX, startOffsetY, startX, startY, x, y) {
  const { dx, dy } = templateDragDelta(startX, startY, x, y);
  setGeometricPieceOffsets(
    variant,
    clamp(startOffsetX + dx, GEO_C_OFFSET[0], GEO_C_OFFSET[1]),
    clamp(startOffsetY + dy, GEO_C_OFFSET[0], GEO_C_OFFSET[1]),
  );
  rebuildPath();
}

function moveGeometricBezierJointGap(startDistance, startX, startY, x, y) {
  const { dy } = templateDragDelta(startX, startY, x, y);
  if (state.template === "sweep") state.geoSDistance = startDistance + dy;
  else state.geoCDistance = startDistance + dy;
  refreshActiveGeometricBezierPath();
  syncShapeControlsFromState();
}

function hitTestDebug(x, y) {
  if (usingGeometricBezierDebug()) {
    return hitTestGeometricBezierDebug(x, y);
  }

  let best = null;
  let bestDist = Infinity;
  canvasPath.anchors.forEach((point, index) => {
    const dist = Math.hypot(point.x - x, point.y - y);
    if (dist <= 14 && dist < bestDist) {
      best = { type: "anchor", index };
      bestDist = dist;
    }
  });
  if (!canvasPath.hideHandles) {
    canvasPath.segments.forEach((seg, segIndex) => {
      [
        { which: "c1", x: seg[2], y: seg[3] },
        { which: "c2", x: seg[4], y: seg[5] },
      ].forEach((handle) => {
        const dist = Math.hypot(handle.x - x, handle.y - y);
        if (dist <= 10 && dist < bestDist) {
          best = { type: "handle", segIndex, which: handle.which };
          bestDist = dist;
        }
      });
    });
  }
  return best;
}

function sameEditTarget(a, b) {
  if (!a || !b || a.type !== b.type) return false;
  if (a.type === "anchor") return a.index === b.index;
  if (a.type === "geoCRotation") return a.variant === b.variant;
  if (a.type === "geoCPiece") return a.variant === b.variant;
  if (a.type === "geoCJoint") return true;
  return a.segIndex === b.segIndex && a.which === b.which;
}

function moveAnchor(index, x, y) {
  const point = canvasPath.anchors[index];
  const dx = x - point.x;
  const dy = y - point.y;
  point.x = x;
  point.y = y;
  const closed = Boolean(generatedPath && generatedPath.closed);
  const segs = canvasPath.segments;
  if (closed) {
    const start = segs[index];
    const end = segs[(index - 1 + segs.length) % segs.length];
    start[0] += dx;
    start[1] += dy;
    start[2] += dx;
    start[3] += dy;
    end[6] += dx;
    end[7] += dy;
    end[4] += dx;
    end[5] += dy;
    return;
  }
  if (index < segs.length) {
    segs[index][0] += dx;
    segs[index][1] += dy;
    segs[index][2] += dx;
    segs[index][3] += dy;
  }
  if (index > 0) {
    segs[index - 1][6] += dx;
    segs[index - 1][7] += dy;
    segs[index - 1][4] += dx;
    segs[index - 1][5] += dy;
  }
}

function handleAnchor(seg, which) {
  return which === "c1" ? { x: seg[0], y: seg[1] } : { x: seg[6], y: seg[7] };
}

function getHandle(seg, which) {
  return which === "c1" ? { x: seg[2], y: seg[3] } : { x: seg[4], y: seg[5] };
}

function setHandle(seg, which, x, y) {
  if (which === "c1") {
    seg[2] = x;
    seg[3] = y;
  } else {
    seg[4] = x;
    seg[5] = y;
  }
}

function oppositeHandle(segIndex, which) {
  const n = canvasPath.segments.length;
  const closed = Boolean(generatedPath && generatedPath.closed);
  if (which === "c1") {
    if (closed) return { segIndex: (segIndex - 1 + n) % n, which: "c2" };
    if (segIndex > 0) return { segIndex: segIndex - 1, which: "c2" };
    return null;
  }
  if (closed) return { segIndex: (segIndex + 1) % n, which: "c1" };
  if (segIndex + 1 < n) return { segIndex: segIndex + 1, which: "c1" };
  return null;
}

function moveHandle(segIndex, which, x, y) {
  const segs = canvasPath.segments;
  const seg = segs[segIndex];
  setHandle(seg, which, x, y);
  const pair = oppositeHandle(segIndex, which);
  if (!pair) return;
  const anchor = handleAnchor(seg, which);
  const dx = x - anchor.x;
  const dy = y - anchor.y;
  const mag = Math.hypot(dx, dy);
  if (mag < 1e-6) return;
  const otherSeg = segs[pair.segIndex];
  const otherAnchor = handleAnchor(otherSeg, pair.which);
  const other = getHandle(otherSeg, pair.which);
  const otherLen = Math.hypot(other.x - otherAnchor.x, other.y - otherAnchor.y);
  setHandle(
    otherSeg,
    pair.which,
    otherAnchor.x - (dx / mag) * otherLen,
    otherAnchor.y - (dy / mag) * otherLen
  );
}

function refreshRibbonFromCanvas() {
  const spacing = Math.max(1, state.ellipseSize * effectiveCircleSpacing());
  pathPoints = resamplePathPoints(
    canvasPath.segments,
    canvasPath.anchors,
    spacing,
    Boolean(generatedPath && generatedPath.closed),
  );
  prepareRelaxTargets();
  if (!generatedPath || !canvasPath.unmap) return;
  const unmap = canvasPath.unmap;
  generatedPath.anchors = canvasPath.anchors.map((point) => unmap(point.x, point.y));
  generatedPath.segments = canvasPath.segments.map((seg) => {
    const p0 = unmap(seg[0], seg[1]);
    const c1 = unmap(seg[2], seg[3]);
    const c2 = unmap(seg[4], seg[5]);
    const p3 = unmap(seg[6], seg[7]);
    return [p0.x, p0.y, c1.x, c1.y, c2.x, c2.y, p3.x, p3.y];
  });
}

function mousePressed() {
  if (state.appMode === "sheet" && hasGeneratedSheets() && mouseInCanvas()) {
    const index = stickerIndexAtPoint(mouseX, mouseY);
    if (index >= 0) {
      openStickerInEditor(index);
      return false;
    }
    return;
  }
  if (manualLabelPlacementEditingEnabled() && mouseInCanvas()) {
    const hitIndex = hitTestManualLabelPlacement(mouseX, mouseY);
    if (hitIndex >= 0) {
      startManualLabelDrag(hitIndex);
      return false;
    }
    if (nextManualLabelPlacementIndex() >= 0 && pointInLabelPlacementZone(mouseX, mouseY)) {
      cursor("crosshair");
      placeManualLabelAt(mouseX, mouseY);
      return false;
    }
  }
  if (!state.debug || !mouseInCanvas()) return;
  const hit = hitTestDebug(mouseX, mouseY);
  if (!hit) return;
  if (hit.type === "geoCPiece") {
    const offsets = geometricPieceOffsets(hit.variant);
    hit.startOffsetX = offsets.x;
    hit.startOffsetY = offsets.y;
    hit.startX = mouseX;
    hit.startY = mouseY;
  }
  if (hit.type === "geoCJoint") {
    hit.startDistance = geometricBezierDistanceState().distance;
    hit.startX = mouseX;
    hit.startY = mouseY;
  }
  pathEdit.drag = hit;
  pathEdit.hover = hit;
  cursor("grabbing");
  redraw();
  return false;
}

function mouseDragged() {
  if (geoManualLabelDrag) {
    moveManualLabelDrag(mouseX, mouseY);
    return false;
  }
  if (!pathEdit.drag) return;
  const target = pathEdit.drag;
  if (target.type === "geoCRotation") {
    moveGeometricBezierRotation(target.variant, mouseX, mouseY);
    syncShapeControlsFromState();
    redraw();
    return false;
  }
  if (target.type === "geoCPiece") {
    moveGeometricBezierPiece(
      target.variant,
      target.startOffsetX,
      target.startOffsetY,
      target.startX,
      target.startY,
      mouseX,
      mouseY,
    );
    redraw();
    return false;
  }
  if (target.type === "geoCJoint") {
    moveGeometricBezierJointGap(
      target.startDistance,
      target.startX,
      target.startY,
      mouseX,
      mouseY,
    );
    redraw();
    return false;
  }
  if (target.type === "anchor") moveAnchor(target.index, mouseX, mouseY);
  else moveHandle(target.segIndex, target.which, mouseX, mouseY);
  refreshRibbonFromCanvas();
  redraw();
  return false;
}

function mouseReleased() {
  if (geoManualLabelDrag) {
    stopManualLabelDrag();
    return false;
  }
  if (!pathEdit.drag) return;
  pathEdit.drag = null;
  cursor(state.debug && pathEdit.hover ? "grab" : "default");
  redraw();
}

function mouseMoved() {
  if (pathEdit.drag || geoManualLabelDrag) return;
  if (manualLabelPlacementEditingEnabled() && mouseInCanvas()) {
    const hitIndex = hitTestManualLabelPlacement(mouseX, mouseY);
    cursor(hitIndex >= 0 ? "grab" : "default");
    return;
  }
  if (!state.debug) return;
  const hit = mouseInCanvas() ? hitTestDebug(mouseX, mouseY) : null;
  cursor(hit ? "grab" : "default");
  if (sameEditTarget(hit, pathEdit.hover)) return;
  pathEdit.hover = hit;
  redraw();
}

function loadPathLabels() {
  try {
    const raw = localStorage.getItem("gradient-paths-labels");
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && Array.isArray(parsed.good) && Array.isArray(parsed.bad)) {
      return { good: parsed.good, bad: parsed.bad };
    }
  } catch (err) {
    console.warn("Could not load path labels", err);
  }
  return { good: [], bad: [] };
}

function savePathLabels() {
  localStorage.setItem("gradient-paths-labels", JSON.stringify(PATH_LABELS));
  window.PATH_LABELS = PATH_LABELS;
}

function bindDebugLabelsUi() {
  const textarea = document.getElementById("debug-labels-json");
  if (textarea) {
    textarea.addEventListener("focus", () => textarea.select());
  }
  syncDebugLabelsUi();
}

function syncDebugLabelsUi() {
  const overlay = document.getElementById("debug-labels");
  const counts = document.getElementById("debug-label-counts");
  const notice = document.getElementById("debug-label-notice");
  const textarea = document.getElementById("debug-labels-json");
  if (!overlay || !counts || !notice || !textarea) return;
  overlay.hidden = !state.debug;
  if (!state.debug) return;
  counts.textContent = `${PATH_LABELS.good.length} good / ${PATH_LABELS.bad.length} bad`;
  notice.textContent = labelNotice;
  notice.hidden = !labelNotice;
  textarea.value = JSON.stringify(PATH_LABELS, null, 2);
}

function normalizeCanvasPath() {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const consider = (x, y) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };
  canvasPath.anchors.forEach((point) => consider(point.x, point.y));
  canvasPath.segments.forEach((seg) => {
    for (let i = 0; i < 8; i += 2) consider(seg[i], seg[i + 1]);
  });
  const bw = maxX - minX || 1;
  const bh = maxY - minY || 1;
  const norm = (x, y) => ({
    x: (x - minX) / bw,
    y: (y - minY) / bh,
  });
  return {
    anchors: canvasPath.anchors.map((point) => norm(point.x, point.y)),
    segments: canvasPath.segments.map((seg) => {
      const p0 = norm(seg[0], seg[1]);
      const c1 = norm(seg[2], seg[3]);
      const c2 = norm(seg[4], seg[5]);
      const p3 = norm(seg[6], seg[7]);
      return [p0.x, p0.y, c1.x, c1.y, c2.x, c2.y, p3.x, p3.y];
    }),
  };
}

function handleFeatures(segments) {
  return segments.map((seg) => {
    const outDx = seg[2] - seg[0];
    const outDy = seg[3] - seg[1];
    const inDx = seg[4] - seg[6];
    const inDy = seg[5] - seg[7];
    const chord = Math.hypot(seg[6] - seg[0], seg[7] - seg[1]) || 1;
    const outLen = Math.hypot(outDx, outDy);
    const inLen = Math.hypot(inDx, inDy);
    return {
      out: {
        length: outLen,
        angle: Math.atan2(outDy, outDx),
        chordRatio: outLen / chord,
      },
      in: {
        length: inLen,
        angle: Math.atan2(inDy, inDx),
        chordRatio: inLen / chord,
      },
    };
  });
}

function snapshotPathLabel(label) {
  const normalized = normalizeCanvasPath();
  return {
    label,
    template: state.template,
    closed: Boolean(generatedPath && generatedPath.closed),
    labeledAt: new Date().toISOString(),
    anchors: normalized.anchors,
    segments: normalized.segments,
    handles: handleFeatures(normalized.segments),
  };
}

function recordPathLabel(label) {
  if (!state.debug || !canvasPath.segments.length) return;
  const entry = snapshotPathLabel(label);
  PATH_LABELS[label].push(entry);
  savePathLabels();
  labelNotice = `${label} · ${PATH_LABELS.good.length} good / ${PATH_LABELS.bad.length} bad`;
  console.log(`Labeled ${label}`, entry);
  console.log("PATH_LABELS (all rated paths so far)", PATH_LABELS);
  syncDebugLabelsUi();
  redraw();
}

function exportPathLabels() {
  const blob = new Blob([JSON.stringify(PATH_LABELS, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "path-labels.json";
  link.click();
  URL.revokeObjectURL(url);
  labelNotice = `exported ${PATH_LABELS.good.length} good / ${PATH_LABELS.bad.length} bad`;
  syncDebugLabelsUi();
  redraw();
}

function inchesToPx(inches, dpi = CREATION_DPI) {
  return Math.round(inches * dpi);
}

function buildScaledDieCutOutline(transform, sheetX, sheetY) {
  state.exporting = true;
  redraw();
  const analyticalPaths = usingGeometric()
    ? geometricDieCutPolygons(canvasPath.geometric || [])
    : null;
  let outline = null;
  if (analyticalPaths) {
    outline = scaleOutlineForSheet({ kind: "polygons", paths: analyticalPaths }, transform, sheetX, sheetY);
  } else {
    const traced = traceAlphaSilhouetteOutline({ extraPad: 0 });
    if (traced && traced.points.length >= 4) {
      if (usingGeometric()) {
        outline = scaleOutlineForSheet({
          kind: "polygons",
          paths: [traced.points],
        }, transform, sheetX, sheetY);
      } else if (traced.segments.length >= 1) {
        outline = scaleOutlineForSheet({
          kind: "bezier",
          segments: traced.segments,
          closed: traced.closed,
        }, transform, sheetX, sheetY);
      }
    }
  }
  state.exporting = false;
  return outline;
}

function buildDieCutSvgFromOutline(outline, exportWidth, exportHeight) {
  if (!outline) return null;
  let pathMarkup;
  if (outline.kind === "polygons") {
    pathMarkup = outline.paths
      .map((points) => `<path fill="none" stroke="#000000" stroke-width="0.75" d="${contourToSvgPath(points)}" />`)
      .join("\n  ");
  } else {
    const d = bezierSegmentsToSvgPath(outline.segments, outline.closed);
    pathMarkup = `<path fill="none" stroke="#000000" stroke-width="0.75" d="${d}" />`;
  }
  return wrapDieCutSvg(pathMarkup, exportWidth, exportHeight);
}

function drawStickerExportCanvas(sourceCanvas, transform, exportPx) {
  const cellCanvas = document.createElement("canvas");
  cellCanvas.width = exportPx;
  cellCanvas.height = exportPx;
  const ctx = cellCanvas.getContext("2d");
  ctx.drawImage(
    sourceCanvas,
    transform.sourceX,
    transform.sourceY,
    transform.sourceW,
    transform.sourceH,
    transform.offsetX,
    transform.offsetY,
    transform.drawW,
    transform.drawH,
  );
  return cellCanvas;
}

function renderCurrentCompositionExport(exportPx) {
  state.exporting = true;
  redraw();
  const sourceCanvas = drawingContext.canvas;
  const contentBounds = measureCanvasAlphaBounds(sourceCanvas);
  const transform = stickerCellDrawTransform(
    exportPx,
    contentBounds,
    sourceCanvas.width,
    sourceCanvas.height,
  );
  state.exporting = false;
  const cellCanvas = drawStickerExportCanvas(sourceCanvas, transform, exportPx);
  const outline = buildScaledDieCutOutline(transform, 0, 0);
  return { cellCanvas, outline, exportPx };
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("PNG export failed"));
      else resolve(blob);
    }, "image/png");
  });
}

function cloneGeneratedPath(path) {
  if (!path) return null;
  if (typeof structuredClone === "function") {
    return structuredClone(path);
  }
  return JSON.parse(JSON.stringify(path));
}

function captureCompositionStateFields() {
  const fields = {};
  COMPOSITION_STATE_KEYS.forEach((key) => {
    if (key === "geoManualLabelPlacements") {
      fields[key] = state.geoManualLabelPlacements.map((item) => ({ ...item }));
      return;
    }
    if (key === "geoLabelCornerIndices") {
      fields[key] = state.geoLabelCornerIndices.slice();
      return;
    }
    fields[key] = state[key];
  });
  return fields;
}

function captureCompositionSnapshot() {
  return {
    stateFields: captureCompositionStateFields(),
    colorPath: state.colorPath.slice(),
    generatedPath: cloneGeneratedPath(generatedPath),
    relaxFrom: relaxState.from ? copyPoints(relaxState.from) : null,
    relaxTo: relaxState.to ? copyPoints(relaxState.to) : null,
    canvasW: width,
    canvasH: height,
  };
}

function captureEditorSnapshot() {
  return {
    composition: captureCompositionSnapshot(),
    canvasW: width,
    canvasH: height,
    pixelD: pixelDensity(),
  };
}

function applyCompositionState(snapshot) {
  COMPOSITION_STATE_KEYS.forEach((key) => {
    state[key] = snapshot.stateFields[key];
  });
  if (state.geoManualLabelLayoutMode !== "editing") {
    state.geoManualLabelLayoutMode = "fixed";
  }
  state.colorPath = snapshot.colorPath.slice();
  generatedPath = cloneGeneratedPath(snapshot.generatedPath);
  relaxState.from = snapshot.relaxFrom ? copyPoints(snapshot.relaxFrom) : null;
  relaxState.to = snapshot.relaxTo ? copyPoints(snapshot.relaxTo) : null;
  relaxState.weights = null;
  refreshActiveColors();
  syncEdgeLabelS69State();
}

function applyCompositionSnapshot(snapshot) {
  applyCompositionState(snapshot);
  invalidateSilhouetteCache();
  rebuildPath();
}

function snapshotSourceSize(snapshot) {
  return {
    w: snapshot.canvasW || width,
    h: snapshot.canvasH || height,
  };
}

function sheetRenderCanvasSize(snapshot) {
  if (creationSheet.sourceCanvasW > 0 && creationSheet.sourceCanvasH > 0) {
    return {
      w: creationSheet.sourceCanvasW,
      h: creationSheet.sourceCanvasH,
    };
  }
  return snapshotSourceSize(snapshot);
}

function prepareCompositionAtSourceSize(snapshot) {
  const { w, h } = sheetRenderCanvasSize(snapshot);
  applyCompositionState(snapshot);
  resizeCanvas(w, h);
  pixelDensity(1);
  invalidateSilhouetteCache();
  rebuildPath();
}

function measureCanvasAlphaBounds(canvas, alphaThreshold = 48) {
  const w = canvas.width;
  const h = canvas.height;
  if (!w || !h) return null;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const { data } = ctx.getImageData(0, 0, w, h);
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      if (data[(row + x) * 4 + 3] <= alphaThreshold) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX || maxY < minY) return null;
  const pad = 2;
  return {
    minX: Math.max(0, minX - pad),
    minY: Math.max(0, minY - pad),
    maxX: Math.min(w - 1, maxX + pad),
    maxY: Math.min(h - 1, maxY + pad),
  };
}

function stickerCellDrawTransform(cellPx, contentBounds, sourceW, sourceH) {
  const crop = contentBounds || {
    minX: 0,
    minY: 0,
    maxX: Math.max(0, sourceW - 1),
    maxY: Math.max(0, sourceH - 1),
  };
  const contentW = crop.maxX - crop.minX + 1;
  const contentH = crop.maxY - crop.minY + 1;
  const inset = Math.max(2, cellPx * SHEET_CELL_CONTENT_INSET_RATIO);
  const available = Math.max(1, cellPx - inset * 2);
  const scale = Math.min(available / contentW, available / contentH);
  const drawW = contentW * scale;
  const drawH = contentH * scale;
  return {
    scale,
    sourceX: crop.minX,
    sourceY: crop.minY,
    sourceW: contentW,
    sourceH: contentH,
    drawW,
    drawH,
    offsetX: (cellPx - drawW) / 2,
    offsetY: (cellPx - drawH) / 2,
  };
}

function prepareStickerCellRender(snapshot, cellPx) {
  prepareCompositionAtSourceSize(snapshot);
  state.exporting = true;
  redraw();
  const sourceCanvas = drawingContext.canvas;
  const contentBounds = measureCanvasAlphaBounds(sourceCanvas);
  const transform = stickerCellDrawTransform(
    cellPx,
    contentBounds,
    sourceCanvas.width,
    sourceCanvas.height,
  );
  state.exporting = false;
  return { sourceCanvas, transform };
}

function scaleOutlinePoint(point, transform, sheetX, sheetY) {
  return {
    x: sheetX + transform.offsetX + (point.x - transform.sourceX) * transform.scale,
    y: sheetY + transform.offsetY + (point.y - transform.sourceY) * transform.scale,
  };
}

function scaleOutlineForSheet(outline, transform, sheetX, sheetY) {
  if (!outline) return null;
  if (outline.kind === "polygons") {
    return {
      kind: "polygons",
      paths: outline.paths.map((points) => points.map((point) => (
        scaleOutlinePoint(point, transform, sheetX, sheetY)
      ))),
    };
  }
  return {
    kind: "bezier",
    closed: outline.closed,
    segments: outline.segments.map((segment) => ({
      p0: scaleOutlinePoint(segment.p0, transform, sheetX, sheetY),
      cp1: scaleOutlinePoint(segment.cp1, transform, sheetX, sheetY),
      cp2: scaleOutlinePoint(segment.cp2, transform, sheetX, sheetY),
      p1: scaleOutlinePoint(segment.p1, transform, sheetX, sheetY),
    })),
  };
}

function restoreEditorSnapshot(snapshot) {
  if (!snapshot) return;
  applyCompositionSnapshot(snapshot.composition);
  resizeCanvas(snapshot.canvasW, snapshot.canvasH);
  pixelDensity(snapshot.pixelD);
}

function computeSheetLayout(paperSize, stickerSizeIn, quantity) {
  const paper = PAPER_SIZES[paperSize] || PAPER_SIZES["4x6"];
  const sheetW = inchesToPx(paper.widthIn);
  const sheetH = inchesToPx(paper.heightIn);
  const margin = inchesToPx(SHEET_MARGIN_IN);
  const gap = inchesToPx(STICKER_GAP_IN);
  const cellPx = inchesToPx(stickerSizeIn);
  const usableW = sheetW - margin * 2;
  const usableH = sheetH - margin * 2;
  const cols = Math.max(1, Math.floor((usableW + gap) / (cellPx + gap)));
  const rowsOnPaper = Math.max(1, Math.floor((usableH + gap) / (cellPx + gap)));
  const maxFit = cols * rowsOnPaper;
  const count = Math.min(Math.max(1, quantity), maxFit);
  const rows = Math.max(1, Math.ceil(count / cols));
  const positions = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.push({
      x: margin + col * (cellPx + gap),
      y: margin + row * (cellPx + gap),
      cellPx,
    });
  }
  return {
    paper,
    sheetW,
    sheetH,
    margin,
    gap,
    cellPx,
    cols,
    rows,
    rowsOnPaper,
    maxFit,
    count,
    positions,
  };
}

function updateCreationLayoutInfo() {
  const info = document.getElementById("creation-layout-info");
  const perPage = stickersPerSheetPage();
  const layout = computeSheetLayout(
    creationSheet.paperSize,
    creationSheet.stickerSizeIn,
    perPage,
  );
  if (!info) return;
  const total = perPage * creationSheet.sheetCount;
  const sheetLabel = creationSheet.sheetCount === 1 ? "1 sheet" : `${creationSheet.sheetCount} sheets`;
  if (layout.maxFit < perPage) {
    info.textContent = `Grid fits ${layout.maxFit} of ${perPage} per page — reduce sticker size`;
    return;
  }
  info.textContent = `Grid: ${layout.cols} × ${layout.rows} · ${perPage} per page · ${sheetLabel} (${total} total) · mixed D, S, V, C`;
}

function buildSheetStickerSnapshots(count = stickersPerSheetPage()) {
  return buildBalancedTemplateIds(count).map((templateId) => {
    randomizeCompositionForTemplate(templateId);
    return captureCompositionSnapshot();
  });
}

function renderSheetStickerCell(snapshot, cellPx, sheetX, sheetY) {
  const { sourceCanvas, transform } = prepareStickerCellRender(snapshot, cellPx);
  const cellCanvas = drawStickerExportCanvas(sourceCanvas, transform, cellPx);
  const outline = buildScaledDieCutOutline(transform, sheetX, sheetY);
  return { cellCanvas, outline };
}

function sheetPreviewGrid(sheetCount) {
  if (sheetCount <= 1) return { cols: 1, rows: 1 };
  if (sheetCount === 2) return { cols: 2, rows: 1 };
  if (sheetCount === 3) return { cols: 3, rows: 1 };
  return { cols: 2, rows: 2 };
}

function sheetPreviewOffset(sheetIndex, pageLayout, stackGapPx, sheetCount = creationSheet.sheets.length) {
  const grid = sheetPreviewGrid(sheetCount);
  const col = sheetIndex % grid.cols;
  const row = Math.floor(sheetIndex / grid.cols);
  return {
    x: col * (pageLayout.sheetW + stackGapPx),
    y: row * (pageLayout.sheetH + stackGapPx),
  };
}

function sheetPreviewTotalSize(pageLayout, sheetCount, stackGapPx) {
  const grid = sheetPreviewGrid(sheetCount);
  return {
    grid,
    totalW: pageLayout.sheetW * grid.cols + stackGapPx * Math.max(0, grid.cols - 1),
    totalH: pageLayout.sheetH * grid.rows + stackGapPx * Math.max(0, grid.rows - 1),
  };
}

function drawSheetSizeDebugOverlay() {
  const stack = creationSheet.previewStack;
  const scale = creationSheet.previewScale;
  if (!stack || !scale || !creationSheet.sheets.length) return;

  const layout = stack.pageLayout;
  const sizeIn = creationSheet.stickerSizeIn;
  const sizeLabel = `${sizeIn.toFixed(2)} in`;
  const sizePx = Math.round(layout.cellPx);
  let flatIndex = 0;

  push();
  noFill();
  stroke(255, 0, 0);
  strokeWeight(max(1, 2 * scale));
  textSize(max(9, 11 * scale));
  textAlign(CENTER, TOP);
  textFont("monospace");

  creationSheet.sheets.forEach((sheet, sheetIndex) => {
    const sheetOffset = sheetPreviewOffset(sheetIndex, layout, stack.stackGapPx, stack.sheetCount);
    const sheetOffsetX = sheetOffset.x * scale;
    const sheetOffsetY = sheetOffset.y * scale;
    for (let i = 0; i < sheet.stickers.length; i++) {
      const pos = layout.positions[i];
      if (!pos) continue;
      const x = sheetOffsetX + pos.x * scale;
      const y = sheetOffsetY + pos.y * scale;
      const cellPx = pos.cellPx * scale;
      rect(x, y, cellPx, cellPx);

      noStroke();
      fill(255, 0, 0);
      text(`${flatIndex + 1}: ${sizeLabel} (${sizePx}px)`, x + cellPx / 2, y + 3 * scale);
      noFill();
      stroke(255, 0, 0);
      flatIndex += 1;
    }
  });
  pop();
}

function renderSheetToContext(ctx, layout, snapshots, scale = 1) {
  const sheetW = Math.round(layout.sheetW * scale);
  const sheetH = Math.round(layout.sheetH * scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, sheetW, sheetH);

  const outlines = [];
  state.sheetRendering = true;
  try {
    for (let i = 0; i < snapshots.length; i++) {
      const position = layout.positions[i];
      const cellPx = Math.round(position.cellPx * scale);
      const destX = Math.round(position.x * scale);
      const destY = Math.round(position.y * scale);
      const { cellCanvas, outline } = renderSheetStickerCell(
        snapshots[i],
        cellPx,
        position.x * scale,
        position.y * scale,
      );
      ctx.drawImage(cellCanvas, destX, destY, cellPx, cellPx);
      if (outline) outlines.push(outline);
    }
  } finally {
    state.sheetRendering = false;
  }
  return outlines;
}

function buildSheetDieCutSvg(layout, outlines, scale = 1) {
  const pathMarkup = outlines.map((outline) => {
    if (outline.kind === "polygons") {
      return outline.paths
        .map((points) => `<path fill="none" stroke="#000000" stroke-width="0.75" d="${contourToSvgPath(points)}" />`)
        .join("\n  ");
    }
    const d = bezierSegmentsToSvgPath(outline.segments, outline.closed);
    return `<path fill="none" stroke="#000000" stroke-width="0.75" d="${d}" />`;
  }).filter(Boolean).join("\n  ");
  if (!pathMarkup) return null;
  return wrapDieCutSvg(
    pathMarkup,
    Math.round(layout.sheetW * scale),
    Math.round(layout.sheetH * scale),
  );
}

function renderSheetExport(layout, stickers, scale = 1) {
  const offscreen = document.createElement("canvas");
  offscreen.width = Math.round(layout.sheetW * scale);
  offscreen.height = Math.round(layout.sheetH * scale);
  const ctx = offscreen.getContext("2d");
  const outlines = renderSheetToContext(ctx, layout, stickers, scale);
  const svg = buildSheetDieCutSvg(layout, outlines, scale);
  return { canvas: offscreen, svg };
}

function renderCreationSheetPreview() {
  if (!creationSheet.sheets.length) return;
  const pageLayout = creationSheet.sheets[0].layout;
  if (!pageLayout) return;

  const stackGapPx = pageLayout.gap;
  const sheetCount = creationSheet.sheets.length;
  const { grid, totalW, totalH } = sheetPreviewTotalSize(pageLayout, sheetCount, stackGapPx);
  creationSheet.previewStack = {
    pageLayout,
    sheetCount,
    stackGapPx,
    grid,
    totalW,
    totalH,
  };

  const backup = captureEditorSnapshot();
  const holder = document.getElementById("canvas-holder");
  const previewScale = Math.min(
    Math.max(320, holder.clientWidth) / totalW,
    Math.max(320, holder.clientHeight) / totalH,
    1,
  );
  const previewW = Math.max(1, Math.round(totalW * previewScale));
  const previewH = Math.max(1, Math.round(totalH * previewScale));
  const pagePreviewW = Math.max(1, Math.round(pageLayout.sheetW * previewScale));
  const pagePreviewH = Math.max(1, Math.round(pageLayout.sheetH * previewScale));

  const offscreen = document.createElement("canvas");
  offscreen.width = previewW;
  offscreen.height = previewH;
  const ctx = offscreen.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, previewW, previewH);

  state.sheetRendering = true;
  try {
    creationSheet.sheets.forEach((sheet, sheetIndex) => {
      const sheetCanvas = document.createElement("canvas");
      sheetCanvas.width = pagePreviewW;
      sheetCanvas.height = pagePreviewH;
      const sheetCtx = sheetCanvas.getContext("2d");
      renderSheetToContext(sheetCtx, pageLayout, sheet.stickers, previewScale);
      const sheetOffset = sheetPreviewOffset(sheetIndex, pageLayout, stackGapPx, sheetCount);
      const destX = Math.round(sheetOffset.x * previewScale);
      const destY = Math.round(sheetOffset.y * previewScale);
      ctx.drawImage(sheetCanvas, destX, destY);
      if (sheetCount > 1) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.strokeRect(destX + 0.5, destY + 0.5, pagePreviewW - 1, pagePreviewH - 1);
      }
    });
  } finally {
    state.sheetRendering = false;
  }

  creationSheet.cachedImage = offscreen;
  creationSheet.previewScale = previewScale;

  restoreEditorSnapshot(backup);
  resizeCanvas(previewW, previewH);
  pixelDensity(1);
  redraw();

  const downloadBtn = document.getElementById("creation-download");
  if (downloadBtn) downloadBtn.disabled = false;
  updateCreationLayoutInfo();
  syncAppModeUi();
}

function generateCreationSheet() {
  const perPage = stickersPerSheetPage();
  const layout = computeSheetLayout(
    creationSheet.paperSize,
    creationSheet.stickerSizeIn,
    perPage,
  );
  if (layout.maxFit < perPage) {
    updateCreationLayoutInfo();
    return;
  }

  const backup = captureEditorSnapshot();
  creationSheet.editingIndex = -1;
  creationSheet.sourceCanvasW = width;
  creationSheet.sourceCanvasH = height;
  creationSheet.sheets = [];
  for (let i = 0; i < creationSheet.sheetCount; i++) {
    creationSheet.sheets.push({
      stickers: buildSheetStickerSnapshots(perPage).slice(0, layout.count),
      layout,
    });
  }
  restoreEditorSnapshot(backup);
  renderCreationSheetPreview();
}

async function downloadCreationSheet() {
  if (!creationSheet.sheets.length) return;
  const backup = captureEditorSnapshot();
  const exportId = exportTimestampId();
  const exportScales = [1, 2];

  restoreEditorSnapshot(backup);
  renderCreationSheetPreview();

  for (let index = 0; index < creationSheet.sheets.length; index++) {
    const sheet = creationSheet.sheets[index];
    const sheetSuffix = creationSheet.sheets.length > 1 ? `-${index + 1}` : "";
    for (const scale of exportScales) {
      const scaleSuffix = scale === 1 ? "" : "-2x";
      try {
        const { canvas, svg } = renderSheetExport(sheet.layout, sheet.stickers, scale);
        const pngBlob = await canvasToPngBlob(canvas);
        triggerDownload(pngBlob, `sticker-sheet${sheetSuffix}${scaleSuffix}-${exportId}.png`);
        if (svg) {
          await new Promise((resolve) => setTimeout(resolve, 350));
          triggerDownload(
            svg,
            `sticker-sheet-die-cut${sheetSuffix}${scaleSuffix}-${exportId}.svg`,
            "image/svg+xml",
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 400));
      } catch {
        // Skip failed export and continue with remaining files.
      }
    }
  }
}

function syncEditorUiFromState() {
  syncTemplateUi();
  ensureLetterModeForTemplate();
  syncLetterModeUi();
  syncToggleButtons("fill-mode-grid", state.fillMode);
  syncFillModeUi();
  syncShapeControlsFromState();
  syncEdgeLabelsUi();
  syncManualLabelUi();
  syncModeHint();
  renderPaletteWheel();
  refreshActiveColors();
  setRangeDisplay("relax", "relax-label", state.relaxAmount, (value) => `${Math.round(value * 100)}%`);
  setRangeDisplay("relax-random", "relax-random-label", state.relaxVariation, (value) => `${Math.round(value * 100)}%`);
}

function applyCompositionSnapshotToEditor(snapshot) {
  const holder = document.getElementById("canvas-holder");
  resizeCanvas(Math.max(320, holder.clientWidth), Math.max(320, holder.clientHeight));
  pixelDensity(window.devicePixelRatio || 1);
  applyCompositionSnapshot(snapshot);
  syncEditorUiFromState();
  redraw();
}

function stickerIndexAtPoint(x, y) {
  const stack = creationSheet.previewStack;
  const scale = creationSheet.previewScale;
  if (!stack || !scale || !creationSheet.sheets.length) return -1;
  const sheetX = x / scale;
  const sheetY = y / scale;
  const { pageLayout, stackGapPx, sheetCount } = stack;
  let flatIndex = 0;
  for (let sheetIndex = 0; sheetIndex < creationSheet.sheets.length; sheetIndex++) {
    const sheet = creationSheet.sheets[sheetIndex];
    const sheetOffset = sheetPreviewOffset(sheetIndex, pageLayout, stackGapPx, sheetCount);
    if (
      sheetX < sheetOffset.x
      || sheetX >= sheetOffset.x + pageLayout.sheetW
      || sheetY < sheetOffset.y
      || sheetY >= sheetOffset.y + pageLayout.sheetH
    ) {
      flatIndex += sheet.stickers.length;
      continue;
    }
    const localX = sheetX - sheetOffset.x;
    const localY = sheetY - sheetOffset.y;
    for (let i = 0; i < sheet.stickers.length; i++) {
      const pos = pageLayout.positions[i];
      if (!pos) continue;
      if (
        localX >= pos.x
        && localX < pos.x + pos.cellPx
        && localY >= pos.y
        && localY < pos.y + pos.cellPx
      ) {
        return flatIndex + i;
      }
    }
    return -1;
  }
  return -1;
}

function commitEditedStickerToSheet() {
  if (creationSheet.editingIndex < 0) return;
  setFlatSheetSticker(creationSheet.editingIndex, captureCompositionSnapshot());
  creationSheet.editingIndex = -1;
}

function openStickerInEditor(index) {
  const snapshot = getFlatSheetSticker(index);
  if (index < 0 || !snapshot) return;
  creationSheet.editingIndex = index;
  state.appMode = "editor";
  syncAppModeUi();
  applyCompositionSnapshotToEditor(snapshot);
}

function syncAppModeUi() {
  const editorPanel = document.getElementById("editor-panel");
  const creationPanel = document.getElementById("creation-panel");
  const canvasHolder = document.getElementById("canvas-holder");
  const hint = document.getElementById("mode-hint");
  const isCreation = state.appMode === "sheet";

  if (editorPanel) editorPanel.hidden = isCreation;
  if (creationPanel) creationPanel.hidden = !isCreation;
  if (canvasHolder) {
    canvasHolder.classList.toggle("sheet-active", isCreation && hasGeneratedSheets());
  }
  syncSegmentedControl("app-mode-control", state.appMode);

  if (hint) {
    if (isCreation) {
      hint.textContent = hasGeneratedSheets()
        ? `Click a sticker to edit it, then return here to update the sheet.${state.sheetDebug ? " D hides size outlines." : " D shows sticker size outlines."}`
        : "Set paper, sticker size, and sheet count, then generate.";
    } else if (creationSheet.editingIndex >= 0) {
      hint.textContent = `Editing sticker ${creationSheet.editingIndex + 1}. Switch to Sheet to update the sheet.`;
    } else {
      hint.textContent = "R regenerates. D shows handles. G shows guidelines. S saves.";
    }
  }
}

function setAppMode(mode) {
  if (mode === state.appMode) return;

  if (mode === "sheet") {
    if (state.appMode === "editor") {
      commitEditedStickerToSheet();
    }
    state.appMode = "sheet";
    syncAppModeUi();
    if (hasGeneratedSheets()) {
      renderCreationSheetPreview();
    } else {
      clearCreationSheet();
      const holder = document.getElementById("canvas-holder");
      resizeCanvas(Math.max(320, holder.clientWidth), Math.max(320, holder.clientHeight));
      redraw();
    }
    return;
  }

  if (creationSheet.editingIndex >= 0) {
    state.appMode = "editor";
    syncAppModeUi();
    return;
  }

  state.appMode = "editor";
  if (editorModeBackup) {
    restoreEditorSnapshot(editorModeBackup);
    syncEditorUiFromState();
    editorModeBackup = null;
  } else {
    const holder = document.getElementById("canvas-holder");
    resizeCanvas(holder.clientWidth, holder.clientHeight);
    rebuildPath();
  }
  syncAppModeUi();
  redraw();
}

function syncSegmentedControl(elementId, value) {
  const control = document.getElementById(elementId);
  if (!control) return;
  control.dataset.active = value;
  control.querySelectorAll("button").forEach((el) => {
    el.setAttribute("aria-pressed", String(el.dataset.id === value));
  });
}

function bindAppModeUi() {
  const control = document.getElementById("app-mode-control");
  if (!control) return;
  control.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const nextMode = button.dataset.id;
      if (nextMode === "sheet" && state.appMode === "editor" && creationSheet.editingIndex < 0) {
        editorModeBackup = captureEditorSnapshot();
      }
      setAppMode(nextMode);
    });
  });
}

function syncSheetDebugUi() {
  const checkbox = document.getElementById("creation-sheet-debug");
  if (checkbox) checkbox.checked = state.sheetDebug;
}

function bindCreationUi() {
  const paperSelect = document.getElementById("creation-paper-size");
  const stickerSize = document.getElementById("creation-sticker-size");
  const stickerSizeLabel = document.getElementById("creation-sticker-size-label");
  const sheetCount = document.getElementById("creation-sheet-count");
  const sheetCountLabel = document.getElementById("creation-sheet-count-label");
  const sheetDebug = document.getElementById("creation-sheet-debug");
  const generateBtn = document.getElementById("creation-generate");
  const downloadBtn = document.getElementById("creation-download");

  const invalidateGeneratedSheets = () => {
    clearCreationSheet();
    if (downloadBtn) downloadBtn.disabled = true;
    updateCreationLayoutInfo();
    redraw();
  };

  if (paperSelect) {
    paperSelect.value = creationSheet.paperSize;
    paperSelect.addEventListener("change", () => {
      creationSheet.paperSize = paperSelect.value;
      invalidateGeneratedSheets();
    });
  }

  if (stickerSize && stickerSizeLabel) {
    stickerSize.addEventListener("input", () => {
      creationSheet.stickerSizeIn = Number(stickerSize.value);
      stickerSizeLabel.textContent = `${creationSheet.stickerSizeIn.toFixed(2)} in`;
      invalidateGeneratedSheets();
    });
  }

  if (sheetCount && sheetCountLabel) {
    sheetCount.value = String(creationSheet.sheetCount);
    sheetCountLabel.textContent = String(creationSheet.sheetCount);
    sheetCount.addEventListener("input", () => {
      creationSheet.sheetCount = Math.min(
        SHEET_COUNT_MAX,
        Math.max(1, Number(sheetCount.value) || 1),
      );
      sheetCount.value = String(creationSheet.sheetCount);
      sheetCountLabel.textContent = String(creationSheet.sheetCount);
      invalidateGeneratedSheets();
    });
  }

  if (sheetDebug) {
    sheetDebug.checked = state.sheetDebug;
    sheetDebug.addEventListener("change", () => {
      state.sheetDebug = sheetDebug.checked;
      syncAppModeUi();
      redraw();
    });
  }

  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      generateCreationSheet();
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      downloadCreationSheet();
    });
  }
}

function keyboardShortcutBlocked(event) {
  if (event.target.closest("textarea")) return true;
  if (event.target.tagName === "INPUT" && event.target.type !== "range") return true;
  if (event.target.tagName === "SELECT") return true;
  return false;
}

function onKeyDown(event) {
  if (keyboardShortcutBlocked(event)) return;
  const key = event.key.toLowerCase();
  if (key === "r") {
    regenerateCurrentPath();
    return;
  }
  if (key === "g") {
    event.preventDefault();
    state.guidelines = !state.guidelines;
    redraw();
    return;
  }
  if (key === "d") {
    if (state.appMode === "sheet") {
      state.sheetDebug = !state.sheetDebug;
      syncSheetDebugUi();
      syncAppModeUi();
      redraw();
      return;
    }
    state.debug = !state.debug;
    if (!state.debug) {
      pathEdit.drag = null;
      pathEdit.hover = null;
      cursor("default");
    }
    syncDebugLabelsUi();
    redraw();
    return;
  }
  if (key === "s") {
    event.preventDefault();
    if (state.appMode === "sheet") {
      downloadCreationSheet();
    } else {
      downloadTransparentPng();
    }
    return;
  }
  if (key === "escape" && supportsManualLabelLayout() && state.geoManualLabelLayoutMode === "editing") {
    event.preventDefault();
    setManualLabelLayoutMode("fixed");
    return;
  }
  if (!state.debug) return;
  if (key === "y") recordPathLabel("good");
  if (key === "n") recordPathLabel("bad");
  if (key === "e") exportPathLabels();
}

function normalizeDegrees(deg) {
  let value = deg % 360;
  if (value > 180) value -= 360;
  if (value <= -180) value += 360;
  return value;
}

function drawGeometricSDebugKnob(anchor, knob, active, armColor, knobColor) {
  stroke(...armColor);
  strokeWeight(active ? 2.5 : 2);
  line(anchor.x, anchor.y, knob.x, knob.y);
  noStroke();
  fill(...knobColor);
  circle(knob.x, knob.y, active ? 16 : 12);
}

function geometricCRotationKnobPoint(primitive) {
  const armRad = primitive.rotation - Math.PI / 2;
  return {
    x: primitive.anchorX + GEO_C_KNOB_ARM * Math.cos(armRad),
    y: primitive.anchorY + GEO_C_KNOB_ARM * Math.sin(armRad),
  };
}

function moveGeometricBezierRotation(variant, x, y) {
  const primitive = (canvasPath.geometric || []).find((item) => item.variant === variant);
  if (!primitive) return;
  const totalRad = Math.atan2(y - primitive.anchorY, x - primitive.anchorX) + Math.PI / 2;
  const totalDeg = (totalRad * 180) / Math.PI;
  setGeometricBezierRotation(variant, normalizeDegrees(totalDeg));
}

function pointInRect(x, y, minX, minY, maxX, maxY, pad = 0) {
  return x >= minX - pad && x <= maxX + pad && y >= minY - pad && y <= maxY + pad;
}

function hitTestGeometricBezierDebug(x, y) {
  const joint = geometricCJointPoint();
  const jointDist = Math.hypot(joint.jointX - x, joint.jointY - y);
  if (jointDist <= GEO_C_JOINT_HIT) {
    return { type: "geoCJoint" };
  }

  let best = null;
  let bestDist = Infinity;

  (canvasPath.geometric || []).forEach((item) => {
    const knob = geometricCRotationKnobPoint(item);
    const knobDist = Math.hypot(knob.x - x, knob.y - y);
    if (knobDist <= 14 && knobDist < bestDist) {
      best = { type: "geoCRotation", variant: item.variant };
      bestDist = knobDist;
    }
  });

  (canvasPath.geometric || []).forEach((item) => {
    const bounds = strokePathOutlineBounds(item, SHAPE_STROKE_PX * 2);
    if (!pointInRect(x, y, bounds.minX, bounds.minY, bounds.maxX, bounds.maxY, GEO_C_PIECE_HIT_PAD)) {
      return;
    }
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    const dist = Math.hypot(cx - x, cy - y);
    if (dist < bestDist) {
      best = { type: "geoCPiece", variant: item.variant };
      bestDist = dist;
    }
  });

  return best;
}

function drawGeometricCDebugBox(bounds, variant, jointCorner) {
  const { minX, minY, maxX, maxY } = bounds;
  const color = variant === "top" ? [130, 220, 255] : [255, 160, 210];
  const corners = [
    { label: "top left", x: minX, y: minY, ax: RIGHT, ay: BOTTOM, ox: -6, oy: -6, joint: variant === "bottom" },
    { label: "top right", x: maxX, y: minY, ax: LEFT, ay: BOTTOM, ox: 6, oy: -6, joint: false },
    { label: "bottom left", x: minX, y: maxY, ax: RIGHT, ay: TOP, ox: -6, oy: 10, joint: variant === "top" },
    { label: "bottom right", x: maxX, y: maxY, ax: LEFT, ay: TOP, ox: 6, oy: 10, joint: false },
  ];

  push();
  noFill();
  stroke(color[0], color[1], color[2], 220);
  strokeWeight(1.5);
  rect(minX, minY, maxX - minX, maxY - minY);

  corners.forEach(({ label, x, y, ax, ay, ox, oy, joint }) => {
    noStroke();
    if (joint) {
      fill(255, 220, 72);
      circle(x, y, 12);
      stroke(255, 220, 72, 220);
      strokeWeight(2);
      noFill();
      circle(jointCorner.x, jointCorner.y, 18);
      noStroke();
    } else {
      fill(color[0], color[1], color[2]);
      circle(x, y, 8);
    }
    textAlign(ax, ay);
    textSize(10);
    fill(20, 20, 20, 200);
    const tw = textWidth(label) + 8;
    const th = 12;
    const lx = x + ox + (ax === LEFT ? 0 : ax === RIGHT ? -tw : -tw / 2);
    const ly = y + oy + (ay === TOP ? 0 : ay === BOTTOM ? -th : -th / 2);
    rect(lx, ly, tw, th, 3);
    fill(joint ? 255 : color[0], joint ? 220 : color[1], joint ? 72 : color[2]);
    text(joint ? `${label} (joint)` : label, x + ox, y + oy);
  });

  const pieceLabel = variant === "top" ? "TOP PIECE" : "BOTTOM PIECE";
  push();
  textAlign(CENTER, CENTER);
  textSize(13);
  textLeading(16);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const tw = textWidth(pieceLabel) + 16;
  const th = 22;
  noStroke();
  fill(20, 20, 20, 210);
  rect(cx - tw / 2, cy - th / 2, tw, th, 5);
  fill(color[0], color[1], color[2]);
  text(pieceLabel, cx, cy);
  pop();
  pop();
}

function drawGeometricBezierDebug() {
  const joint = geometricCJointPoint();
  const jointCorner = { x: joint.jointX, y: joint.jointY };
  const jointActive = sameEditTarget(
    { type: "geoCJoint" },
    pathEdit.drag || pathEdit.hover,
  );
  const { distance, overlap } = geometricBezierDistanceState();

  push();
  noFill();
  stroke(255, 220, 72, jointActive ? 255 : 170);
  strokeWeight(jointActive ? 2.5 : 1.5);
  drawingContext.setLineDash([6, 5]);
  line(jointCorner.x - 28, jointCorner.y, jointCorner.x + 28, jointCorner.y);
  line(jointCorner.x, jointCorner.y - 28, jointCorner.x, jointCorner.y + 28);
  drawingContext.setLineDash([]);
  noStroke();
  fill(255, 220, 72, jointActive ? 255 : 210);
  circle(jointCorner.x, jointCorner.y, jointActive ? 22 : 18);
  fill(20, 20, 20, 220);
  circle(jointCorner.x, jointCorner.y, 6);
  pop();

  push();
  textAlign(CENTER, BOTTOM);
  textSize(11);
  const spread = geometricCVerticalSpread(distance, overlap);
  const jointText = `joint · gap ${Math.round(spread)}px (dist ${Math.round(distance)} · overlap ${Math.round(overlap)})`;
  const jointTw = textWidth(jointText) + 14;
  fill(20, 20, 20, 210);
  rect(jointCorner.x - jointTw / 2, jointCorner.y - 38, jointTw, 18, 4);
  fill(255, 220, 72);
  text(jointText, jointCorner.x, jointCorner.y - 22);
  pop();

  if (spread !== 0) {
    const scaleY = canvasPath.unmap
      ? canvasPath.unmap(0, 1).y - canvasPath.unmap(0, 0).y
      : 1;
    const bandH = Math.max(6, Math.abs(spread) * Math.abs(scaleY));
    push();
    noStroke();
    fill(255, 220, 72, 90);
    rect(jointCorner.x - 10, jointCorner.y - bandH / 2, 20, bandH, 4);
    pop();
  }

  (canvasPath.geometric || []).forEach((item) => {
    const bounds = strokePathOutlineBounds(item, SHAPE_STROKE_PX * 2);
    const activePiece = sameEditTarget(
      { type: "geoCPiece", variant: item.variant },
      pathEdit.drag || pathEdit.hover,
    );
    const activeRotation = sameEditTarget(
      { type: "geoCRotation", variant: item.variant },
      pathEdit.drag || pathEdit.hover,
    );
    if (activePiece) {
      push();
      noFill();
      stroke(255, 255, 255, 90);
      strokeWeight(2);
      rect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
      pop();
    }

    const anchor = { x: item.anchorX, y: item.anchorY };
    const knob = geometricCRotationKnobPoint(item);
    const deg = (item.rotation * 180) / Math.PI;
    const base = geometricBezierRotationState(item.variant);
    const label = item.variant === "top" ? "top arc" : "bottom arc";
    drawGeometricSDebugKnob(
      anchor,
      knob,
      activeRotation,
      item.variant === "top" ? [130, 220, 255, activeRotation ? 255 : 180] : [255, 160, 210, activeRotation ? 255 : 200],
      item.variant === "top"
        ? (activeRotation ? [180, 240, 255] : [130, 220, 255])
        : (activeRotation ? [255, 200, 230] : [255, 160, 210]),
    );
    push();
    textAlign(CENTER, TOP);
    textSize(11);
    fill(item.variant === "top" ? 130 : 255, item.variant === "top" ? 220 : 160, item.variant === "top" ? 255 : 210);
    text(`${label}: ${formatGeoCRotation(base)} (${formatGeoCRotation(deg)} drawn)`, knob.x, knob.y + 10);
    pop();

    const offsets = geometricPieceOffsets(item.variant);
    push();
    textAlign(CENTER, TOP);
    textSize(11);
    fill(item.variant === "top" ? 130 : 255, item.variant === "top" ? 220 : 160, item.variant === "top" ? 255 : 210);
    text(
      `offset ${Math.round(offsets.x)}, ${Math.round(offsets.y)}`,
      (bounds.minX + bounds.maxX) / 2,
      bounds.maxY + 8,
    );
    pop();

    drawGeometricCDebugBox(bounds, item.variant, jointCorner);
  });
}

function drawSilhouetteDebugOutline() {
  const extraPad = !usingGeometric() && state.letterMode === "blobby"
    ? state.edgeLabelOffset
    : 0;
  const outline = traceAlphaSilhouetteOutline({ extraPad, source: "render" });
  if (!outline?.points?.length) {
    push();
    noStroke();
    fill(255, 0, 0);
    textSize(12);
    text("silhouette trace failed", 12, 20);
    pop();
    return;
  }

  push();
  noFill();
  stroke(255, 0, 0);
  strokeWeight(2);
  beginShape();
  outline.points.forEach((point) => vertex(point.x, point.y));
  endShape(CLOSE);

  if (outline.segments?.length) {
    const ctx = drawingContext;
    ctx.save();
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(outline.segments[0].p0.x, outline.segments[0].p0.y);
    outline.segments.forEach((segment) => {
      ctx.bezierCurveTo(
        segment.cp1.x,
        segment.cp1.y,
        segment.cp2.x,
        segment.cp2.y,
        segment.p1.x,
        segment.p1.y,
      );
    });
    if (outline.closed) ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
  pop();
}

function drawDebug() {
  drawSilhouetteDebugOutline();

  if (usingGeometric() && state.edgeLabels) {
    drawGeometricEdgeLabelDebug();
  }

  if (usingGeometricBezierDebug()) {
    drawGeometricBezierDebug();
    return;
  }

  const { segments, anchors, origins, hideHandles } = canvasPath;

  origins.forEach((origin) => {
    noStroke();
    fill(255, 196, 72, 48);
    circle(origin.x, origin.y, origin.r * 2);
    noFill();
    stroke(255, 196, 72, 220);
    strokeWeight(1.5);
    circle(origin.x, origin.y, origin.r * 2);
    stroke(255, 196, 72, 140);
    strokeWeight(1);
    line(origin.x, origin.y, origin.movedX, origin.movedY);
    noStroke();
    fill(255, 196, 72);
    circle(origin.x, origin.y, 7);
  });

  noFill();
  stroke(255, 230);
  strokeWeight(1.5);
  segments.forEach((seg) => {
    bezier(seg[0], seg[1], seg[2], seg[3], seg[4], seg[5], seg[6], seg[7]);
  });

  if (!hideHandles) {
    segments.forEach((seg, segIndex) => {
      stroke(130, 200, 255, 180);
      strokeWeight(1);
      line(seg[0], seg[1], seg[2], seg[3]);
      line(seg[6], seg[7], seg[4], seg[5]);
      [
        { which: "c1", x: seg[2], y: seg[3] },
        { which: "c2", x: seg[4], y: seg[5] },
      ].forEach((handle) => {
        const active = sameEditTarget(
          { type: "handle", segIndex, which: handle.which },
          pathEdit.drag || pathEdit.hover
        );
        noStroke();
        fill(active ? 255 : 130, active ? 255 : 200, 255);
        circle(handle.x, handle.y, active ? 12 : 8);
      });
    });
  }

  anchors.forEach((point, index) => {
    const active = sameEditTarget(
      { type: "anchor", index },
      pathEdit.drag || pathEdit.hover
    );
    noStroke();
    fill(255);
    circle(point.x, point.y, active ? 16 : 12);
    fill(20);
    textAlign(CENTER, CENTER);
    textSize(10);
    text(String(index), point.x, point.y + 0.5);
  });
}

function copyPoint(point) {
  return { x: point.x, y: point.y };
}

function polylineLength(points) {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return length;
}

function sampleSingleBezier(seg) {
  const points = [];
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push({
      x: bezierPoint(seg[0], seg[2], seg[4], seg[6], t),
      y: bezierPoint(seg[1], seg[3], seg[5], seg[7], t),
    });
  }
  return points;
}

function sampleBezierSegments(segments) {
  const points = [];
  segments.forEach((seg) => {
    const sampled = sampleSingleBezier(seg);
    if (points.length) sampled.shift();
    points.push(...sampled);
  });
  return points;
}

function resampleLegWithEndpoints(samples, start, end, spacing) {
  const leg = resampleByDistance(samples, spacing, false);
  if (!leg.length) return [copyPoint(start), copyPoint(end)];
  leg[0] = copyPoint(start);
  leg[leg.length - 1] = copyPoint(end);
  return leg;
}

function buildMoonCirclePoints(segments, anchors, spacing) {
  if (segments.length < 5 || anchors.length < 5) return null;
  const bottomLeft = anchors[0];
  const topLeft = anchors[2];
  const stemSamples = sampleBezierSegments(segments.slice(0, 2));
  const bowlSamples = sampleBezierSegments(segments.slice(2, 5));
  const lenStem = polylineLength(stemSamples);
  const lenBowl = polylineLength(bowlSamples);
  if (lenStem <= 0 && lenBowl <= 0) {
    return [copyPoint(bottomLeft), copyPoint(topLeft)];
  }

  const stepsStem = Math.max(1, Math.round(lenStem / spacing));
  const stepsBowl = Math.max(1, Math.round(lenBowl / spacing));
  const avgSpacing = ((lenStem / stepsStem) + (lenBowl / stepsBowl)) / 2;

  const stemLeg = resampleLegWithEndpoints(stemSamples, bottomLeft, topLeft, avgSpacing);
  const bowlLeg = resampleLegWithEndpoints(bowlSamples, topLeft, bottomLeft, avgSpacing);
  return stemLeg.concat(bowlLeg.slice(1));
}

function buildVeeCirclePoints(segments, anchors, spacing) {
  if (segments.length < 2 || anchors.length < 3) return null;
  const left = anchors[0];
  const apex = anchors[1];
  const right = anchors[2];
  const samples0 = sampleSingleBezier(segments[0]);
  const samples1 = sampleSingleBezier(segments[1]);
  const len0 = polylineLength(samples0);
  const len1 = polylineLength(samples1);
  if (len0 <= 0 && len1 <= 0) {
    return [copyPoint(left), copyPoint(apex), copyPoint(right)];
  }

  const steps0 = Math.max(1, Math.round(len0 / spacing));
  const steps1 = Math.max(1, Math.round(len1 / spacing));
  const avgSpacing = ((len0 / steps0) + (len1 / steps1)) / 2;

  const leg0 = resampleLegWithEndpoints(samples0, left, apex, avgSpacing);
  const leg1 = resampleLegWithEndpoints(samples1, apex, right, avgSpacing);
  return leg0.concat(leg1.slice(1));
}

function resamplePathPoints(segments, anchors, spacing, closed) {
  if (usingMoonCircles()) {
    const moonPoints = buildMoonCirclePoints(segments, anchors, spacing);
    if (moonPoints) return moonPoints;
  }
  if (usingVeeCircles()) {
    const veePoints = buildVeeCirclePoints(segments, anchors, spacing);
    if (veePoints) return veePoints;
  }
  return resampleByDistance(sampleBeziers(segments), spacing, closed);
}

function resampleByDistance(points, spacing, closed) {
  if (points.length === 0) return [];
  const first = { x: points[0].x, y: points[0].y };
  if (points.length === 1) return [first];
  const last = { x: points[points.length - 1].x, y: points[points.length - 1].y };

  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    const dist = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    cum.push(cum[i - 1] + dist);
  }
  const length = cum[cum.length - 1];
  if (length === 0) return [first];

  const target = Math.max(1, spacing);
  const steps = Math.max(1, Math.round(length / target));
  const lastIndex = closed ? steps - 1 : steps;
  const out = [];
  let seg = 0;
  for (let k = 0; k <= lastIndex; k++) {
    const dist = (k / steps) * length;
    while (seg < cum.length - 2 && cum[seg + 1] < dist) seg += 1;
    const segLen = cum[seg + 1] - cum[seg];
    const t = segLen === 0 ? 0 : (dist - cum[seg]) / segLen;
    const a = points[seg];
    const b = points[seg + 1];
    out.push({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    });
  }
  out[0] = first;
  if (!closed) out[out.length - 1] = last;
  return out;
}

function colorAt(t) {
  const colors = activeColors.map(hexToRgb);
  if (colors.length === 0) return [255, 255, 255];
  if (colors.length === 1 || t <= 0) return colors[0];
  if (t >= 1) return colors[colors.length - 1];
  const scaled = t * (colors.length - 1);
  const i = Math.min(Math.floor(scaled), colors.length - 2);
  const localT = scaled - i;
  const a = colors[i];
  const b = colors[i + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * localT),
    Math.round(a[1] + (b[1] - a[1]) * localT),
    Math.round(a[2] + (b[2] - a[2]) * localT),
  ];
}

function normalizeHex(value) {
  let hex = value.trim().replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  if (hex.length === 8) hex = hex.slice(0, 6);
  if (hex.length !== 6) return null;
  return `#${hex.toUpperCase()}`;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function srgbToLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToLab(r, g, b) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  let x = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047;
  let y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
  let z = (R * 0.0193339 + G * 0.119192 + B * 0.9503041) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

function labDistance(p, q) {
  return Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b);
}

/**
 * Place known vivid colors in the fixed wheel order, then append any
 * remaining swatches by walking nearest neighbors in LAB.
 */
function orderPaletteForGradient(hexes) {
  const unique = [];
  const seen = new Set();
  hexes.map(normalizeHex).filter(Boolean).forEach((hex) => {
    if (!seen.has(hex)) {
      seen.add(hex);
      unique.push(hex);
    }
  });
  if (unique.length <= 1) return unique;

  const knownRank = new Map(COLOR_ORDER.map((hex, index) => [hex, index]));
  const known = [];
  const unknown = [];
  unique.forEach((hex) => {
    if (knownRank.has(hex)) known.push(hex);
    else unknown.push(hex);
  });
  known.sort((a, b) => knownRank.get(a) - knownRank.get(b));
  return known.concat(orderUnknownColors(unknown));
}

function orderUnknownColors(hexes) {
  if (hexes.length <= 1) return hexes;
  const remaining = hexes.map((hex) => ({
    hex,
    lab: rgbToLab(...hexToRgb(hex)),
  }));
  const ordered = [remaining.shift()];

  while (remaining.length) {
    const current = ordered[ordered.length - 1];
    let bestIndex = 0;
    let bestDistance = Infinity;
    remaining.forEach((item, index) => {
      const distance = labDistance(current.lab, item.lab);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    ordered.push(remaining.splice(bestIndex, 1)[0]);
  }

  return ordered.map((item) => item.hex);
}
