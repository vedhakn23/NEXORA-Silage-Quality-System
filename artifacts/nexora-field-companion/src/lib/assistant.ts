export type AssistantLanguage = 'en' | 'kn' | 'hi';
export type StatusTone = 'good' | 'watch' | 'risk';

export type AssistantAnalysis = {
  score: number;
  quality: 'good' | 'watch' | 'risk';
  risk: 'low' | 'medium' | 'high';
  reasons: string[];
  recommendation: 'feed' | 'blend' | 'hold';
};

export type AssistantContext = {
  profile: {
    name: string;
    farmName: string;
    location: string;
    breed?: string;
    lactationStage?: string;
    milkYield?: string;
    ration?: string;
  };
  draft: {
    sampleId: string;
    mode: 'demo' | 'manual';
    readings: {
      ph: number;
      moisture: number;
      temperature: number;
      voc: number;
      nir: number;
    };
    milkTarget: string;
    actualMilk: string;
  };
  analysis: AssistantAnalysis;
  tests: Array<{
    createdAt: string;
    sampleId: string;
    farm: string;
    readings: {
      ph: number;
      moisture: number;
      temperature: number;
      voc: number;
      nir: number;
    };
    analysis: AssistantAnalysis;
    milkTarget: string;
    actualMilk?: string;
  }>;
};

type KnowledgeCategory =
  | 'general'
  | 'storage'
  | 'ph'
  | 'moisture'
  | 'temperature'
  | 'voc'
  | 'nir'
  | 'spoilage'
  | 'feeding'
  | 'milk'
  | 'history'
  | 'profile'
  | 'device';

export type SilageKnowledgeEntry = {
  id: string;
  category: KnowledgeCategory;
  patterns: string[];
};

/**
 * Local, inspectable knowledge for the prototype assistant. The patterns are
 * intentionally broad so quick questions, typed questions, and speech
 * transcripts all use the same contextual engine.
 */
export const SILAGE_KNOWLEDGE_BASE: SilageKnowledgeEntry[] = [
  {
    id: 'safe-feed',
    category: 'feeding',
    patterns: ['is my silage safe', 'can i feed', 'can i give', 'feed this silage', 'okay for my cows', 'safe for cows', 'should i use this', 'is the feed safe', 'silage okay', 'silage ready', 'खिला', 'सुरक्षित', 'ಕೊಡಬಹುದೇ', 'ಸುರಕ್ಷಿತ'],
  },
  {
    id: 'quality-result',
    category: 'general',
    patterns: ['what is the quality', 'silage quality', 'is the silage good', 'what does this score mean', 'quality score', 'how do i know if silage is good', 'good silage', 'ಗುಣಮಟ್ಟ', 'ಗುಣಮಟ್ಟ ಹೇಗಿದೆ', 'गुणवत्ता', 'अच्छा साइलेज'],
  },
  {
    id: 'quality-low',
    category: 'general',
    patterns: ['why is the quality low', 'what is wrong with my silage', 'poor silage', 'why is it showing red', 'why is my score low', 'ಗುಣಮಟ್ಟ ಕಡಿಮೆ', 'क्या खराब है'],
  },
  {
    id: 'fermentation',
    category: 'general',
    patterns: ['what is fermentation', 'good fermentation', 'why does fermentation', 'fermentation mean', 'ಹುದುಗುವಿಕೆ', 'किण्वन'],
  },
  {
    id: 'sour-smell',
    category: 'spoilage',
    patterns: ['smell sour', 'sour smell', 'acid smell', 'ಹುಳಿ ವಾಸನೆ', 'खट्टी गंध'],
  },
  {
    id: 'alcohol-smell',
    category: 'spoilage',
    patterns: ['smell alcoholic', 'alcohol smell', 'yeasty smell', 'ಮದ್ಯದ ವಾಸನೆ', 'शराब जैसी गंध'],
  },
  {
    id: 'rotten-smell',
    category: 'spoilage',
    patterns: ['smell rotten', 'rotten smell', 'bad smell', 'foul smell', 'ಕೊಳೆತ ವಾಸನೆ', 'सड़ी गंध'],
  },
  {
    id: 'heating',
    category: 'spoilage',
    patterns: ['why is silage heating', 'silage is heating', 'why is it hot', 'heating after opening', 'ಸೈಲೇಜ್ ಬಿಸಿಯಾಗುತ್ತಿದೆ', 'गर्म हो रहा'],
  },
  {
    id: 'discoloration',
    category: 'general',
    patterns: ['changing colour', 'changing color', 'colour change', 'color change', 'brown silage', 'black silage', 'texture', 'ಬಣ್ಣ ಬದಲಾಗುತ್ತಿದೆ', 'रंग बदलना', 'बनावट'],
  },
  {
    id: 'mould',
    category: 'spoilage',
    patterns: ['mould', 'mold', 'mouldy', 'moldy', 'fungus', 'safe with mould', 'safe with mold', 'ಅಚ್ಚು', 'फफूंदी'],
  },
  {
    id: 'air-exposure',
    category: 'storage',
    patterns: ['exposed to air', 'air exposure', 'oxygen', 'opened silage', 'after opening', 'ಗಾಳಿಗೆ', 'हवा लगने'],
  },
  {
    id: 'opened-management',
    category: 'storage',
    patterns: ['how should opened silage be managed', 'manage opened', 'face of the clamp', 'remove silage daily', 'ತೆರೆದ ಸೈಲೇಜ್', 'खुला साइलेज'],
  },
  {
    id: 'ph-value',
    category: 'ph',
    patterns: ['what is the ph', 'tell me the ph', 'ph reading', 'current ph', 'p h', 'ಪಿಎಚ್', 'पीएच'],
  },
  {
    id: 'ph-importance',
    category: 'ph',
    patterns: ['why is ph important', 'why ph matters', 'ph mean', 'pH importance', 'ಪಿಎಚ್ ಏಕೆ', 'पीएच क्यों'],
  },
  {
    id: 'ph-high',
    category: 'ph',
    patterns: ['ph too high', 'high ph', 'ph normal', 'ph good', 'ph okay', 'pH normal', 'ಪಿಎಚ್ ಹೆಚ್ಚಾಗಿದೆ', 'पीएच ज्यादा'],
  },
  {
    id: 'ph-low',
    category: 'ph',
    patterns: ['ph too low', 'low ph', 'very low ph', 'ಪಿಎಚ್ ಕಡಿಮೆ', 'पीएच कम'],
  },
  {
    id: 'moisture-high',
    category: 'moisture',
    patterns: ['moisture high', 'moisture too high', 'very wet', 'wet silage', 'too wet', 'ತೇವಾಂಶ ಹೆಚ್ಚು', 'ತುಂಬಾ ಒದ್ದೆ', 'नमी अधिक', 'बहुत गीला'],
  },
  {
    id: 'moisture-low',
    category: 'moisture',
    patterns: ['moisture low', 'moisture too low', 'very dry', 'dry silage', 'too dry', 'ತೇವಾಂಶ ಕಡಿಮೆ', 'ತುಂಬಾ ಒಣ', 'नमी कम', 'बहुत सूखा'],
  },
  {
    id: 'moisture-value',
    category: 'moisture',
    patterns: ['what is the moisture', 'moisture level', 'moisture reading', 'current moisture', 'ತೇವಾಂಶ ಎಷ್ಟು', 'नमी कितनी'],
  },
  {
    id: 'dry-matter',
    category: 'moisture',
    patterns: ['what is dry matter', 'dry matter', 'how does moisture affect fermentation', 'how does moisture affect storage', 'ಒಣ ಪದಾರ್ಥ', 'सूखा पदार्थ'],
  },
  {
    id: 'temperature',
    category: 'temperature',
    patterns: ['what is the temperature', 'temperature reading', 'why is temperature important', 'temperature high', 'silage temperature', 'ತಾಪಮಾನ ಎಷ್ಟು', 'तापमान कितना'],
  },
  {
    id: 'voc',
    category: 'voc',
    patterns: ['what is the voc', 'voc reading', 'what does voc mean', 'odour indicator', 'odor indicator', 'ವಿಓಸಿ', 'गंध संकेतक'],
  },
  {
    id: 'nir',
    category: 'nir',
    patterns: ['what does nir tell me', 'nir reading', 'nutritional indicators', 'nir mean', 'what is nir', 'ಎನ್ಐಆರ್', 'पोषण संकेतक'],
  },
  {
    id: 'contamination',
    category: 'spoilage',
    patterns: ['contamination', 'dirty silage', 'soil in silage', 'animal waste', 'foreign material', 'ಮಾಲಿನ್ಯ', 'गंदगी', 'दूषित'],
  },
  {
    id: 'risk',
    category: 'spoilage',
    patterns: ['spoilage risk', 'deterioration risk', 'risk high', 'why is the risk', 'why is spoilage', 'what causes the high risk', 'reduce the risk', 'how can i reduce', 'monitor it again', 'ಅಪಾಯ', 'ಹಾಳಾಗುವ', 'जोखिम', 'खराब होने'],
  },
  {
    id: 'retest',
    category: 'spoilage',
    patterns: ['should i retest', 'retest', 'test again', 'monitor again', 'ಮತ್ತೆ ಪರೀಕ್ಷೆ', 'फिर जांच'],
  },
  {
    id: 'feeding',
    category: 'feeding',
    patterns: ['what should i feed', 'what should i feed today', 'adjust the ration', 'reduce this silage', 'suitable for my cows', 'what should i monitor after feeding', 'what should i watch while feeding', 'watch while feeding', 'feed today', 'ಆಹಾರ', 'ರೇಷನ್', 'ಆಹಾರ ನೀಡುವಾಗ ಗಮನ', 'आज क्या खिलाऊं', 'खिलाते समय क्या देखें', 'राशन'],
  },
  {
    id: 'milk-impact',
    category: 'milk',
    patterns: ['predicted milk impact', 'affect milk quality', 'milk quality', 'milk prediction', 'predicted milk', 'what should i watch in milk', 'watch in milk', 'milk follow up', 'ಹಾಲಿನ ಪರಿಣಾಮ', 'ಹಾಲಿನಲ್ಲಿ ಗಮನ', 'दूध पर असर', 'दूध में क्या देखें'],
  },
  {
    id: 'milk-indicators',
    category: 'milk',
    patterns: ['milk fat', 'milk protein', 'fat and protein', 'predicted fat', 'predicted protein', 'ಕೊಬ್ಬು', 'ಪ್ರೋಟೀನ್', 'वसा', 'प्रोटीन'],
  },
  {
    id: 'milk-confidence',
    category: 'milk',
    patterns: ['how confident', 'confidence', 'why uncertainty', 'uncertainty', 'विश्वास', 'ಅನಿಶ್ಚಿತತೆ'],
  },
  {
    id: 'history-last',
    category: 'history',
    patterns: ['last test', 'latest test', 'previous test', 'show my previous', 'recent test', 'ಕೊನೆಯ ಪರೀಕ್ಷೆ', 'पिछली जांच'],
  },
  {
    id: 'history-trend',
    category: 'history',
    patterns: ['quality improved', 'recent trend', 'what changed', 'compare with previous', 'trend', 'ಇತಿಹಾಸ', 'ಸುಧಾರಿಸಿದೆ', 'रुझान', 'सुधार'],
  },
  {
    id: 'profile',
    category: 'profile',
    patterns: ['farm name', 'my farm', 'what breed', 'breed are', 'milk yield', 'current milk yield', 'what ration', 'current ration', 'where is my farm', 'ನನ್ನ ಕೃಷಿ', 'ತಳಿ', 'ಹಾಲಿನ ಉತ್ಪಾದನೆ', 'ಆಹಾರ ಮಿಶ್ರಣ', 'खेत का नाम', 'नस्ल', 'दूध उत्पादन', 'राशन'],
  },
  {
    id: 'device',
    category: 'device',
    patterns: ['device connected', 'device connect', 'what sensors', 'how does esp32', 'hardware connect', 'live hardware', 'real hardware', 'real sensor readings', 'are these real', 'simulated readings', 'demo readings', 'is this simulated', 'sensors does nexora use', 'ಎಸ್ಪಿ೩೨', 'ಸಾಧನ ಸಂಪರ್ಕ', 'ನಿಜವಾದ ಓದು', 'ಡೆಮೊ ಓದು', 'सेंसर', 'हार्डवेयर', 'असली रीडिंग', 'सिमुलेटेड रीडिंग', 'डेमो रीडिंग'],
  },
  {
    id: 'nexora',
    category: 'general',
    patterns: ['what is nexora', 'how does nexora work', 'why multiple sensors', 'help farmers', 'replace farmers', 'feedback loop', 'ನಿಕ್ಸೋರಾ', 'किसानों की मदद'],
  },
];

