/*
 * Centralized device capability detection & rendering tier presets.
 * Classifies devices into:
 *   - 'capable'     : desktop/modern mobile hardware (full visual quality)
 *   - 'constrained' : mid/older 4-core or <=4GB devices, or 3G networks
 *   - 'low-end'     : <=2 cores, <=2GB RAM, Save-Data, 2G, or missing WebGL
 * Touch/mobile devices with strong hardware stay 'capable' (only scroll
 * smoothing defers to native OS scrolling when pointer is coarse/small).
 */
export function getDeviceProfile() {
  if (typeof window === 'undefined') {
    return {
      tier: 'capable',
      reducedMotion: false,
      isTouchOrSmall: false,
      saveData: false,
      bgScale: 0.45,
      bgInterval: 32,
      bgLerp: 0.068,
      paintDprCap: 1.5,
      paintStampSize: 128,
      paintMaxDabs: 700,
      fluidDprCap: 1.5,
      fluidSim: [200, 100]
    };
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchOrSmall = window.matchMedia('(pointer: coarse), (hover: none), (max-width: 900px)').matches;
  const cores = navigator.hardwareConcurrency;
  const memory = navigator.deviceMemory;
  const conn = navigator.connection;
  const saveData = conn?.saveData === true;
  const net = conn?.effectiveType;
  const hasWebGL = typeof WebGLRenderingContext !== 'undefined';

  let tier = 'capable';
  if (
    saveData ||
    net === 'slow-2g' ||
    net === '2g' ||
    !hasWebGL ||
    (typeof cores === 'number' && cores <= 2) ||
    (typeof memory === 'number' && memory <= 2)
  ) {
    tier = 'low-end';
  } else if (
    (typeof cores === 'number' && cores <= 4) ||
    (typeof memory === 'number' && memory <= 4) ||
    net === '3g'
  ) {
    tier = 'constrained';
  }

  const presets = {
    capable: {
      bgScale: 0.45,
      bgInterval: 32,       // ~30fps
      bgLerp: 0.068,
      paintDprCap: 1.5,
      paintStampSize: 128,
      paintMaxDabs: 700,
      fluidDprCap: 1.5,
      fluidSim: [200, 100]
    },
    constrained: {
      bgScale: 0.35,
      bgInterval: 50,       // ~20fps
      bgLerp: 0.1,
      paintDprCap: 1,
      paintStampSize: 96,
      paintMaxDabs: 500,
      fluidDprCap: 1.25,
      fluidSim: [160, 80]
    },
    'low-end': {
      bgScale: 0.3,
      bgInterval: 80,       // ~12fps
      bgLerp: 0.16,
      paintDprCap: 1,
      paintStampSize: 64,
      paintMaxDabs: 300,
      fluidDprCap: 1,
      fluidSim: [120, 60]
    }
  };

  return {
    tier,
    reducedMotion,
    isTouchOrSmall,
    saveData,
    ...presets[tier]
  };
}

