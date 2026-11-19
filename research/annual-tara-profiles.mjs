// Almora calibration through 2025. Regression-tested against the original fit.
export const profiles = [
  {
    "key": "Jupiter|set|Asta|direct",
    "thresholdSunAltitudeDeg": -7.434207345833286,
    "quantile": 0.25
  },
  {
    "key": "Jupiter|rise|Udaya|direct",
    "thresholdSunAltitudeDeg": -9.247471195868144,
    "quantile": 0.25
  },
  {
    "key": "Venus|rise|Asta|direct",
    "thresholdSunAltitudeDeg": -5.808388232497379,
    "quantile": 0.25
  },
  {
    "key": "Venus|set|Udaya|direct",
    "thresholdSunAltitudeDeg": -5.639052336252108,
    "quantile": 0.95
  },
  {
    "key": "Venus|set|Asta|retrograde",
    "thresholdSunAltitudeDeg": -5.1417719341447,
    "quantile": 0.25
  },
  {
    "key": "Venus|rise|Udaya|retrograde",
    "thresholdSunAltitudeDeg": -6.527086134708277,
    "quantile": 0.25
  },
  {
    "key": "Star1|rise|Udaya|fixed-star|azimuth-linear",
    "slope": -5.126870087662189,
    "intercept": 408.4583913181028,
    "trainingSamples": 7,
    "medianSunAltitudeDeg": -14.777768520345433,
    "residualQuantile": 0.25,
    "residualThresholdDeg": -0.021423715146568156,
    "centerDayOfYear": 250,
    "seasonalWindowDays": 91
  },
  {
    "key": "Star1|set|Asta|fixed-star|azimuth-linear",
    "slope": -3.962423444278493,
    "intercept": 331.4159384431514,
    "trainingSamples": 7,
    "medianSunAltitudeDeg": -15.093311118325403,
    "residualQuantile": 0.9,
    "residualThresholdDeg": 0.018836560587226374,
    "centerDayOfYear": 105,
    "seasonalWindowDays": 91
  }
];