const text = {
  en: {
    unknown: 'I can help with your current silage test, sensor readings, spoilage risk, feeding recommendation, milk-quality estimate, history, profile, or NEXORA device. Could you rephrase your question?',
    quality: ({ c }: Values) => `Your current prototype result is ${c.quality} at ${c.score}/100, with ${c.risk} spoilage risk. This is decision support from the entered ${c.mode} readings, not a laboratory grade or a guarantee. Review the contributing readings before deciding how to feed.`,
    qualityLow: ({ c }: Values) => `The current score is ${c.score}/100 (${c.quality}) and the deterioration risk is ${c.risk}. The main signals are ${c.reasons}. The prototype suggests: ${c.recommendation}. Check smell, colour, texture, storage face and animal response with an experienced adviser.`,
    fermentation: () => 'Good fermentation means beneficial acids have preserved the crop in a mostly oxygen-free environment. In practice, look for a stable sample, a clean pleasantly acidic smell, no heating after opening, and no visible mould. The exact result depends on crop, dry matter, packing and storage.',
    sourSmell: () => 'A clean, pleasantly sour smell can be consistent with acid fermentation. A sharp or unusual smell should not be judged by smell alone—also check heating, colour, texture, pH, moisture and visible contamination.',
    alcoholSmell: () => 'An alcoholic or yeasty smell can suggest yeast activity and air exposure. Treat it as a warning to inspect heating, dry matter, storage seals and the exposed face before feeding decisions.',
    rottenSmell: () => 'A rotten, putrid or strongly foul smell is an attention signal. Isolate the questionable portion, inspect for contamination and heating, and avoid feeding visibly spoiled material until an experienced adviser has assessed it.',
    heating: ({ c }: Values) => `The current temperature reading is ${c.temperature}°C. Heating after opening can indicate oxygen-driven deterioration, especially when the exposed face is loose or removal is slow. This prototype flags ${c.temperatureStatus}; check the face, seal and daily removal rate.`,
    discoloration: () => 'Colour and texture are supporting observations, not a stand-alone laboratory test. Unexpected darkening, sliminess, excessive dryness or a patchy change should prompt inspection for air exposure, heating, contamination and mould.',
    mould: () => 'Visible mould is not something to normalize by mixing through the ration. Keep visibly mouldy or suspect material away from animals, investigate the affected area and ask a qualified local adviser about safe disposal and replacement feed.',
    airExposure: () => 'Air allows yeasts and other organisms to use the stored feed and can raise heating and deterioration risk. Keep the face tight and clean, minimize the exposed area, remove material evenly, and reseal damaged covers promptly.',
    openedManagement: () => 'After opening, keep the face compact and tidy, remove a consistent amount each day, avoid leaving loose material exposed, and watch for heat, smell, mould or colour change. Use the current sensor result as one input—not as the only feeding decision.',
    phValue: ({ c }: Values) => `The current pH reading is ${c.ph}. In this prototype it is an approximate fermentation indicator. A common reference window around 3.8–4.5 is shown only as guidance for many grass or maize silages; crop, dry matter, fermentation and storage can shift the expected value. The current visual band is ${c.phStatus}.`,
    phImportance: () => 'pH is one clue about acidification during fermentation. It should be interpreted with crop type, dry matter, smell, temperature, moisture, packing and storage history. A single pH value is not universally safe or unsafe.',
    phHigh: ({ c }: Values) => `The current pH is ${c.ph}, and the prototype band is ${c.phStatus}. A higher-than-expected pH can mean fermentation was incomplete or the crop had different dry matter or buffering. Compare it with smell, heating, moisture and storage conditions before feeding.`,
    phLow: ({ c }: Values) => `The current pH is ${c.ph}. A lower value can reflect strong acidification, but low pH is not automatically proof of quality. Consider crop, dry matter, smell, texture and animal response; this app does not treat one number as a universal safety limit.`,
    moistureValue: ({ c }: Values) => `The current moisture is ${c.moisture}%, which corresponds to an approximate dry matter of ${c.dryMatter}%. The prototype visual band is ${c.moistureStatus}. Moisture interpretation depends on crop and storage, so use this as a screening clue.`,
    moistureHigh: ({ c }: Values) => `The current moisture is ${c.moisture}%. Very wet material can increase seepage, nutrient loss and unstable fermentation risk. This prototype flags ${c.moistureStatus}; review dry matter, smell, storage drainage and pH rather than using this value alone.`,
    moistureLow: ({ c }: Values) => `The current moisture is ${c.moisture}%. Very dry material can be harder to pack and may leave more oxygen in the mass. This prototype flags ${c.moistureStatus}; inspect packing, texture, storage face and actual intake.`,
    dryMatter: ({ c }: Values) => `Dry matter is the portion left after water is removed. With the current moisture of ${c.moisture}%, the approximate dry matter is ${c.dryMatter}%. This is a prototype calculation; crop type, harvest stage and lab method affect the useful reference range.`,
    moistureStorage: () => 'Moisture affects packing, fermentation and storage stability. Too wet can increase effluent and nutrient loss; too dry can make packing difficult and leave oxygen pockets. Use crop-aware guidance and inspect the actual clamp or bag condition.',
    temperature: ({ c }: Values) => `The current temperature is ${c.temperature}°C and the prototype band is ${c.temperatureStatus}. Temperature is useful for spotting heating or oxygen exposure, but it should be compared with ambient conditions, sampling location and the temperature of a fresh sample.`,
    voc: ({ c }: Values) => `The current VOC index is ${c.voc}, with a prototype band of ${c.vocStatus}. VOC is an odour-related screening signal, not a direct diagnosis of every compound or toxin. Use it with smell, temperature, visible condition and storage history.`,
    nir: ({ c }: Values) => `The current NIR estimate is ${c.nir}, shown as a prototype nutritional/compositional indicator with a ${c.nirStatus} band. NIR does not directly measure every silage parameter; confirm important nutritional decisions with validated feed analysis where available.`,
    contamination: () => 'Soil, manure, chemicals, dead animals or other foreign material can make feed unsafe or unpredictable. Separate the suspect portion, do not dilute contamination into the ration, and seek local veterinary or feed-specialist advice.',
    risk: ({ c }: Values) => `The current spoilage/deterioration risk is ${c.risk}. Contributing signals are ${c.reasons}. The prototype recommendation is ${c.recommendation}. Check the exposed face, storage seal, smell, heating and animal response, and retest when conditions change.`,
    reduceRisk: () => 'Reduce deterioration risk by limiting air exposure, keeping the face compact, removing feed evenly, avoiding loose leftovers, repairing covers, and separating suspect material. Retest after a meaningful storage or handling change.',
    retest: ({ c }: Values) => `Retesting is useful if the sample changes, the face has heated, storage was opened, or the feeding decision is uncertain. The current prototype result is ${c.score}/100 with ${c.risk} risk; treat that as a screening signal and compare it with field observations.`,
    feeding: ({ c }: Values) => `For ${c.farm}, the current prototype recommendation is ${c.recommendation}. The current ration is ${c.ration}. Use the silage result alongside breed, lactation stage, milk yield, intake, manure and animal health. NEXORA supports an experienced farmer; it does not prescribe a guaranteed ration.`,
    monitor: () => 'After feeding, monitor intake, sorting, manure consistency, cud chewing, cow comfort, milk yield and any unusual smell or heating in the feed. Compare actual observations with the estimate over several days.',
    milkImpact: ({ c }: Values) => `The directional milk estimate is ${c.milkEstimate} kg/cow/day with ${c.confidence} confidence. This is based on the current feed and farm context; it is not a guaranteed causal prediction of milk quality or animal health.`,
    milkIndicators: ({ c }: Values) => `NEXORA does not measure milk fat or protein directly in this prototype. The current directional estimate is ${c.milkEstimate} kg/cow/day with ${c.confidence} confidence. Confirm fat, protein and yield using actual milk records or validated testing.`,
    milkConfidence: ({ c }: Values) => `Confidence is ${c.confidence} because the prototype uses simulated or manually entered readings and limited farm history. Uncertainty also comes from crop, ration, health, weather, sampling and storage variation. Compare the estimate with actual records.`,
    historyLast: ({ c }: Values) => c.lastTest ? `The latest saved test is ${c.lastTest.sampleId} from ${c.lastTest.farm}. It scored ${c.lastTest.score}/100 with ${c.lastTest.risk} spoilage risk. Its readings were pH ${c.lastTest.ph}, moisture ${c.lastTest.moisture}%, temperature ${c.lastTest.temperature}°C, VOC ${c.lastTest.voc} and NIR ${c.lastTest.nir}.` : 'There is no saved test yet. Run and save a silage test to build local history.',
    historyTrend: ({ c }: Values) => c.previousTest ? `Compared with the previous saved sample, the current score changed from ${c.previousTest.score} to ${c.score}/100. Moisture changed from ${c.previousTest.moisture}% to ${c.moisture}%, and pH changed from ${c.previousTest.ph} to ${c.ph}. This is a local trend, not a validated farm-performance claim.` : 'Only one saved test is available, so a trend cannot be established yet. Save another test using comparable sampling conditions.',
    profile: ({ c }: Values) => `Your current farm profile is ${c.farm} in ${c.location}. The animals are listed as ${c.breed}, at ${c.lactation}, with an average yield of ${c.yield} and the ration “${c.ration}”.`,
    device: () => 'NEXORA currently uses clearly labelled demo or manual readings. The planned architecture is camera and sensing modules into an ESP32, then the NEXORA app and prototype analysis. The current app is not receiving live ESP32 hardware data.',
    nexora: () => 'NEXORA is a decision-support prototype that combines silage observations and sensor-style inputs with farm context. It helps an experienced farmer compare quality signals, feeding options and later milk records; it does not replace the farmer or guarantee an outcome.',
  },
  kn: {
    unknown: 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸೈಲೇಜ್ ಪರೀಕ್ಷೆ, ಸೆನ್ಸರ್ ಓದುಗಳು, ಹಾಳಾಗುವ ಅಪಾಯ, ಆಹಾರ ಶಿಫಾರಸು, ಹಾಲಿನ ಅಂದಾಜು, ಇತಿಹಾಸ, ಪ್ರೊಫೈಲ್ ಅಥವಾ NEXORA ಸಾಧನದ ಬಗ್ಗೆ ನಾನು ಸಹಾಯ ಮಾಡಬಹುದು. ದಯವಿಟ್ಟು ಪ್ರಶ್ನೆಯನ್ನು ಮತ್ತೊಮ್ಮೆ ಸರಳವಾಗಿ ಕೇಳಿ.',
    quality: ({ c }: Values) => `ಪ್ರಸ್ತುತ ಪ್ರೋಟೋಟೈಪ್ ಫಲಿತಾಂಶ ${c.score}/100 ಸ್ಕೋರ್ ಮತ್ತು ${c.risk} ಹಾಳಾಗುವ ಅಪಾಯವನ್ನು ತೋರಿಸುತ್ತದೆ. ಇದು ನಮೂದಿಸಿದ ${c.mode} ಓದುಗಳ ಆಧಾರದ ನಿರ್ಧಾರ ಸಹಾಯ ಮಾತ್ರ; ಪ್ರಯೋಗಾಲಯದ ಪ್ರಮಾಣ ಅಥವಾ ಖಾತರಿ ಅಲ್ಲ.`,
    qualityLow: ({ c }: Values) => `ಪ್ರಸ್ತುತ ಸ್ಕೋರ್ ${c.score}/100 ಮತ್ತು ಗುಣಮಟ್ಟ ${c.quality}. ಹಾಳಾಗುವ ಅಪಾಯ ${c.risk}; ಮುಖ್ಯ ಸೂಚಕಗಳು ${c.reasons}. ಪ್ರೋಟೋಟೈಪ್ ಸಲಹೆ: ${c.recommendation}. ವಾಸನೆ, ಬಣ್ಣ, ರಚನೆ, ಸಂಗ್ರಹದ ಮುಖ ಮತ್ತು ಪ್ರಾಣಿಗಳ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನೂ ಪರಿಶೀಲಿಸಿ.`,
    fermentation: () => 'ಉತ್ತಮ ಹುದುಗುವಿಕೆ ಎಂದರೆ ಗಾಳಿಯಿಲ್ಲದ ಪರಿಸರದಲ್ಲಿ ಉಪಯುಕ್ತ ಆಮ್ಲಗಳು ಬೆಳೆವನ್ನು ಸಂರಕ್ಷಿಸುವುದು. ಸ್ವಚ್ಛವಾದ ಸೌಮ್ಯ ಹುಳಿ ವಾಸನೆ, ಬಿಸಿ ಆಗದಿರುವುದು ಮತ್ತು ಅಚ್ಚು ಇಲ್ಲದಿರುವುದು ಸಹಾಯಕ ಸೂಚನೆಗಳು. ಬೆಳೆ, ಒಣ ಪದಾರ್ಥ, ಒತ್ತುವಿಕೆ ಮತ್ತು ಸಂಗ್ರಹವೂ ಮುಖ್ಯ.',
    sourSmell: () => 'ಸ್ವಚ್ಛವಾದ ಸೌಮ್ಯ ಹುಳಿ ವಾಸನೆ ಆಮ್ಲ ಹುದುಗುವಿಕೆಯ ಸೂಚನೆಯಾಗಿರಬಹುದು. ಆದರೆ ವಾಸನೆ ಮಾತ್ರದಿಂದ ನಿರ್ಧರಿಸಬೇಡಿ; ಬಿಸಿ, ಬಣ್ಣ, ರಚನೆ, pH, ತೇವಾಂಶ ಮತ್ತು ಮಾಲಿನ್ಯವನ್ನೂ ಪರಿಶೀಲಿಸಿ.',
    alcoholicSmell: () => 'ಮದ್ಯದ ಅಥವಾ ಈಸ್ಟ್ ವಾಸನೆ ಈಸ್ಟ್ ಚಟುವಟಿಕೆ ಅಥವಾ ಗಾಳಿಯ ಸಂಪರ್ಕದ ಸೂಚನೆಯಾಗಿರಬಹುದು. ಬಿಸಿ, ಒಣ ಪದಾರ್ಥ, ಮುಚ್ಚಳ ಮತ್ತು ತೆರೆದ ಭಾಗವನ್ನು ಪರಿಶೀಲಿಸಿ.',
    rottenSmell: () => 'ಕೊಳೆತ ಅಥವಾ ತೀವ್ರ ದುರ್ವಾಸನೆ ಗಮನಿಸಬೇಕಾದ ಸೂಚನೆ. ಅನುಮಾನಾಸ್ಪದ ಭಾಗವನ್ನು ಬೇರ್ಪಡಿಸಿ, ಮಾಲಿನ್ಯ ಮತ್ತು ಬಿಸಿಯಾಗುವಿಕೆಯನ್ನು ಪರಿಶೀಲಿಸಿ, ತಜ್ಞರ ಸಲಹೆ ಇಲ್ಲದೆ ಪ್ರಾಣಿಗಳಿಗೆ ನೀಡಬೇಡಿ.',
    heating: ({ c }: Values) => `ಪ್ರಸ್ತುತ ತಾಪಮಾನ ${c.temperature}°C ಮತ್ತು ಪ್ರೋಟೋಟೈಪ್ ಸ್ಥಿತಿ ${c.temperatureStatus}. ತೆರೆದ ನಂತರ ಬಿಸಿಯಾಗುವುದು ಗಾಳಿಯಿಂದ ಹಾಳಾಗುವಿಕೆಯ ಸೂಚನೆಯಾಗಿರಬಹುದು. ಮುಖ, ಮುಚ್ಚಳ ಮತ್ತು ದಿನನಿತ್ಯದ ತೆಗೆಯುವ ಪ್ರಮಾಣ ಪರಿಶೀಲಿಸಿ.`,
    discoloration: () => 'ಬಣ್ಣ ಮತ್ತು ರಚನೆ ಸಹಾಯಕ ವೀಕ್ಷಣೆಗಳು ಮಾತ್ರ. ಅಸಾಮಾನ್ಯ ಕಪ್ಪಾಗುವಿಕೆ, ಜಿಗುಟುತನ ಅಥವಾ ಒಣಗುವಿಕೆ ಗಾಳಿಯ ಸಂಪರ್ಕ, ಬಿಸಿ, ಮಾಲಿನ್ಯ ಅಥವಾ ಅಚ್ಚಿನ ಸೂಚನೆಯಾಗಿರಬಹುದು.',
    mould: () => 'ಕಾಣುವ ಅಚ್ಚನ್ನು ಆಹಾರದಲ್ಲಿ ಮಿಶ್ರಣಿಸಿ ಸಾಮಾನ್ಯಗೊಳಿಸಬೇಡಿ. ಅನುಮಾನಾಸ್ಪದ ಭಾಗವನ್ನು ಪ್ರಾಣಿಗಳಿಂದ ದೂರವಿಟ್ಟು, ಸುರಕ್ಷಿತ ವಿಲೇವಾರಿ ಮತ್ತು ಬದಲಿ ಆಹಾರಕ್ಕಾಗಿ ಸ್ಥಳೀಯ ತಜ್ಞರನ್ನು ಕೇಳಿ.',
    airExposure: () => 'ಗಾಳಿಯ ಸಂಪರ್ಕದಿಂದ ಈಸ್ಟ್ ಮತ್ತು ಇತರ ಜೀವಿಗಳು ಆಹಾರವನ್ನು ಹಾಳುಮಾಡಬಹುದು. ತೆರೆದ ಮುಖವನ್ನು ಬಿಗಿಯಾಗಿ ಮತ್ತು ಸ್ವಚ್ಛವಾಗಿ ಇಡಿ, ಸಮವಾಗಿ ತೆಗೆದು, ಮುಚ್ಚಳದ ಹಾನಿಯನ್ನು ಸರಿಪಡಿಸಿ.',
    openedManagement: () => 'ತೆರೆದ ನಂತರ ಮುಖವನ್ನು ಒತ್ತಾಗಿ ಮತ್ತು ಸ್ವಚ್ಛವಾಗಿ ಇಡಿ, ಪ್ರತಿದಿನ ಸಮ ಪ್ರಮಾಣ ತೆಗೆದು, ಸಡಿಲ ಆಹಾರವನ್ನು ತೆರೆದಿಡಬೇಡಿ. ಬಿಸಿ, ವಾಸನೆ, ಅಚ್ಚು ಮತ್ತು ಬಣ್ಣ ಬದಲಾವಣೆಯನ್ನು ಗಮನಿಸಿ.',
    phValue: ({ c }: Values) => `ಪ್ರಸ್ತುತ pH ${c.ph}. ಇಲ್ಲಿ ಇದು ಹುದುಗುವಿಕೆಯ ಅಂದಾಜು ಸೂಚಕ ಮಾತ್ರ. 3.8–4.5 ಸಾಮಾನ್ಯ ಮಾರ್ಗದರ್ಶಿ ವ್ಯಾಪ್ತಿಯಾಗಿರಬಹುದು, ಆದರೆ ಬೆಳೆ, ಒಣ ಪದಾರ್ಥ, ಪ್ರಕ್ರಿಯೆ ಮತ್ತು ಸಂಗ್ರಹದಿಂದ ಮೌಲ್ಯ ಬದಲಾಗುತ್ತದೆ. ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ ${c.phStatus}.`,
    phImportance: () => 'pH ಹುದುಗುವಿಕೆಯ ಸಮಯದ ಆಮ್ಲೀಕರಣದ ಒಂದು ಸೂಚನೆ. ಬೆಳೆ, ಒಣ ಪದಾರ್ಥ, ವಾಸನೆ, ತಾಪಮಾನ, ತೇವಾಂಶ, ಒತ್ತುವಿಕೆ ಮತ್ತು ಸಂಗ್ರಹದೊಂದಿಗೆ ಅರ್ಥೈಸಬೇಕು. ಒಂದೇ pH ಮೌಲ್ಯ ಸಾರ್ವತ್ರಿಕ ಸುರಕ್ಷತಾ ಮಿತಿ ಅಲ್ಲ.',
    phHigh: ({ c }: Values) => `ಪ್ರಸ್ತುತ pH ${c.ph}, ಪ್ರೋಟೋಟೈಪ್ ಸ್ಥಿತಿ ${c.phStatus}. ಹೆಚ್ಚು pH ಅಪೂರ್ಣ ಹುದುಗುವಿಕೆ ಅಥವಾ ಬೇರೆ ಒಣ ಪದಾರ್ಥದ ಸೂಚನೆಯಾಗಿರಬಹುದು. ಆಹಾರ ನಿರ್ಧಾರಕ್ಕೂ ಮೊದಲು ವಾಸನೆ, ಬಿಸಿ, ತೇವಾಂಶ ಮತ್ತು ಸಂಗ್ರಹ ಪರಿಶೀಲಿಸಿ.`,
    phLow: ({ c }: Values) => `ಪ್ರಸ್ತುತ pH ${c.ph}. ಕಡಿಮೆ ಮೌಲ್ಯ ಬಲವಾದ ಆಮ್ಲೀಕರಣವನ್ನು ಸೂಚಿಸಬಹುದು, ಆದರೆ ಕಡಿಮೆ pH ಮಾತ್ರ ಗುಣಮಟ್ಟದ ಖಾತರಿ ಅಲ್ಲ. ಬೆಳೆ, ಒಣ ಪದಾರ್ಥ, ವಾಸನೆ, ರಚನೆ ಮತ್ತು ಪ್ರಾಣಿಗಳ ಪ್ರತಿಕ್ರಿಯೆ ಪರಿಶೀಲಿಸಿ.`,
    moistureValue: ({ c }: Values) => `ಪ್ರಸ್ತುತ ತೇವಾಂಶ ${c.moisture}%, ಅಂದಾಜು ಒಣ ಪದಾರ್ಥ ${c.dryMatter}%. ಪ್ರೋಟೋಟೈಪ್ ಸ್ಥಿತಿ ${c.moistureStatus}. ಬೆಳೆ ಮತ್ತು ಸಂಗ್ರಹದ ಮೇಲೆ ಅರ್ಥ ಬದಲಾಗುತ್ತದೆ.`,
    moistureHigh: ({ c }: Values) => `ಪ್ರಸ್ತುತ ತೇವಾಂಶ ${c.moisture}%. ತುಂಬಾ ಒದ್ದೆಯಾದ ಆಹಾರದಲ್ಲಿ ಸೋರಿಕೆ, ಪೋಷಕಾಂಶ ನಷ್ಟ ಮತ್ತು ಅಸ್ಥಿರ ಹುದುಗುವಿಕೆಯ ಅಪಾಯ ಇರಬಹುದು. ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ ${c.moistureStatus}; ಒಣ ಪದಾರ್ಥ, ವಾಸನೆ, ಒಳಚರಂಡಿ ಮತ್ತು pH ಪರಿಶೀಲಿಸಿ.`,
    moistureLow: ({ c }: Values) => `ಪ್ರಸ್ತುತ ತೇವಾಂಶ ${c.moisture}%. ತುಂಬಾ ಒಣ ಆಹಾರವನ್ನು ಒತ್ತುವುದು ಕಷ್ಟವಾಗಬಹುದು ಮತ್ತು ಗಾಳಿ ಉಳಿಯಬಹುದು. ಸ್ಥಿತಿ ${c.moistureStatus}; ಒತ್ತುವಿಕೆ, ರಚನೆ ಮತ್ತು ಸೇವನೆ ಗಮನಿಸಿ.`,
    dryMatter: ({ c }: Values) => `ಒಣ ಪದಾರ್ಥ ಎಂದರೆ ನೀರನ್ನು ತೆಗೆದ ನಂತರ ಉಳಿಯುವ ಭಾಗ. ${c.moisture}% ತೇವಾಂಶದಲ್ಲಿ ಅಂದಾಜು ಒಣ ಪದಾರ್ಥ ${c.dryMatter}%. ಇದು ಪ್ರೋಟೋಟೈಪ್ ಲೆಕ್ಕಾಚಾರ ಮಾತ್ರ; ಬೆಳೆ ಮತ್ತು ಪ್ರಯೋಗಾಲಯ ವಿಧಾನವೂ ಮುಖ್ಯ.`,
    moistureStorage: () => 'ತೇವಾಂಶ ಒತ್ತುವಿಕೆ, ಹುದುಗುವಿಕೆ ಮತ್ತು ಸಂಗ್ರಹ ಸ್ಥಿರತೆಯ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರುತ್ತದೆ. ಹೆಚ್ಚು ತೇವಾಂಶ ಸೋರಿಕೆ ತರಬಹುದು; ಕಡಿಮೆ ತೇವಾಂಶದಲ್ಲಿ ಒತ್ತುವಿಕೆ ಕಷ್ಟವಾಗಬಹುದು. ವಾಸ್ತವ ಸಂಗ್ರಹ ಸ್ಥಿತಿಯನ್ನೂ ಪರಿಶೀಲಿಸಿ.',
    temperature: ({ c }: Values) => `ಪ್ರಸ್ತುತ ತಾಪಮಾನ ${c.temperature}°C ಮತ್ತು ಪ್ರೋಟೋಟೈಪ್ ಸ್ಥಿತಿ ${c.temperatureStatus}. ಸುತ್ತಮುತ್ತಲಿನ ತಾಪಮಾನ, ಮಾದರಿ ಸ್ಥಳ ಮತ್ತು ಹೊಸ ಮಾದರಿಯೊಂದಿಗೆ ಹೋಲಿಸಿ.`,
    voc: ({ c }: Values) => `ಪ್ರಸ್ತುತ VOC ಸೂಚ್ಯಂಕ ${c.voc}, ಪ್ರೋಟೋಟೈಪ್ ಸ್ಥಿತಿ ${c.vocStatus}. VOC ಎಲ್ಲಾ ಸಂಯುಕ್ತಗಳು ಅಥವಾ ವಿಷಗಳನ್ನು ನೇರವಾಗಿ ಅಳೆಯುವುದಿಲ್ಲ; ವಾಸನೆ, ತಾಪಮಾನ ಮತ್ತು ಸಂಗ್ರಹದೊಂದಿಗೆ ನೋಡಿ.`,
    nir: ({ c }: Values) => `ಪ್ರಸ್ತುತ NIR ಅಂದಾಜು ${c.nir}, ಪೋಷಕಾಂಶ ಸೂಚಕದ ಪ್ರೋಟೋಟೈಪ್ ಸ್ಥಿತಿ ${c.nirStatus}. NIR ಎಲ್ಲ ಸೈಲೇಜ್ ಪರಿಮಾಣಗಳನ್ನು ನೇರವಾಗಿ ಅಳೆಯುವುದಿಲ್ಲ; ಲಭ್ಯವಿದ್ದರೆ ಪರಿಶೀಲಿತ ಆಹಾರ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಬಳಸಿ.`,
    contamination: () => 'ಮಣ್ಣು, ಗೊಬ್ಬರ, ರಾಸಾಯನಿಕ ಅಥವಾ ಇತರ ವಸ್ತುಗಳ ಮಾಲಿನ್ಯ ಆಹಾರವನ್ನು ಅಸುರಕ್ಷಿತಗೊಳಿಸಬಹುದು. ಅನುಮಾನಾಸ್ಪದ ಭಾಗವನ್ನು ಬೇರ್ಪಡಿಸಿ ಮತ್ತು ಸ್ಥಳೀಯ ಪಶುವೈದ್ಯರು ಅಥವಾ ಆಹಾರ ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ.',
    risk: ({ c }: Values) => `ಪ್ರಸ್ತುತ ಹಾಳಾಗುವ ಅಪಾಯ ${c.risk}. ಕಾರಣವಾಗಿರುವ ಸೂಚಕಗಳು ${c.reasons}. ಪ್ರೋಟೋಟೈಪ್ ಶಿಫಾರಸು ${c.recommendation}. ಮುಖ, ಮುಚ್ಚಳ, ವಾಸನೆ, ಬಿಸಿ ಮತ್ತು ಪ್ರಾಣಿಗಳ ಪ್ರತಿಕ್ರಿಯೆ ಪರಿಶೀಲಿಸಿ.`,
    reduceRisk: () => 'ಗಾಳಿಯ ಸಂಪರ್ಕ ಕಡಿಮೆ ಮಾಡಿ, ಮುಖವನ್ನು ಒತ್ತಾಗಿ ಇಡಿ, ಸಮವಾಗಿ ತೆಗೆದು, ಸಡಿಲ ಉಳಿಕೆಯನ್ನು ಬಿಡಬೇಡಿ ಮತ್ತು ಮುಚ್ಚಳ ಸರಿಪಡಿಸಿ. ಸ್ಥಿತಿ ಬದಲಾದ ನಂತರ ಮತ್ತೆ ಪರೀಕ್ಷಿಸಿ.',
    retest: ({ c }: Values) => `ಮಾದರಿ ಬದಲಾಗಿದ್ದರೆ, ಮುಖ ಬಿಸಿಯಾಗಿದ್ದರೆ ಅಥವಾ ಆಹಾರ ನಿರ್ಧಾರ ಸ್ಪಷ್ಟವಾಗದಿದ್ದರೆ ಮತ್ತೆ ಪರೀಕ್ಷಿಸಿ. ಪ್ರಸ್ತುತ ಸ್ಕೋರ್ ${c.score}/100 ಮತ್ತು ಅಪಾಯ ${c.risk}; ಇದನ್ನು ಪರಿಶೀಲನಾ ಸೂಚನೆಯಾಗಿ ಮಾತ್ರ ಬಳಸಿ.`,
    feeding: ({ c }: Values) => `${c.farm}ಗಾಗಿ ಪ್ರಸ್ತುತ ಪ್ರೋಟೋಟೈಪ್ ಶಿಫಾರಸು ${c.recommendation}. ಪ್ರಸ್ತುತ ಆಹಾರ ಮಿಶ್ರಣ ${c.ration}. ತಳಿ, ಹಾಲು ನೀಡುವ ಹಂತ, ಸೇವನೆ, ಗೊಬ್ಬರ ಮತ್ತು ಆರೋಗ್ಯದೊಂದಿಗೆ ಫಲಿತಾಂಶ ನೋಡಿ.`,
    monitor: () => 'ಆಹಾರ ನೀಡಿದ ನಂತರ ಸೇವನೆ, ಆಯ್ಕೆಮಾಡುವಿಕೆ, ಗೊಬ್ಬರದ ಸ್ಥಿರತೆ, ಜಗಿಯುವಿಕೆ, ಹಸುವಿನ ಆರಾಮ, ಹಾಲಿನ ಉತ್ಪಾದನೆ ಮತ್ತು ಆಹಾರದ ವಾಸನೆ ಅಥವಾ ಬಿಸಿಯನ್ನು ಗಮನಿಸಿ.',
    milkImpact: ({ c }: Values) => `ದಿಕ್ಕು ತೋರಿಸುವ ಹಾಲಿನ ಅಂದಾಜು ${c.milkEstimate} ಕೆಜಿ/ಹಸು/ದಿನ, ${c.confidence} ವಿಶ್ವಾಸದೊಂದಿಗೆ. ಇದು ಖಾತರಿ ಅಥವಾ ನೇರ ಕಾರಣಾತ್ಮಕ ಭವಿಷ್ಯವಾಣಿ ಅಲ್ಲ.`,
    milkIndicators: ({ c }: Values) => `ಈ ಪ್ರೋಟೋಟೈಪ್ ಹಾಲಿನ ಕೊಬ್ಬು ಅಥವಾ ಪ್ರೋಟೀನ್ ಅನ್ನು ನೇರವಾಗಿ ಅಳೆಯುವುದಿಲ್ಲ. ದಿಕ್ಕಿನ ಹಾಲಿನ ಅಂದಾಜು ${c.milkEstimate} ಕೆಜಿ/ಹಸು/ದಿನ. ನಿಜವಾದ ದಾಖಲೆ ಅಥವಾ ಪರಿಶೀಲಿತ ಪರೀಕ್ಷೆಯಿಂದ ದೃಢಪಡಿಸಿ.`,
    milkConfidence: ({ c }: Values) => `ವಿಶ್ವಾಸ ${c.confidence}. ಕಾರಣವೆಂದರೆ ಪ್ರೋಟೋಟೈಪ್ ಅನುಕರಿಸಿದ ಅಥವಾ ಕೈಯಾರೆ ನಮೂದಿಸಿದ ಓದುಗಳು ಮತ್ತು ಸೀಮಿತ ಇತಿಹಾಸವನ್ನು ಬಳಸುತ್ತದೆ. ನಿಜವಾದ ದಾಖಲೆಯೊಂದಿಗೆ ಹೋಲಿಸಿ.`,
    historyLast: ({ c }: Values) => c.lastTest ? `ಕೊನೆಯ ಉಳಿಸಿದ ಪರೀಕ್ಷೆ ${c.lastTest.sampleId}, ${c.lastTest.farm}. ಸ್ಕೋರ್ ${c.lastTest.score}/100 ಮತ್ತು ಅಪಾಯ ${c.lastTest.risk}. pH ${c.lastTest.ph}, ತೇವಾಂಶ ${c.lastTest.moisture}%, ತಾಪಮಾನ ${c.lastTest.temperature}°C.` : 'ಇನ್ನೂ ಉಳಿಸಿದ ಪರೀಕ್ಷೆ ಇಲ್ಲ. ಇತಿಹಾಸಕ್ಕಾಗಿ ಪರೀಕ್ಷೆ ಮಾಡಿ ಉಳಿಸಿ.',
    historyTrend: ({ c }: Values) => c.previousTest ? `ಹಿಂದಿನ ಮಾದರಿಯ ಸ್ಕೋರ್ ${c.previousTest.score}ರಿಂದ ಪ್ರಸ್ತುತ ${c.score}/100ಕ್ಕೆ ಬದಲಾಗಿದೆ. ತೇವಾಂಶ ${c.previousTest.moisture}%ರಿಂದ ${c.moisture}%ಕ್ಕೆ ಮತ್ತು pH ${c.previousTest.ph}ರಿಂದ ${c.ph}ಕ್ಕೆ ಬದಲಾಗಿದೆ.` : 'ಇನ್ನೂ ಒಂದು ಉಳಿಸಿದ ಪರೀಕ್ಷೆ ಮಾತ್ರ ಇದೆ. ಹೋಲಿಸಬಹುದಾದ ಮಾದರಿಯೊಂದಿಗೆ ಮತ್ತೊಂದು ಪರೀಕ್ಷೆ ಉಳಿಸಿ.',
    profile: ({ c }: Values) => `ನಿಮ್ಮ ಕೃಷಿ ${c.location}ನಲ್ಲಿರುವ ${c.farm}. ಪ್ರಾಣಿಗಳ ತಳಿ ${c.breed}, ಹಾಲು ನೀಡುವ ಹಂತ ${c.lactation}, ಸರಾಸರಿ ಹಾಲು ${c.yield}, ಪ್ರಸ್ತುತ ಆಹಾರ ಮಿಶ್ರಣ “${c.ration}”.`,
    device: () => 'NEXORA ಈಗ ಸ್ಪಷ್ಟವಾಗಿ ಗುರುತಿಸಿದ ಡೆಮೊ ಅಥವಾ ಕೈಯಾರೆ ನಮೂದಿಸಿದ ಓದುಗಳನ್ನು ಬಳಸುತ್ತದೆ. ಭವಿಷ್ಯದ ವಿನ್ಯಾಸದಲ್ಲಿ ಕ್ಯಾಮೆರಾ ಮತ್ತು ಸೆನ್ಸರ್‌ಗಳು ESP32 ಮೂಲಕ ಆಪ್‌ಗೆ ಬರುತ್ತವೆ. ಈಗ ಲೈವ್ ESP32 ಡೇಟಾ ಇಲ್ಲ.',
    nexora: () => 'NEXORA ಸೈಲೇಜ್ ವೀಕ್ಷಣೆಗಳು, ಸೆನ್ಸರ್ ಶೈಲಿಯ ಇನ್‌ಪುಟ್‌ಗಳು ಮತ್ತು ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು ಸೇರಿಸುವ ನಿರ್ಧಾರ ಸಹಾಯ ಪ್ರೋಟೋಟೈಪ್. ಇದು ಅನುಭವಿ ರೈತನನ್ನು ಬದಲಿಸುವುದಿಲ್ಲ ಅಥವಾ ಫಲಿತಾಂಶದ ಖಾತರಿ ನೀಡುವುದಿಲ್ಲ.',
  },
  hi: {
    unknown: 'मैं आपके वर्तमान साइलेज परीक्षण, सेंसर रीडिंग, खराब होने के जोखिम, खिलाने की सलाह, दूध अनुमान, इतिहास, प्रोफ़ाइल या NEXORA डिवाइस के बारे में मदद कर सकता हूं। कृपया प्रश्न को दूसरे तरीके से पूछें।',
    quality: ({ c }: Values) => `वर्तमान प्रोटोटाइप परिणाम ${c.score}/100 है और खराब होने का जोखिम ${c.risk} है। यह दर्ज की गई ${c.mode} रीडिंग पर आधारित निर्णय सहायता है, प्रयोगशाला ग्रेड या गारंटी नहीं।`,
    qualityLow: ({ c }: Values) => `वर्तमान स्कोर ${c.score}/100 (${c.quality}) और खराब होने का जोखिम ${c.risk} है। मुख्य संकेत ${c.reasons} हैं। प्रोटोटाइप सलाह: ${c.recommendation}. गंध, रंग, बनावट, भंडारण का खुला भाग और पशु प्रतिक्रिया भी देखें।`,
    fermentation: () => 'अच्छे किण्वन में कम ऑक्सीजन वाले वातावरण में उपयोगी अम्ल फसल को सुरक्षित रखते हैं। साफ खट्टी गंध, गर्म न होना और फफूंदी न होना सहायक संकेत हैं। फसल, सूखा पदार्थ, दबाव और भंडारण भी महत्वपूर्ण हैं।',
    sourSmell: () => 'साफ और हल्की खट्टी गंध अम्लीय किण्वन का संकेत हो सकती है। केवल गंध से निर्णय न लें; गर्मी, रंग, बनावट, pH, नमी और संदूषण भी देखें।',
    alcoholicSmell: () => 'शराब या यीस्ट जैसी गंध यीस्ट गतिविधि या हवा के संपर्क का संकेत हो सकती है। गर्मी, सूखा पदार्थ, सील और खुले हिस्से की जांच करें।',
    rottenSmell: () => 'सड़ी या तेज दुर्गंध ध्यान देने का संकेत है। संदिग्ध भाग अलग रखें, संदूषण और गर्मी जांचें, और विशेषज्ञ की सलाह के बिना पशुओं को न खिलाएं।',
    heating: ({ c }: Values) => `वर्तमान तापमान ${c.temperature}°C है और प्रोटोटाइप स्थिति ${c.temperatureStatus} है। खोलने के बाद गर्म होना हवा से खराब होने का संकेत हो सकता है। खुले भाग, सील और रोज हटाई जाने वाली मात्रा की जांच करें।`,
    discoloration: () => 'रंग और बनावट सहायक अवलोकन हैं, अकेले प्रयोगशाला परीक्षण नहीं। असामान्य काला पड़ना, चिपचिपापन या सूखापन हवा, गर्मी, संदूषण या फफूंदी का संकेत हो सकता है।',
    mould: () => 'दिखने वाली फफूंदी को राशन में मिलाकर सामान्य न बनाएं। संदिग्ध भाग पशुओं से दूर रखें और निपटान तथा वैकल्पिक चारे के लिए स्थानीय विशेषज्ञ से पूछें।',
    airExposure: () => 'हवा के संपर्क से यीस्ट और अन्य जीव चारे को खराब कर सकते हैं। खुले भाग को दबा और साफ रखें, बराबर मात्रा निकालें और क्षतिग्रस्त कवर ठीक करें।',
    openedManagement: () => 'खोलने के बाद खुले भाग को दबा और साफ रखें, हर दिन लगातार मात्रा निकालें और ढीला चारा खुला न छोड़ें। गर्मी, गंध, फफूंदी और रंग बदलने पर ध्यान दें।',
    phValue: ({ c }: Values) => `वर्तमान pH ${c.ph} है। यहां यह किण्वन का अनुमानित संकेत है। 3.8–4.5 कई घास या मक्का साइलेज के लिए केवल सामान्य मार्गदर्शक हो सकता है; फसल, सूखा पदार्थ, प्रक्रिया और भंडारण से मान बदलता है। वर्तमान स्थिति ${c.phStatus} है।`,
    phImportance: () => 'pH किण्वन के दौरान अम्लीकरण का एक संकेत है। इसे फसल, सूखा पदार्थ, गंध, तापमान, नमी, दबाव और भंडारण के साथ समझें। एक pH मान सार्वभौमिक सुरक्षित सीमा नहीं है।',
    phHigh: ({ c }: Values) => `वर्तमान pH ${c.ph} है और प्रोटोटाइप स्थिति ${c.phStatus} है। अपेक्षा से अधिक pH अधूरे किण्वन या अलग सूखे पदार्थ का संकेत हो सकता है। खिलाने से पहले गंध, गर्मी, नमी और भंडारण देखें।`,
    phLow: ({ c }: Values) => `वर्तमान pH ${c.ph} है। कम मान मजबूत अम्लीकरण दिखा सकता है, लेकिन कम pH अकेले गुणवत्ता की गारंटी नहीं है। फसल, सूखा पदार्थ, गंध, बनावट और पशु प्रतिक्रिया देखें।`,
    moistureValue: ({ c }: Values) => `वर्तमान नमी ${c.moisture}% है, इसलिए अनुमानित सूखा पदार्थ ${c.dryMatter}% है। प्रोटोटाइप स्थिति ${c.moistureStatus} है। अर्थ फसल और भंडारण पर निर्भर करता है।`,
    moistureHigh: ({ c }: Values) => `वर्तमान नमी ${c.moisture}% है। बहुत गीला चारा रिसाव, पोषक नुकसान और अस्थिर किण्वन का जोखिम बढ़ा सकता है। स्थिति ${c.moistureStatus} है; सूखा पदार्थ, गंध, निकासी और pH देखें।`,
    moistureLow: ({ c }: Values) => `वर्तमान नमी ${c.moisture}% है। बहुत सूखे चारे को दबाना कठिन हो सकता है और हवा रह सकती है। स्थिति ${c.moistureStatus} है; दबाव, बनावट और सेवन देखें।`,
    dryMatter: ({ c }: Values) => `सूखा पदार्थ पानी हटाने के बाद बचा हिस्सा है। ${c.moisture}% नमी पर अनुमानित सूखा पदार्थ ${c.dryMatter}% है। यह प्रोटोटाइप गणना है; फसल और परीक्षण विधि भी मायने रखती है।`,
    moistureStorage: () => 'नमी दबाव, किण्वन और भंडारण स्थिरता को प्रभावित करती है। अधिक नमी रिसाव ला सकती है; कम नमी में दबाना कठिन हो सकता है। वास्तविक भंडारण स्थिति भी देखें।',
    temperature: ({ c }: Values) => `वर्तमान तापमान ${c.temperature}°C है और प्रोटोटाइप स्थिति ${c.temperatureStatus} है। इसे बाहरी तापमान, नमूना स्थान और ताजा नमूने से तुलना करें।`,
    voc: ({ c }: Values) => `वर्तमान VOC इंडेक्स ${c.voc} है और प्रोटोटाइप स्थिति ${c.vocStatus} है। VOC हर यौगिक या विष को सीधे नहीं मापता; इसे गंध, तापमान और भंडारण के साथ समझें।`,
    nir: ({ c }: Values) => `वर्तमान NIR अनुमान ${c.nir} है और पोषण संकेतक की प्रोटोटाइप स्थिति ${c.nirStatus} है। NIR हर साइलेज पैरामीटर को सीधे नहीं मापता; उपलब्ध हो तो मान्य फीड विश्लेषण से पुष्टि करें।`,
    contamination: () => 'मिट्टी, खाद, रसायन या अन्य बाहरी सामग्री चारे को असुरक्षित बना सकती है। संदिग्ध भाग अलग करें और स्थानीय पशु चिकित्सक या फीड विशेषज्ञ की सलाह लें।',
    risk: ({ c }: Values) => `वर्तमान खराब होने का जोखिम ${c.risk} है। योगदान देने वाले संकेत ${c.reasons} हैं। प्रोटोटाइप सलाह ${c.recommendation} है। खुले भाग, सील, गंध, गर्मी और पशु प्रतिक्रिया देखें।`,
    reduceRisk: () => 'हवा का संपर्क घटाएं, खुले भाग को दबा रखें, बराबर मात्रा निकालें, ढीला चारा न छोड़ें और कवर ठीक करें। स्थिति बदलने के बाद फिर जांचें।',
    retest: ({ c }: Values) => `यदि नमूना बदला है, खुला भाग गर्म है या खिलाने का निर्णय स्पष्ट नहीं है तो फिर जांचें। वर्तमान स्कोर ${c.score}/100 और जोखिम ${c.risk} है; इसे स्क्रीनिंग संकेत मानें।`,
    feeding: ({ c }: Values) => `${c.farm} के लिए वर्तमान प्रोटोटाइप सलाह ${c.recommendation} है। वर्तमान राशन ${c.ration} है। नस्ल, दुग्धावस्था, सेवन, गोबर और स्वास्थ्य के साथ परिणाम देखें।`,
    monitor: () => 'खिलाने के बाद सेवन, छंटाई, गोबर, जुगाली, पशु आराम, दूध उत्पादन और चारे की गंध या गर्मी देखें। कई दिनों के वास्तविक रिकॉर्ड से तुलना करें।',
    milkImpact: ({ c }: Values) => `दिशात्मक दूध अनुमान ${c.milkEstimate} किग्रा/गाय/दिन है और विश्वास ${c.confidence} है। यह गारंटी या सीधी कारणात्मक भविष्यवाणी नहीं है।`,
    milkIndicators: ({ c }: Values) => `यह प्रोटोटाइप दूध की वसा या प्रोटीन सीधे नहीं मापता। दिशात्मक अनुमान ${c.milkEstimate} किग्रा/गाय/दिन है। वास्तविक रिकॉर्ड या मान्य परीक्षण से पुष्टि करें।`,
    milkConfidence: ({ c }: Values) => `विश्वास ${c.confidence} है क्योंकि प्रोटोटाइप सिमुलेटेड या मैनुअल रीडिंग और सीमित इतिहास उपयोग करता है। वास्तविक रिकॉर्ड से तुलना करें।`,
    historyLast: ({ c }: Values) => c.lastTest ? `सबसे हाल का परीक्षण ${c.lastTest.sampleId}, ${c.lastTest.farm} है। स्कोर ${c.lastTest.score}/100 और जोखिम ${c.lastTest.risk} है। pH ${c.lastTest.ph}, नमी ${c.lastTest.moisture}%, तापमान ${c.lastTest.temperature}°C।` : 'अभी कोई सुरक्षित परीक्षण नहीं है। इतिहास बनाने के लिए परीक्षण चलाकर सुरक्षित करें।',
    historyTrend: ({ c }: Values) => c.previousTest ? `पिछले नमूने का स्कोर ${c.previousTest.score} से बदलकर ${c.score}/100 हुआ। नमी ${c.previousTest.moisture}% से ${c.moisture}% और pH ${c.previousTest.ph} से ${c.ph} हुआ।` : 'अभी केवल एक सुरक्षित परीक्षण है। तुलना के लिए समान परिस्थितियों में एक और परीक्षण सुरक्षित करें।',
    profile: ({ c }: Values) => `आपका खेत ${c.location} में ${c.farm} है। पशु नस्ल ${c.breed}, दुग्धावस्था ${c.lactation}, औसत दूध ${c.yield}, और वर्तमान राशन “${c.ration}” है।`,
    device: () => 'NEXORA अभी स्पष्ट रूप से चिह्नित डेमो या मैनुअल रीडिंग उपयोग करता है। भविष्य में कैमरा और सेंसर ESP32 के माध्यम से ऐप से जुड़ेंगे। अभी लाइव ESP32 डेटा नहीं आ रहा है।',
    nexora: () => 'NEXORA एक निर्णय-सहायता प्रोटोटाइप है जो साइलेज अवलोकन, सेंसर-जैसे इनपुट और खेत की जानकारी जोड़ता है। यह अनुभवी किसान की जगह नहीं लेता और परिणाम की गारंटी नहीं देता।',
  },
} as const;

