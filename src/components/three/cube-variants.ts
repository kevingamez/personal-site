// Tunable looks for the particle cube. Built as data so variants can be
// compared side by side; the exported DEFAULT is the shipped look.

export interface CubeVariant {
  distribution: 'surface' | 'volume' | 'edges'
  palette: 'faces' | 'ink-violet' | 'ink'
  count: number
  jitter: number
  sizeScale: number
  opacity: number
  /** 'edges' distribution: share of particles pinned to the 12 edges. */
  edgeShare?: number
}

export const CUBE_VARIANTS: Record<string, CubeVariant> = {
  // Refined six-color faces, dense and tight.
  A: {
    distribution: 'surface',
    palette: 'faces',
    count: 10800,
    jitter: 0.02,
    sizeScale: 0.85,
    opacity: 0.95,
  },
  // Edge-boosted silhouette in ink + violet.
  B: {
    distribution: 'edges',
    palette: 'ink-violet',
    count: 9000,
    jitter: 0.02,
    sizeScale: 0.95,
    opacity: 0.95,
  },
  // Volumetric cloud, closest to the reference brain's body.
  C: {
    distribution: 'volume',
    palette: 'ink-violet',
    count: 9600,
    jitter: 0,
    sizeScale: 0.9,
    opacity: 0.9,
  },
  // Vela-minimal: ink dust with violet glints on the surface.
  D: {
    distribution: 'surface',
    palette: 'ink-violet',
    count: 9000,
    jitter: 0.02,
    sizeScale: 0.9,
    opacity: 0.95,
  },
  // The previous shipped look (baseline).
  E: {
    distribution: 'surface',
    palette: 'faces',
    count: 7200,
    jitter: 0.03,
    sizeScale: 1.15,
    opacity: 0.95,
  },
  // Round 2 refinements of B; B1 is the shipped look (unanimous judge pick
  // for form + restraint, with stronger edge contrast).
  B1: {
    distribution: 'edges',
    palette: 'ink-violet',
    count: 8400,
    jitter: 0.02,
    sizeScale: 0.85,
    opacity: 0.95,
    edgeShare: 0.6,
  },
  B2: {
    distribution: 'edges',
    palette: 'ink-violet',
    count: 11000,
    jitter: 0.015,
    sizeScale: 0.75,
    opacity: 0.95,
    edgeShare: 0.5,
  },
}

export const DEFAULT_CUBE_VARIANT = 'B1'