type Values = {
  c: {
    score: string;
    quality: string;
    risk: string;
    recommendation: string;
    reasons: string;
    mode: string;
    ph: string;
    phStatus: string;
    moisture: string;
    moistureStatus: string;
    dryMatter: string;
    temperature: string;
    temperatureStatus: string;
    voc: string;
    vocStatus: string;
    nir: string;
    nirStatus: string;
    farm: string;
    location: string;
    breed: string;
    lactation: string;
    yield: string;
    ration: string;
    milkEstimate: string;
    confidence: string;
    lastTest?: {
      sampleId: string;
      farm: string;
      score: number;
      risk: string;
      ph: number;
      moisture: number;
      temperature: number;
      voc: number;
      nir: number;
    };
    previousTest?: {
      score: number;
      ph: number;
      moisture: number;
    };
  };
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}%]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function label(value: string, language: AssistantLanguage) {
  const labels: Record<AssistantLanguage, Record<string, string>> = {
    en: { good: 'good', watch: 'moderate / watch', risk: 'danger / at risk', low: 'low', medium: 'moderate', high: 'high', feed: 'feed as planned', blend: 'blend with a stronger lot', hold: 'hold and inspect' },
    kn: { good: 'ಉತ್ತಮ', watch: 'ಮಧ್ಯಮ / ಗಮನಿಸಿ', risk: 'ಅಪಾಯ', low: 'ಕಡಿಮೆ', medium: 'ಮಧ್ಯಮ', high: 'ಹೆಚ್ಚು', feed: 'ಯೋಜನೆಯಂತೆ ನೀಡಿ', blend: 'ಉತ್ತಮ ಲಾಟ್ ಜೊತೆ ಮಿಶ್ರಣಿಸಿ', hold: 'ತಡೆದು ಪರಿಶೀಲಿಸಿ' },
    hi: { good: 'अच्छा', watch: 'मध्यम / ध्यान दें', risk: 'खतरा / जोखिम', low: 'कम', medium: 'मध्यम', high: 'अधिक', feed: 'योजना के अनुसार खिलाएं', blend: 'बेहतर लॉट के साथ मिलाएं', hold: 'रोककर जांचें' },
  };
  return labels[language][value] ?? value;
}

export function readingTone(kind: 'ph' | 'moisture' | 'temperature' | 'voc' | 'nir', value: number): StatusTone {
  // Prototype-only visual bands. They are not laboratory thresholds and should
  // always be interpreted with crop, dry matter, storage and field observations.
  if (kind === 'ph') return value >= 3.8 && value <= 4.5 ? 'good' : value >= 3.5 && value <= 5.2 ? 'watch' : 'risk';
  if (kind === 'moisture') return value >= 30 && value <= 40 ? 'good' : value >= 25 && value <= 48 ? 'watch' : 'risk';
  if (kind === 'temperature') return value <= 27 ? 'good' : value <= 32 ? 'watch' : 'risk';
  if (kind === 'voc') return value <= 40 ? 'good' : value <= 60 ? 'watch' : 'risk';
  return value >= 45 ? 'good' : value >= 35 ? 'watch' : 'risk';
}

export function riskTone(risk: AssistantAnalysis['risk']): StatusTone {
  return risk === 'low' ? 'good' : risk === 'medium' ? 'watch' : 'risk';
}

export function recommendationTone(recommendation: AssistantAnalysis['recommendation']): StatusTone {
  return recommendation === 'feed' ? 'good' : recommendation === 'blend' ? 'watch' : 'risk';
}

export function toneLabel(tone: StatusTone, language: AssistantLanguage) {
  return label(tone, language);
}

export const toneClasses: Record<StatusTone, string> = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  watch: 'border-amber-200 bg-amber-50 text-amber-900',
  risk: 'border-red-200 bg-red-50 text-red-800',
};

export const tonePanelClasses: Record<StatusTone, string> = {
  good: 'bg-emerald-800 text-white',
  watch: 'bg-amber-700 text-white',
  risk: 'bg-red-700 text-white',
};

export function getAssistantResponse(question: string, context: AssistantContext, language: AssistantLanguage) {
  const normalized = normalize(question);
  const entry = SILAGE_KNOWLEDGE_BASE.find((candidate) =>
    candidate.patterns.some((pattern) => normalized.includes(normalize(pattern))),
  );
  const id = entry?.id ?? 'unknown';
  const c = buildValues(context, language);
  const responses = text[language] as unknown as Record<string, (values: Values) => string>;
  return id === 'unknown' ? text[language].unknown : responses[id]?.({ c }) ?? text[language].unknown;
}

function buildValues(context: AssistantContext, language: AssistantLanguage): Values['c'] {
  const { analysis, draft, profile, tests } = context;
  const readings = draft.readings;
  const lastTest = tests[0];
  const previousTest = tests[1];
  const reasons = analysis.reasons.map((reason) => assistantReasonLabel(reason, language)).join(', ');
  return {
    score: String(analysis.score),
    quality: label(analysis.quality, language),
    risk: label(analysis.risk, language),
    recommendation: label(analysis.recommendation, language),
    reasons,
    mode: language === 'kn' ? (draft.mode === 'demo' ? 'ಡೆಮೊ' : 'ಮ್ಯಾನುಯಲ್') : language === 'hi' ? (draft.mode === 'demo' ? 'सिमुलेटेड' : 'मैनुअल') : draft.mode,
    ph: String(readings.ph),
    phStatus: label(readingTone('ph', readings.ph), language),
    moisture: String(readings.moisture),
    moistureStatus: label(readingTone('moisture', readings.moisture), language),
    dryMatter: String(Math.max(0, 100 - readings.moisture)),
    temperature: String(readings.temperature),
    temperatureStatus: label(readingTone('temperature', readings.temperature), language),
    voc: String(readings.voc),
    vocStatus: label(readingTone('voc', readings.voc), language),
    nir: String(readings.nir),
    nirStatus: label(readingTone('nir', readings.nir), language),
    farm: profile.farmName || (language === 'kn' ? 'ನಿಮ್ಮ ಕೃಷಿ' : language === 'hi' ? 'आपका खेत' : 'your farm'),
    location: profile.location || '—',
    breed: profile.breed || '—',
    lactation: profile.lactationStage || '—',
    yield: profile.milkYield || draft.milkTarget || '—',
    ration: profile.ration || (language === 'kn' ? 'ಉಳಿಸಿದ ವಿವರ ಇಲ್ಲ' : language === 'hi' ? 'विवरण नहीं है' : 'not recorded'),
    milkEstimate: String(milkEstimate(draft.milkTarget, analysis)),
    confidence: analysis.score >= 78 ? (language === 'kn' ? 'ಮಧ್ಯಮ' : language === 'hi' ? 'मध्यम' : 'moderate') : (language === 'kn' ? 'ಸೀಮಿತ' : language === 'hi' ? 'सीमित' : 'limited'),
    lastTest: lastTest ? {
      sampleId: lastTest.sampleId,
      farm: lastTest.farm,
      score: lastTest.analysis.score,
      risk: label(lastTest.analysis.risk, language),
      ph: lastTest.readings.ph,
      moisture: lastTest.readings.moisture,
      temperature: lastTest.readings.temperature,
      voc: lastTest.readings.voc,
      nir: lastTest.readings.nir,
    } : undefined,
    previousTest: previousTest ? {
      score: previousTest.analysis.score,
      ph: previousTest.readings.ph,
      moisture: previousTest.readings.moisture,
    } : undefined,
  };
}

function assistantReasonLabel(reason: string, language: AssistantLanguage) {
  const labels: Record<AssistantLanguage, Record<string, string>> = {
    en: {
      highPh: 'pH above the prototype reference band',
      wet: 'higher moisture',
      dry: 'lower moisture',
      warm: 'higher temperature',
      voc: 'elevated VOC index',
      digestibility: 'lower NIR indicator',
      stable: 'readings in the prototype stable bands',
    },
    kn: {
      highPh: 'ಪ್ರೋಟೋಟೈಪ್ pH ವ್ಯಾಪ್ತಿಗಿಂತ ಹೆಚ್ಚು',
      wet: 'ಹೆಚ್ಚಿನ ತೇವಾಂಶ',
      dry: 'ಕಡಿಮೆ ತೇವಾಂಶ',
      warm: 'ಹೆಚ್ಚಿನ ತಾಪಮಾನ',
      voc: 'ಹೆಚ್ಚಿನ VOC ಸೂಚ್ಯಂಕ',
      digestibility: 'ಕಡಿಮೆ NIR ಸೂಚಕ',
      stable: 'ಓದುಗಳು ಪ್ರೋಟೋಟೈಪ್ ಸ್ಥಿರ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ',
    },
    hi: {
      highPh: 'प्रोटोटाइप pH बैंड से अधिक',
      wet: 'अधिक नमी',
      dry: 'कम नमी',
      warm: 'अधिक तापमान',
      voc: 'बढ़ा हुआ VOC इंडेक्स',
      digestibility: 'कम NIR संकेतक',
      stable: 'रीडिंग प्रोटोटाइप स्थिर बैंड में',
    },
  };
  return labels[language][reason] ?? reason;
}

function milkEstimate(target: string, analysis: AssistantAnalysis) {
  const base = Number(target) || 0;
  const directional = base + (analysis.score - 70) * 0.018;
  return directional.toFixed(1);
}