import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Camera,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Cloud,
  Droplets,
  FileText,
  Gauge,
  History as HistoryIcon,
  ImagePlus,
  Languages,
  Leaf,
  Lightbulb,
  Mic,
  MicOff,
  MoreHorizontal,
  Pencil,
  Plus,
  QrCode,
  Save,
  ScanLine,
  Settings2,
  ShieldCheck,
  Sprout,
  Thermometer,
  Trash2,
  Upload,
  UserRound,
  Volume2,
  VolumeX,
  Wheat,
  X,
} from 'lucide-react';
import { Router as WouterRouter, useLocation } from 'wouter';
import {
  getAssistantResponse,
  recommendationTone,
  readingTone,
  riskTone,
  toneClasses,
  toneLabel,
  tonePanelClasses,
  type AssistantContext,
  type StatusTone,
} from '@/lib/assistant';

const queryClient = new QueryClient();

type Language = 'en' | 'kn' | 'hi';
type RouteName = 'home' | 'test' | 'history' | 'profile';

type Profile = {
  name: string;
  farmName: string;
  location: string;
  herdSize: string;
  breed: string;
  lactationStage: string;
  milkYield: string;
  ration: string;
  language: Language;
};

type Readings = {
  ph: number;
  moisture: number;
  temperature: number;
  voc: number;
  nir: number;
};

type Analysis = {
  score: number;
  quality: 'good' | 'watch' | 'risk';
  risk: 'low' | 'medium' | 'high';
  reasons: string[];
  recommendation: 'feed' | 'blend' | 'hold';
};

type TestRecord = {
  id: string;
  createdAt: string;
  farm: string;
  animalGroup: string;
  sampleId: string;
  sampleImage?: string;
  mode: 'demo' | 'manual';
  readings: Readings;
  analysis: Analysis;
  milkTarget: string;
  actualMilk?: string;
};

type TestDraft = {
  farm: string;
  animalGroup: string;
  sampleId: string;
  sampleImage: string;
  mode: 'demo' | 'manual';
  readings: Readings;
  milkTarget: string;
  actualMilk: string;
};

type VoiceState = {
  open: boolean;
  listening: boolean;
  speaking: boolean;
  error: string;
};

const STORAGE = {
  profile: 'nexora-profile',
  tests: 'nexora-tests',
  draft: 'nexora-test-draft',
  language: 'nexora-language',
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    home: 'Home',
    test: 'New test',
    history: 'History',
    profile: 'Profile',
    goodMorning: 'Good morning',
    farmVisit: 'Your next farm visit, made clearer.',
    todayAt: 'Today at',
    lastTest: 'Last test',
    startTest: 'Start a test',
    openHistory: 'Open history',
    noTests: 'No saved tests yet',
    noTestsHint: 'Run your first silage check to start seeing patterns here.',
    recentTests: 'Recent tests',
    quickView: 'Quick view',
    herd: 'Herd',
    samples: 'Saved samples',
    averageScore: 'Average score',
    allClear: 'All clear',
    attention: 'Needs attention',
    silage: 'Silage',
    fieldCompanion: 'Field companion',
    voiceGuide: 'Voice guide',
    language: 'Language',
    newTest: 'New silage test',
    stepOf: 'Step',
    details: 'Farm & animals',
    sample: 'Sample',
    readings: 'Readings',
    decision: 'Decision',
    feedback: 'Milk feedback',
    continue: 'Continue',
    back: 'Back',
    saveTest: 'Save test',
    testSaved: 'Test saved locally',
    farmName: 'Farm name',
    animalGroup: 'Animal group',
    animalHint: 'Example: Fresh cows, 42 head',
    sampleId: 'Sample ID',
    sampleIdHint: 'Use a short label you will recognize',
    addPhoto: 'Add sample photo',
    photoHint: 'Optional. A photo stays on this device.',
    removePhoto: 'Remove photo',
    qrDemo: 'Simulate QR identification',
    qrHint: 'Prototype only. No hardware or live ID is connected.',
    identified: 'Simulated ID',
    howMeasure: 'How would you like to measure?',
    demoSensor: 'Demo Sensor Data',
    demoSensorHint: 'A clearly marked, realistic reading set for trying the flow.',
    manualDemo: 'Manual Demo Mode',
    manualDemoHint: 'Enter your own values to explore the analysis.',
    simulated: 'SIMULATED',
    manual: 'MANUAL',
    pH: 'pH',
    moisture: 'Moisture',
    temperature: 'Temperature',
    voc: 'VOC index',
    nir: 'NIR digestibility',
    useDemo: 'Use demo readings',
    calculate: 'Calculate analysis',
    analysis: 'Analysis',
    quality: 'Quality',
    spoilageRisk: 'Spoilage risk',
    score: 'Field score',
    reasons: 'What shaped this result',
    recommendation: 'Feeding recommendation',
    feedNow: 'Feed as planned',
    blend: 'Blend with a better lot',
    hold: 'Hold and inspect',
    recommendationFeed: 'Stable markers suggest this lot can be fed as planned. Keep the face of the clamp tidy and monitor intake.',
    recommendationBlend: 'Use this lot in a blend with a stronger lot. This smooths the risk while keeping the ration practical.',
    recommendationHold: 'Pause this lot for now. Inspect the face, smell, and storage seal before feeding it to the herd.',
    milkSupport: 'Milk decision support',
    milkSupportHint: 'A directional estimate, not a promise. Milk depends on the whole ration, herd health, weather, and management.',
    targetMilk: 'Current herd milk (kg/cow/day)',
    targetHint: 'Use the recent herd average as your reference.',
    estimate: 'Directional estimate',
    confidence: 'Confidence',
    uncertainty: 'Not a guarantee. Compare with your actual records over several days.',
    actualMilk: 'Actual milk after feeding',
    actualHint: 'Add later if you want to compare this decision with what happened.',
    skip: 'Skip for now',
    finish: 'Finish & save',
    historyTitle: 'Your field history',
    historyHint: 'Saved on this device. Use trends as a conversation starter, not a verdict.',
    trend: 'Score trend',
    detail: 'Test detail',
    deleteTest: 'Delete test',
    deleteConfirm: 'Delete this saved test?',
    deleteHint: 'This cannot be undone.',
    cancel: 'Cancel',
    delete: 'Delete',
    profileTitle: 'Your profile',
    profileHint: 'Personalize the field companion. Your details stay local to this browser.',
    yourName: 'Your name',
    farmLocation: 'Village / location',
    herdSize: 'Herd size',
    breed: 'Breed',
    lactationStage: 'Lactation stage',
    milkYield: 'Average milk yield',
    ration: 'Current ration',
    saveProfile: 'Save profile',
    preferences: 'Preferences',
    languageHint: 'Translations apply across the entire companion.',
    english: 'English',
    kannada: 'ಕನ್ನಡ',
    hindi: 'हिन्दी',
    voiceTitle: 'NEXORA voice guide',
    voiceHint: 'Ask about the current test, the reading, or what to do next.',
    listening: 'Listening…',
    tapToSpeak: 'Tap to speak',
    typedQuestion: 'Type a question',
    ask: 'Ask',
    quickQuestions: 'Quick questions',
    quickRisk: 'Why is the risk this level?',
    quickFeed: 'What should I feed?',
    quickMilk: 'What should I watch in milk?',
    stopSpeaking: 'Stop speaking',
    micUnsupported: 'Voice input is not supported in this browser. You can type instead.',
    micDenied: 'Microphone access was not available. You can type instead.',
    welcomeResponse: 'I can help you read the current silage check. Ask me about risk, feeding, or milk follow-up.',
    scoreResponse: 'The current field score is {score} out of 100. It is a directional screening result from the entered readings.',
    riskResponse: 'The current spoilage risk is {risk}. {reasons}',
    feedResponse: '{recommendation} Start with the practical action shown on screen, then observe intake and the clamp face.',
    milkResponse: 'The milk estimate is directional with {confidence} confidence. Watch actual milk, intake, manure, and cow comfort over the next few days.',
    testSavedResponse: 'This test is saved on the device. You can find it in History.',
    saved: 'Saved',
    unavailable: 'Unavailable',
    close: 'Close',
    loading: 'Loading your field notes…',
    error: 'Something went wrong',
    retry: 'Try again',
    noData: 'No data to show yet',
    sensorNote: 'No live hardware is connected in this prototype.',
  },
  kn: {
    home: 'ಮುಖಪುಟ',
    test: 'ಹೊಸ ಪರೀಕ್ಷೆ',
    history: 'ಇತಿಹಾಸ',
    profile: 'ಪ್ರೊಫೈಲ್',
    goodMorning: 'ಶುಭೋದಯ',
    farmVisit: 'ನಿಮ್ಮ ಮುಂದಿನ ಕೃಷಿ ಭೇಟಿಯನ್ನು ಇನ್ನಷ್ಟು ಸ್ಪಷ್ಟವಾಗಿಸಿ.',
    todayAt: 'ಇಂದು',
    lastTest: 'ಕೊನೆಯ ಪರೀಕ್ಷೆ',
    startTest: 'ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ',
    openHistory: 'ಇತಿಹಾಸ ತೆರೆಯಿರಿ',
    noTests: 'ಇನ್ನೂ ಉಳಿಸಿದ ಪರೀಕ್ಷೆಗಳಿಲ್ಲ',
    noTestsHint: 'ಮೊದಲ ಸೈಲೇಜ್ ಪರಿಶೀಲನೆ ಮಾಡಿದ ನಂತರ ಇಲ್ಲಿ ಮಾದರಿಗಳು ಕಾಣಿಸುತ್ತವೆ.',
    recentTests: 'ಇತ್ತೀಚಿನ ಪರೀಕ್ಷೆಗಳು',
    quickView: 'ತ್ವರಿತ ನೋಟ',
    herd: 'ಹಸುಗಳ ಗುಂಪು',
    samples: 'ಉಳಿಸಿದ ಮಾದರಿಗಳು',
    averageScore: 'ಸರಾಸರಿ ಸ್ಕೋರ್',
    allClear: 'ಎಲ್ಲವೂ ಸರಿಯಾಗಿದೆ',
    attention: 'ಗಮನ ಬೇಕು',
    silage: 'ಸೈಲೇಜ್',
    fieldCompanion: 'ಕೃಷಿ ಸಹಾಯಕ',
    voiceGuide: 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ',
    language: 'ಭಾಷೆ',
    newTest: 'ಹೊಸ ಸೈಲೇಜ್ ಪರೀಕ್ಷೆ',
    stepOf: 'ಹಂತ',
    details: 'ಕೃಷಿ ಮತ್ತು ಹಸುಗಳು',
    sample: 'ಮಾದರಿ',
    readings: 'ಓದುಗಳು',
    decision: 'ನಿರ್ಧಾರ',
    feedback: 'ಹಾಲಿನ ಪ್ರತಿಕ್ರಿಯೆ',
    continue: 'ಮುಂದುವರಿಸಿ',
    back: 'ಹಿಂದೆ',
    saveTest: 'ಪರೀಕ್ಷೆ ಉಳಿಸಿ',
    testSaved: 'ಪರೀಕ್ಷೆ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ',
    farmName: 'ಕೃಷಿಯ ಹೆಸರು',
    animalGroup: 'ಹಸುಗಳ ಗುಂಪು',
    animalHint: 'ಉದಾಹರಣೆ: ಹೊಸ ಹಸುಗಳು, 42',
    sampleId: 'ಮಾದರಿ ID',
    sampleIdHint: 'ಗುರುತಿಸಬಹುದಾದ ಚಿಕ್ಕ ಹೆಸರು ಬಳಸಿ',
    addPhoto: 'ಮಾದರಿ ಫೋಟೋ ಸೇರಿಸಿ',
    photoHint: 'ಐಚ್ಛಿಕ. ಫೋಟೋ ಈ ಸಾಧನದಲ್ಲೇ ಉಳಿಯುತ್ತದೆ.',
    removePhoto: 'ಫೋಟೋ ತೆಗೆದುಹಾಕಿ',
    qrDemo: 'QR ಗುರುತಿಸುವಿಕೆ ಅನುಕರಿಸಿ',
    qrHint: 'ಮಾದರಿ ಮಾತ್ರ. ಲೈವ್ ಹಾರ್ಡ್‌ವೇರ್ ಅಥವಾ ID ಸಂಪರ್ಕವಿಲ್ಲ.',
    identified: 'ಅನುಕರಿಸಿದ ID',
    howMeasure: 'ನೀವು ಹೇಗೆ ಅಳೆಯಲು ಬಯಸುತ್ತೀರಿ?',
    demoSensor: 'ಡೆಮೊ ಸೆನ್ಸರ್ ಡೇಟಾ',
    demoSensorHint: 'ಈ ಹರಿವನ್ನು ಪ್ರಯತ್ನಿಸಲು ಸ್ಪಷ್ಟವಾಗಿ ಗುರುತಿಸಿದ ಓದುಗಳ ಸೆಟ್.',
    manualDemo: 'ಮ್ಯಾನುಯಲ್ ಡೆಮೊ ಮೋಡ್',
    manualDemoHint: 'ವಿಶ್ಲೇಷಣೆ ನೋಡಲು ನಿಮ್ಮದೇ ಮೌಲ್ಯಗಳನ್ನು ನಮೂದಿಸಿ.',
    simulated: 'ಅನುಕರಿಸಿದ',
    manual: 'ಮ್ಯಾನುಯಲ್',
    pH: 'pH',
    moisture: 'ತೇವಾಂಶ',
    temperature: 'ತಾಪಮಾನ',
    voc: 'VOC ಸೂಚ್ಯಂಕ',
    nir: 'NIR ಜೀರ್ಣತೆ',
    useDemo: 'ಡೆಮೊ ಓದು ಬಳಸಿ',
    calculate: 'ವಿಶ್ಲೇಷಿಸಿ',
    analysis: 'ವಿಶ್ಲೇಷಣೆ',
    quality: 'ಗುಣಮಟ್ಟ',
    spoilageRisk: 'ಹಾಳಾಗುವ ಅಪಾಯ',
    score: 'ಕ್ಷೇತ್ರ ಸ್ಕೋರ್',
    reasons: 'ಈ ಫಲಿತಾಂಶಕ್ಕೆ ಕಾರಣ',
    recommendation: 'ಆಹಾರ ಶಿಫಾರಸು',
    feedNow: 'ಯೋಜನೆಯಂತೆ ನೀಡಿ',
    blend: 'ಉತ್ತಮ ಲಾಟ್ ಜೊತೆ ಮಿಶ್ರಣಿಸಿ',
    hold: 'ತಡೆದು ಪರಿಶೀಲಿಸಿ',
    recommendationFeed: 'ಸ್ಥಿರ ಸೂಚಕಗಳ ಆಧಾರದಲ್ಲಿ ಈ ಲಾಟ್ ಅನ್ನು ಯೋಜನೆಯಂತೆ ನೀಡಬಹುದು. ಸೇವನೆ ಗಮನಿಸಿ.',
    recommendationBlend: 'ಈ ಲಾಟ್ ಅನ್ನು ಉತ್ತಮ ಲಾಟ್ ಜೊತೆ ಮಿಶ್ರಣಿಸಿ. ಇದು ಅಪಾಯವನ್ನು ಸಮತೋಲನಗೊಳಿಸುತ್ತದೆ.',
    recommendationHold: 'ಈ ಲಾಟ್ ಅನ್ನು ಈಗ ತಡೆಹಿಡಿಯಿರಿ. ವಾಸನೆ, ಮುಖ ಮತ್ತು ಸಂಗ್ರಹ ಮುದ್ರೆ ಪರಿಶೀಲಿಸಿ.',
    milkSupport: 'ಹಾಲಿನ ನಿರ್ಧಾರ ಸಹಾಯ',
    milkSupportHint: 'ಇದು ದಿಕ್ಕು ತೋರಿಸುವ ಅಂದಾಜು ಮಾತ್ರ. ಹಾಲು ಸಂಪೂರ್ಣ ಆಹಾರ, ಆರೋಗ್ಯ ಮತ್ತು ನಿರ್ವಹಣೆಯ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿದೆ.',
    targetMilk: 'ಪ್ರಸ್ತುತ ಹಾಲು (ಕೆಜಿ/ಹಸು/ದಿನ)',
    targetHint: 'ಇತ್ತೀಚಿನ ಹಿಂಡಿನ ಸರಾಸರಿಯನ್ನು ಉಲ್ಲೇಖವಾಗಿ ಬಳಸಿ.',
    estimate: 'ದಿಕ್ಕಿನ ಅಂದಾಜು',
    confidence: 'ವಿಶ್ವಾಸ',
    uncertainty: 'ಖಾತರಿ ಅಲ್ಲ. ಹಲವಾರು ದಿನಗಳ ನಿಜವಾದ ದಾಖಲೆಯೊಂದಿಗೆ ಹೋಲಿಸಿ.',
    actualMilk: 'ಆಹಾರದ ನಂತರದ ನಿಜವಾದ ಹಾಲು',
    actualHint: 'ನಂತರ ಸೇರಿಸಬಹುದು.',
    skip: 'ಈಗ ಬಿಟ್ಟುಬಿಡಿ',
    finish: 'ಮುಗಿಸಿ ಮತ್ತು ಉಳಿಸಿ',
    historyTitle: 'ನಿಮ್ಮ ಕ್ಷೇತ್ರ ಇತಿಹಾಸ',
    historyHint: 'ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ. ಟ್ರೆಂಡ್ ಅನ್ನು ಚರ್ಚೆಯ ಆರಂಭವಾಗಿ ಬಳಸಿ.',
    trend: 'ಸ್ಕೋರ್ ಟ್ರೆಂಡ್',
    detail: 'ಪರೀಕ್ಷೆಯ ವಿವರ',
    deleteTest: 'ಪರೀಕ್ಷೆ ಅಳಿಸಿ',
    deleteConfirm: 'ಈ ಪರೀಕ್ಷೆಯನ್ನು ಅಳಿಸಬೇಕೇ?',
    deleteHint: 'ಇದನ್ನು ಹಿಂತಿರುಗಿಸಲಾಗುವುದಿಲ್ಲ.',
    cancel: 'ರದ್ದು',
    delete: 'ಅಳಿಸಿ',
    profileTitle: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್',
    profileHint: 'ಕ್ಷೇತ್ರ ಸಹಾಯಕವನ್ನು ವೈಯಕ್ತಿಕಗೊಳಿಸಿ. ನಿಮ್ಮ ವಿವರಗಳು ಈ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ಇರುತ್ತವೆ.',
    yourName: 'ನಿಮ್ಮ ಹೆಸರು',
    farmLocation: 'ಗ್ರಾಮ / ಸ್ಥಳ',
    herdSize: 'ಹಿಂಡಿನ ಗಾತ್ರ',
    breed: 'ತಳಿಯ ಹೆಸರು',
    lactationStage: 'ಹಾಲು ನೀಡುವ ಹಂತ',
    milkYield: 'ಸರಾಸರಿ ಹಾಲಿನ ಉತ್ಪಾದನೆ',
    ration: 'ಪ್ರಸ್ತುತ ಆಹಾರ ಮಿಶ್ರಣ',
    saveProfile: 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ',
    preferences: 'ಆದ್ಯತೆಗಳು',
    languageHint: 'ಅನುವಾದಗಳು ಸಂಪೂರ್ಣ ಸಹಾಯಕದಲ್ಲಿ ಅನ್ವಯಿಸುತ್ತವೆ.',
    english: 'English',
    kannada: 'ಕನ್ನಡ',
    hindi: 'हिन्दी',
    voiceTitle: 'NEXORA ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ',
    voiceHint: 'ಪ್ರಸ್ತುತ ಪರೀಕ್ಷೆ, ಓದು ಅಥವಾ ಮುಂದಿನ ಹೆಜ್ಜೆ ಬಗ್ಗೆ ಕೇಳಿ.',
    listening: 'ಆಲಿಸುತ್ತಿದೆ…',
    tapToSpeak: 'ಮಾತನಾಡಲು ಒತ್ತಿರಿ',
    typedQuestion: 'ಪ್ರಶ್ನೆ ಬರೆಯಿರಿ',
    ask: 'ಕೇಳಿ',
    quickQuestions: 'ತ್ವರಿತ ಪ್ರಶ್ನೆಗಳು',
    quickRisk: 'ಅಪಾಯ ಏಕೆ ಹೀಗಿದೆ?',
    quickFeed: 'ನಾನು ಏನು ನೀಡಬೇಕು?',
    quickMilk: 'ಹಾಲಿನಲ್ಲಿ ಏನು ಗಮನಿಸಬೇಕು?',
    stopSpeaking: 'ಮಾತು ನಿಲ್ಲಿಸಿ',
    micUnsupported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಇಲ್ಲ. ಬದಲಿಗೆ ಬರೆಯಬಹುದು.',
    micDenied: 'ಮೈಕ್ರೊಫೋನ್ ಲಭ್ಯವಿಲ್ಲ. ಬದಲಿಗೆ ಬರೆಯಬಹುದು.',
    welcomeResponse: 'ಪ್ರಸ್ತುತ ಸೈಲೇಜ್ ಪರೀಕ್ಷೆಯನ್ನು ಓದಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ಅಪಾಯ, ಆಹಾರ ಅಥವಾ ಹಾಲಿನ ಬಗ್ಗೆ ಕೇಳಿ.',
    scoreResponse: 'ಪ್ರಸ್ತುತ ಕ್ಷೇತ್ರ ಸ್ಕೋರ್ 100ರಲ್ಲಿ {score}. ಇದು ನಮೂದಿಸಿದ ಓದುಗಳ ಆಧಾರದ ದಿಕ್ಕಿನ ಪರಿಶೀಲನೆ.',
    riskResponse: 'ಪ್ರಸ್ತುತ ಹಾಳಾಗುವ ಅಪಾಯ {risk}. {reasons}',
    feedResponse: '{recommendation} ಪರದೆಯ ಮೇಲಿನ ಪ್ರಾಯೋಗಿಕ ಕ್ರಮದಿಂದ ಪ್ರಾರಂಭಿಸಿ ಮತ್ತು ಸೇವನೆ ಗಮನಿಸಿ.',
    milkResponse: 'ಹಾಲಿನ ಅಂದಾಜು {confidence} ವಿಶ್ವಾಸದ ದಿಕ್ಕಿನ ಅಂದಾಜು. ಮುಂದಿನ ದಿನಗಳಲ್ಲಿ ನಿಜವಾದ ಹಾಲು ಮತ್ತು ಸೇವನೆ ಗಮನಿಸಿ.',
    testSavedResponse: 'ಈ ಪರೀಕ್ಷೆ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ. ಇದನ್ನು ಇತಿಹಾಸದಲ್ಲಿ ನೋಡಬಹುದು.',
    saved: 'ಉಳಿಸಲಾಗಿದೆ',
    unavailable: 'ಲಭ್ಯವಿಲ್ಲ',
    close: 'ಮುಚ್ಚಿ',
    loading: 'ನಿಮ್ಮ ಕ್ಷೇತ್ರದ ಟಿಪ್ಪಣಿಗಳನ್ನು ಲೋಡ್ ಮಾಡುತ್ತಿದೆ…',
    error: 'ಏನೋ ತಪ್ಪಾಗಿದೆ',
    retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    noData: 'ಇನ್ನೂ ಡೇಟಾ ಇಲ್ಲ',
    sensorNote: 'ಈ ಮಾದರಿಯಲ್ಲಿ ಲೈವ್ ಹಾರ್ಡ್‌ವೇರ್ ಸಂಪರ್ಕವಿಲ್ಲ.',
  },
  hi: {
    home: 'होम',
    test: 'नया परीक्षण',
    history: 'इतिहास',
    profile: 'प्रोफ़ाइल',
    goodMorning: 'सुप्रभात',
    farmVisit: 'आपकी अगली खेत यात्रा, और स्पष्ट।',
    todayAt: 'आज',
    lastTest: 'पिछला परीक्षण',
    startTest: 'परीक्षण शुरू करें',
    openHistory: 'इतिहास खोलें',
    noTests: 'अभी कोई परीक्षण सुरक्षित नहीं',
    noTestsHint: 'पहली साइलेज जांच के बाद यहां रुझान दिखेंगे।',
    recentTests: 'हाल के परीक्षण',
    quickView: 'त्वरित दृश्य',
    herd: 'झुंड',
    samples: 'सुरक्षित नमूने',
    averageScore: 'औसत स्कोर',
    allClear: 'सब ठीक',
    attention: 'ध्यान आवश्यक',
    silage: 'साइलेज',
    fieldCompanion: 'खेत सहायक',
    voiceGuide: 'वॉइस गाइड',
    language: 'भाषा',
    newTest: 'नया साइलेज परीक्षण',
    stepOf: 'चरण',
    details: 'खेत और पशु',
    sample: 'नमूना',
    readings: 'रीडिंग',
    decision: 'निर्णय',
    feedback: 'दूध प्रतिक्रिया',
    continue: 'जारी रखें',
    back: 'वापस',
    saveTest: 'परीक्षण सुरक्षित करें',
    testSaved: 'परीक्षण डिवाइस पर सुरक्षित है',
    farmName: 'खेत का नाम',
    animalGroup: 'पशु समूह',
    animalHint: 'उदाहरण: ताज़ी गायें, 42',
    sampleId: 'नमूना ID',
    sampleIdHint: 'पहचानने योग्य छोटा नाम',
    addPhoto: 'नमूना फोटो जोड़ें',
    photoHint: 'वैकल्पिक। फोटो इसी डिवाइस पर रहेगी।',
    removePhoto: 'फोटो हटाएं',
    qrDemo: 'QR पहचान का सिमुलेशन',
    qrHint: 'केवल प्रोटोटाइप। लाइव हार्डवेयर या ID जुड़ी नहीं है।',
    identified: 'सिमुलेटेड ID',
    howMeasure: 'आप कैसे मापना चाहते हैं?',
    demoSensor: 'डेमो सेंसर डेटा',
    demoSensorHint: 'इस प्रवाह को आज़माने के लिए स्पष्ट रूप से चिह्नित रीडिंग।',
    manualDemo: 'मैनुअल डेमो मोड',
    manualDemoHint: 'विश्लेषण देखने के लिए अपनी वैल्यू डालें।',
    simulated: 'सिमुलेटेड',
    manual: 'मैनुअल',
    pH: 'pH',
    moisture: 'नमी',
    temperature: 'तापमान',
    voc: 'VOC इंडेक्स',
    nir: 'NIR पाचन',
    useDemo: 'डेमो रीडिंग उपयोग करें',
    calculate: 'विश्लेषण करें',
    analysis: 'विश्लेषण',
    quality: 'गुणवत्ता',
    spoilageRisk: 'खराब होने का जोखिम',
    score: 'फील्ड स्कोर',
    reasons: 'इस परिणाम के कारण',
    recommendation: 'खिलाने की सलाह',
    feedNow: 'योजना के अनुसार खिलाएं',
    blend: 'बेहतर लॉट के साथ मिलाएं',
    hold: 'रोककर जांचें',
    recommendationFeed: 'स्थिर संकेतों के आधार पर यह लॉट योजना के अनुसार दिया जा सकता है। सेवन पर नजर रखें।',
    recommendationBlend: 'इस लॉट को बेहतर लॉट के साथ मिलाएं। इससे जोखिम व्यावहारिक रूप से कम होगा।',
    recommendationHold: 'अभी इस लॉट को रोकें। गंध, फेस और स्टोरेज सील जांचें।',
    milkSupport: 'दूध निर्णय सहायता',
    milkSupportHint: 'यह दिशात्मक अनुमान है, वादा नहीं। दूध पूरे आहार, स्वास्थ्य और प्रबंधन पर निर्भर है।',
    targetMilk: 'वर्तमान दूध (किग्रा/गाय/दिन)',
    targetHint: 'हाल का झुंड औसत संदर्भ के रूप में लें।',
    estimate: 'दिशात्मक अनुमान',
    confidence: 'विश्वास',
    uncertainty: 'यह गारंटी नहीं है। कई दिनों के वास्तविक रिकॉर्ड से तुलना करें।',
    actualMilk: 'खिलाने के बाद वास्तविक दूध',
    actualHint: 'चाहें तो बाद में तुलना के लिए जोड़ें।',
    skip: 'अभी छोड़ें',
    finish: 'पूरा करें और सुरक्षित करें',
    historyTitle: 'आपका फील्ड इतिहास',
    historyHint: 'इस डिवाइस पर सुरक्षित। रुझानों को चर्चा की शुरुआत मानें।',
    trend: 'स्कोर ट्रेंड',
    detail: 'परीक्षण विवरण',
    deleteTest: 'परीक्षण हटाएं',
    deleteConfirm: 'यह सुरक्षित परीक्षण हटाएं?',
    deleteHint: 'इसे वापस नहीं किया जा सकता।',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    profileTitle: 'आपकी प्रोफ़ाइल',
    profileHint: 'फील्ड सहायक को अपने अनुसार बनाएं। विवरण इसी ब्राउज़र में रहते हैं।',
    yourName: 'आपका नाम',
    farmLocation: 'गांव / स्थान',
    herdSize: 'झुंड का आकार',
    breed: 'नस्ल',
    lactationStage: 'दुग्धावस्था',
    milkYield: 'औसत दूध उत्पादन',
    ration: 'वर्तमान राशन',
    saveProfile: 'प्रोफ़ाइल सुरक्षित करें',
    preferences: 'पसंद',
    languageHint: 'अनुवाद पूरे सहायक में लागू होंगे।',
    english: 'English',
    kannada: 'ಕನ್ನಡ',
    hindi: 'हिन्दी',
    voiceTitle: 'NEXORA वॉइस गाइड',
    voiceHint: 'वर्तमान परीक्षण, रीडिंग या अगले कदम के बारे में पूछें।',
    listening: 'सुन रहा है…',
    tapToSpeak: 'बोलने के लिए दबाएं',
    typedQuestion: 'प्रश्न लिखें',
    ask: 'पूछें',
    quickQuestions: 'त्वरित प्रश्न',
    quickRisk: 'जोखिम ऐसा क्यों है?',
    quickFeed: 'क्या खिलाना चाहिए?',
    quickMilk: 'दूध में क्या देखना चाहिए?',
    stopSpeaking: 'बोलना रोकें',
    micUnsupported: 'इस ब्राउज़र में आवाज़ इनपुट उपलब्ध नहीं। आप लिख सकते हैं।',
    micDenied: 'माइक्रोफ़ोन उपलब्ध नहीं था। आप लिख सकते हैं।',
    welcomeResponse: 'मैं वर्तमान साइलेज जांच समझने में मदद कर सकता हूं। जोखिम, आहार या दूध के बारे में पूछें।',
    scoreResponse: 'वर्तमान फील्ड स्कोर 100 में से {score} है। यह दर्ज रीडिंग पर आधारित दिशात्मक जांच है।',
    riskResponse: 'वर्तमान खराब होने का जोखिम {risk} है। {reasons}',
    feedResponse: '{recommendation} स्क्रीन पर दिए व्यावहारिक कदम से शुरू करें और सेवन देखें।',
    milkResponse: 'दूध अनुमान {confidence} विश्वास वाला दिशात्मक अनुमान है। अगले दिनों में वास्तविक दूध और सेवन देखें।',
    testSavedResponse: 'यह परीक्षण डिवाइस पर सुरक्षित है। इसे इतिहास में देख सकते हैं।',
    saved: 'सुरक्षित',
    unavailable: 'उपलब्ध नहीं',
    close: 'बंद करें',
    loading: 'आपके फील्ड नोट्स लोड हो रहे हैं…',
    error: 'कुछ गलत हुआ',
    retry: 'फिर कोशिश करें',
    noData: 'अभी डेटा नहीं',
    sensorNote: 'इस प्रोटोटाइप में लाइव हार्डवेयर जुड़ा नहीं है।',
  },
};

const demoReadings: Readings = { ph: 4.28, moisture: 37, temperature: 23.4, voc: 31, nir: 51 };

const defaultProfile: Profile = {
  name: 'Ravi Kumar',
  farmName: 'Malenadu Dairy',
  location: 'Chikkamagaluru, Karnataka',
  herdSize: '48',
  breed: 'Holstein cross',
  lactationStage: 'Mid-lactation',
  milkYield: '24.5 kg/cow/day',
  ration: 'Maize silage, hay, concentrate',
  language: 'en',
};

const defaultDraft: TestDraft = {
  farm: defaultProfile.farmName,
  animalGroup: '48 dairy cows',
  sampleId: 'NX-DEMO-0428',
  sampleImage: '',
  mode: 'demo',
  readings: demoReadings,
  milkTarget: '24.5',
  actualMilk: '',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local-first UI still works if storage is unavailable.
  }
}

function readInitialProfile(): Profile {
  const stored = readStorage<Partial<Profile> | null>(STORAGE.profile, null);
  const isScaffoldProfile = stored?.name === 'Field partner' && stored?.farmName === 'My farm';
  return isScaffoldProfile ? defaultProfile : { ...defaultProfile, ...stored };
}

function readInitialTests(): TestRecord[] {
  try {
    const rawTests = localStorage.getItem(STORAGE.tests);
    const rawProfile = localStorage.getItem(STORAGE.profile);
    const storedProfile = rawProfile ? (JSON.parse(rawProfile) as Partial<Profile>) : null;
    const isScaffoldProfile = storedProfile?.name === 'Field partner' && storedProfile?.farmName === 'My farm';
    return rawTests && !(isScaffoldProfile && rawTests === '[]')
      ? readStorage(STORAGE.tests, [])
      : [defaultDemoTest];
  } catch {
    return [defaultDemoTest];
  }
}

function analyze(readings: Readings): Analysis {
  const phScore = Math.max(0, 100 - Math.abs(readings.ph - 4.25) * 52);
  const moistureScore = readings.moisture >= 32 && readings.moisture <= 40 ? 100 : Math.max(45, 100 - Math.abs(readings.moisture - 36) * 5);
  const tempScore = readings.temperature <= 27 ? 100 : Math.max(30, 100 - (readings.temperature - 27) * 9);
  const vocScore = Math.max(30, 100 - readings.voc * 1.2);
  const nirScore = Math.min(100, Math.max(35, readings.nir * 1.75));
  const score = Math.round(phScore * 0.28 + moistureScore * 0.2 + tempScore * 0.18 + vocScore * 0.18 + nirScore * 0.16);
  const reasons: string[] = [];
  if (readings.ph > 4.5) reasons.push('highPh');
  if (readings.moisture > 40) reasons.push('wet');
  if (readings.moisture < 32) reasons.push('dry');
  if (readings.temperature > 27) reasons.push('warm');
  if (readings.voc > 55) reasons.push('voc');
  if (readings.nir < 38) reasons.push('digestibility');
  if (reasons.length === 0) reasons.push('stable');
  const quality = score >= 78 ? 'good' : score >= 58 ? 'watch' : 'risk';
  const risk = score >= 78 ? 'low' : score >= 58 ? 'medium' : 'high';
  const recommendation = score >= 78 ? 'feed' : score >= 58 ? 'blend' : 'hold';
  return { score, quality, risk, reasons, recommendation };
}

const defaultDemoTest: TestRecord = {
  id: 'NX-DEMO-0428',
  createdAt: '2026-09-10T07:40:00.000Z',
  farm: defaultProfile.farmName,
  animalGroup: defaultDraft.animalGroup,
  sampleId: defaultDraft.sampleId,
  mode: 'demo',
  readings: demoReadings,
  analysis: analyze(demoReadings),
  milkTarget: defaultProfile.milkYield.replace(' kg/cow/day', ''),
};

function languageLabel(language: Language) {
  return language === 'kn' ? 'ಕನ್ನಡ' : language === 'hi' ? 'हिन्दी' : 'English';
}

function formatDate(iso: string, language: Language) {
  return new Date(iso).toLocaleDateString(language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function interpolate(value: string, replacements: Record<string, string>) {
  return Object.entries(replacements).reduce((result, [key, replacement]) => result.replace(`{${key}}`, replacement), value);
}

function App() {
  const [profile, setProfile] = useState<Profile>(readInitialProfile);
  const [tests, setTests] = useState<TestRecord[]>(readInitialTests);
  const [draft, setDraft] = useState<TestDraft>(() => readStorage(STORAGE.draft, defaultDraft));
  const [location, setLocation] = useLocation();
  const [voice, setVoice] = useState<VoiceState>({ open: false, listening: false, speaking: false, error: '' });
  const [voiceResponse, setVoiceResponse] = useState('');
  const [voiceQuestion, setVoiceQuestion] = useState('');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const language = profile.language;
  const t = (key: string) => translations[language][key] ?? translations.en[key] ?? key;
  const analysis = useMemo(() => analyze(draft.readings), [draft.readings]);
  const route: RouteName = location === '/test' ? 'test' : location === '/history' ? 'history' : location === '/profile' ? 'profile' : 'home';

  useEffect(() => saveStorage(STORAGE.profile, profile), [profile]);
  useEffect(() => saveStorage(STORAGE.tests, tests), [tests]);
  useEffect(() => saveStorage(STORAGE.draft, draft), [draft]);

  const updateProfile = (patch: Partial<Profile>) => setProfile((current) => ({ ...current, ...patch }));
  const updateDraft = (patch: Partial<TestDraft>) => setDraft((current) => ({ ...current, ...patch }));

  const saveTest = () => {
    const newTest: TestRecord = {
      id: `NX-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      farm: draft.farm || profile.farmName,
      animalGroup: draft.animalGroup || t('herd'),
      sampleId: draft.sampleId || `Sample ${tests.length + 1}`,
      sampleImage: draft.sampleImage || undefined,
      mode: draft.mode,
      readings: draft.readings,
      analysis,
      milkTarget: draft.milkTarget,
      actualMilk: draft.actualMilk || undefined,
    };
    setTests((current) => [newTest, ...current]);
    setDraft(defaultDraft);
    setLocation('/history');
    setVoiceResponse(t('testSavedResponse'));
  };

  const deleteTest = (id: string) => {
    setTests((current) => current.filter((test) => test.id !== id));
    setSelectedTestId(null);
  };

  const askVoice = (question: string) => {
    const assistantContext: AssistantContext = { profile, draft, analysis, tests };
    const response = getAssistantResponse(question, assistantContext, language);
    setVoiceResponse(response);
    speak(response, language, setVoice);
  };

  const speak = (text: string, selectedLanguage: Language, setVoiceState: (value: VoiceState | ((current: VoiceState) => VoiceState)) => void) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage === 'kn' ? 'kn-IN' : selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.onstart = () => setVoiceState((current) => ({ ...current, speaking: true }));
    utterance.onend = () => setVoiceState((current) => ({ ...current, speaking: false }));
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setVoice((current) => ({ ...current, speaking: false }));
  };

  return (
    <div className="app-shell text-foreground">
      <AppShell
        route={route}
        language={language}
        t={t}
        profile={profile}
        onNavigate={(nextRoute) => setLocation(nextRoute === 'home' ? '/' : `/${nextRoute}`)}
        onOpenVoice={() => setVoice((current) => ({ ...current, open: true, error: '' }))}
      >
        {route === 'home' && (
          <HomePage
            profile={profile}
            tests={tests}
            language={language}
            t={t}
            onNavigate={(nextRoute) => setLocation(nextRoute === 'home' ? '/' : `/${nextRoute}`)}
            onSelectTest={setSelectedTestId}
          />
        )}
        {route === 'test' && (
          <TestPage
            draft={draft}
            profile={profile}
            language={language}
            t={t}
            analysis={analysis}
            onUpdate={updateDraft}
            onSave={saveTest}
            onCancel={() => setLocation('/')}
          />
        )}
        {route === 'history' && (
          <HistoryPage
            tests={tests}
            language={language}
            t={t}
            selectedTestId={selectedTestId}
            onSelect={setSelectedTestId}
            onDelete={deleteTest}
            onNavigateToTest={() => setLocation('/test')}
          />
        )}
        {route === 'profile' && (
          <ProfilePage profile={profile} language={language} t={t} onUpdate={updateProfile} />
        )}
      </AppShell>
      <VoiceGuide
        open={voice.open}
        state={voice}
        response={voiceResponse}
        question={voiceQuestion}
        language={language}
        t={t}
        analysis={analysis}
        onClose={() => {
          stopSpeaking();
          setVoice((current) => ({ ...current, open: false, listening: false }));
          setVoiceQuestion('');
        }}
        onAsk={askVoice}
        onQuestionChange={setVoiceQuestion}
        onStartListening={() => {
          const recognitionApi = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike });
          const Recognition = recognitionApi.SpeechRecognition || recognitionApi.webkitSpeechRecognition;
          if (!Recognition) {
            setVoice((current) => ({ ...current, error: t('micUnsupported') }));
            return;
          }
          try {
            const recognition = new Recognition();
            recognition.lang = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
            recognition.interimResults = false;
            recognition.onresult = (event) => {
              const transcript = event.results[0][0].transcript;
              setVoice((current) => ({ ...current, listening: false }));
              setVoiceQuestion(transcript);
              askVoice(transcript);
            };
            recognition.onerror = () => setVoice((current) => ({ ...current, listening: false, error: t('micDenied') }));
            recognition.onend = () => setVoice((current) => ({ ...current, listening: false }));
            recognition.start();
            setVoice((current) => ({ ...current, listening: true, error: '' }));
          } catch {
            setVoice((current) => ({ ...current, listening: false, error: t('micDenied') }));
          }
        }}
        onStopSpeaking={stopSpeaking}
      />
    </div>
  );
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: () => void;
  onend: () => void;
};

function AppShell({
  children,
  route,
  language,
  t,
  profile,
  onNavigate,
  onOpenVoice,
}: {
  children: ReactNode;
  route: RouteName;
  language: Language;
  t: (key: string) => string;
  profile: Profile;
  onNavigate: (route: RouteName) => void;
  onOpenVoice: () => void;
}) {
  const navItems: Array<{ route: RouteName; label: string; icon: typeof Leaf }> = [
    { route: 'home', label: t('home'), icon: Leaf },
    { route: 'test', label: t('test'), icon: ClipboardCheck },
    { route: 'history', label: t('history'), icon: HistoryIcon },
    { route: 'profile', label: t('profile'), icon: UserRound },
  ];
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-[1500px]">
      <aside className="hidden w-64 shrink-0 flex-col bg-[hsl(var(--sidebar))] p-5 text-[hsl(var(--sidebar-foreground))] md:flex">
        <div className="mb-12 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]">
            <Sprout size={19} strokeWidth={2.5} />
          </div>
          <div>
            <div className="brand-wordmark text-sm font-extrabold">NEXORA</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--sidebar-foreground)/.5)]">{t('fieldCompanion')}</div>
          </div>
        </div>
        <nav className="space-y-1" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.route}
                data-testid={`nav-${item.route}`}
                type="button"
                onClick={() => onNavigate(item.route)}
                className={`nav-item w-full text-left ${route === item.route ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.68)] p-4">
          <div className="mb-2 flex items-center gap-2 text-[hsl(var(--sidebar-primary))]"><ShieldCheck size={16} /><span className="text-xs font-bold uppercase tracking-wider">Local first</span></div>
          <p className="text-xs leading-relaxed text-[hsl(var(--sidebar-foreground)/.66)]">Your notes remain on this device. No live sensor is connected.</p>
        </div>
      </aside>
      <main className="min-w-0 flex-1 pb-24 md:pb-8">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/70 bg-[hsl(var(--background)/.86)] px-4 backdrop-blur-xl md:px-9">
          <div className="flex items-center gap-3 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Sprout size={17} /></div>
            <span className="brand-wordmark text-xs font-extrabold">NEXORA</span>
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t('fieldCompanion')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold text-muted-foreground sm:inline">{languageLabel(language)}</span>
            <button data-testid="button-open-voice" type="button" onClick={onOpenVoice} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-primary transition hover:-translate-y-0.5 hover:bg-secondary" aria-label={t('voiceGuide')}><Mic size={18} /></button>
            <button data-testid="button-profile-shortcut" type="button" onClick={() => onNavigate('profile')} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><span className="text-xs font-bold">{(profile.name || 'F').slice(0, 1).toUpperCase()}</span></button>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-9 md:py-10">{children}</div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-[hsl(var(--card)/.94)] px-2 py-2 backdrop-blur-xl md:hidden" aria-label="Mobile">
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.route} data-testid={`mobile-nav-${item.route}`} type="button" onClick={() => onNavigate(item.route)} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${route === item.route ? 'bg-secondary text-primary' : 'text-muted-foreground'}`}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="fade-up">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-accent" />{eyebrow}</div>
        <h1 className="display-title safe-wrap max-w-2xl text-3xl font-extrabold leading-[1.06] md:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function HomePage({ profile, tests, language, t, onNavigate, onSelectTest }: { profile: Profile; tests: TestRecord[]; language: Language; t: (key: string) => string; onNavigate: (route: RouteName) => void; onSelectTest: (id: string) => void }) {
  const average = tests.length ? Math.round(tests.reduce((sum, test) => sum + test.analysis.score, 0) / tests.length) : 0;
  const latest = tests[0];
  return (
    <div>
      <PageHeading eyebrow={`${t('todayAt')} · ${new Date().toLocaleDateString(language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long' })}`} title={`${t('goodMorning')}, ${profile.name === 'Field partner' ? t('fieldCompanion') : profile.name}.`} description={t('farmVisit')} action={<button data-testid="button-start-test" type="button" onClick={() => onNavigate('test')} className="primary-action"><Plus size={18} />{t('startTest')}</button>} />
      <div className="grid gap-4 md:grid-cols-[1.25fr_.75fr]">
        <section className="fade-up-delay-1 overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-[0_18px_50px_hsl(157_35%_17%/.14)] md:p-8">
          <div className="relative z-10 max-w-xl">
            <div className="mb-9 flex items-center justify-between"><span className="rounded-full bg-primary-foreground/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]">{t('quickView')}</span><Activity className="text-accent" size={23} /></div>
            <h2 className="display-title text-3xl font-extrabold leading-tight md:text-4xl">{latest ? `${latest.analysis.score} / 100` : t('noTests')}</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-primary-foreground/70">{latest ? `${latest.farm} · ${latest.sampleId}` : t('noTestsHint')}</p>
            {latest && <div className="mt-7 flex flex-wrap gap-2"><span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${toneClasses[latest.analysis.quality]}`}>{qualityLabel(latest.analysis.quality, language)}</span><span className="rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-semibold">{formatDate(latest.createdAt, language)}</span></div>}
          </div>
          <div className="pointer-events-none absolute -mr-20 -mt-10 hidden h-64 w-64 self-end rounded-full border border-accent/20 md:block" />
        </section>
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<Wheat size={18} />} label={t('herd')} value={profile.herdSize || '—'} suffix="head" />
          <StatCard icon={<FileText size={18} />} label={t('samples')} value={String(tests.length)} suffix="saved" />
          <StatCard icon={<Gauge size={18} />} label={t('averageScore')} value={average ? String(average) : '—'} suffix="/ 100" />
          <StatCard icon={<ShieldCheck size={18} />} label={t('attention')} value={tests.filter((test) => test.analysis.risk !== 'low').length ? String(tests.filter((test) => test.analysis.risk !== 'low').length) : '0'} suffix={t('history')} />
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="soft-card rounded-3xl p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">{t('recentTests')}</h2><p className="mt-1 text-xs text-muted-foreground">{t('historyHint')}</p></div><button data-testid="button-view-history" type="button" onClick={() => onNavigate('history')} className="text-xs font-bold text-primary">{t('openHistory')} <ArrowRight className="inline" size={14} /></button></div>
          {tests.length === 0 ? <EmptyState t={t} onAction={() => onNavigate('test')} /> : <div className="space-y-2">{tests.slice(0, 4).map((test) => <TestListRow key={test.id} test={test} language={language} t={t} onClick={() => onSelectTest(test.id)} />)}</div>}
        </section>
        <section className="soft-card rounded-3xl p-5 md:p-6">
          <div className="mb-5 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/35 text-primary"><Lightbulb size={19} /></div><div><h2 className="text-lg font-extrabold">{t('recommendation')}</h2><p className="text-xs text-muted-foreground">{t('sensorNote')}</p></div></div>
          <div className="rounded-2xl bg-secondary/60 p-4"><p className="text-sm leading-relaxed text-secondary-foreground">{latest ? recommendationText(latest.analysis.recommendation, t) : t('recommendationFeed')}</p><button data-testid="button-guided-test" type="button" onClick={() => onNavigate('test')} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-primary">{t('startTest')} <ArrowRight size={14} /></button></div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, suffix }: { icon: ReactNode; label: string; value: string; suffix: string }) {
  return <div className="soft-card rounded-2xl p-4"><div className="mb-5 flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">{icon}</div><div className="text-2xl font-extrabold tracking-tight">{value}</div><div className="mt-1 text-[11px] font-semibold text-muted-foreground">{label} <span className="text-muted-foreground/60">{suffix}</span></div></div>;
}

function EmptyState({ t, onAction }: { t: (key: string) => string; onAction: () => void }) {
  return <div className="rounded-2xl border border-dashed border-border bg-background/50 px-5 py-10 text-center"><div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary"><Leaf size={20} /></div><p data-testid="empty-tests" className="font-bold">{t('noTests')}</p><p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">{t('noTestsHint')}</p><button data-testid="button-empty-start-test" type="button" onClick={onAction} className="primary-action mt-5 text-xs">{t('startTest')}</button></div>;
}

function TestListRow({ test, language, t, onClick }: { test: TestRecord; language: Language; t: (key: string) => string; onClick: () => void }) {
  return <button data-testid={`row-test-${test.id}`} type="button" onClick={onClick} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent p-3 text-left transition hover:border-border hover:bg-secondary/45"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Wheat size={17} /></div><div className="min-w-0"><div className="truncate text-sm font-bold">{test.sampleId}</div><div className="truncate text-xs text-muted-foreground">{test.farm} · {formatDate(test.createdAt, language)}</div></div></div><div className="text-right"><div className="text-base font-extrabold">{test.analysis.score}</div><span className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${toneClasses[test.analysis.quality]}`}>{qualityLabel(test.analysis.quality, language)}</span></div></button>;
}

function TestPage({ draft, profile, language, t, analysis, onUpdate, onSave, onCancel }: { draft: TestDraft; profile: Profile; language: Language; t: (key: string) => string; analysis: Analysis; onUpdate: (patch: Partial<TestDraft>) => void; onSave: () => void; onCancel: () => void }) {
  const [step, setStep] = useState(0);
  const stepLabels = [t('details'), t('sample'), t('readings'), t('analysis'), t('feedback')];
  const canContinue = step === 0 ? Boolean(draft.farm || profile.farmName) && Boolean(draft.animalGroup) : true;
  const setReading = (key: keyof Readings, value: string) => onUpdate({ readings: { ...draft.readings, [key]: Number(value) } });
  const onImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpdate({ sampleImage: String(reader.result) });
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <PageHeading eyebrow={t('newTest')} title={stepLabels[step]} description={t('sensorNote')} action={<button data-testid="button-cancel-test" type="button" onClick={onCancel} className="secondary-action text-xs"><X size={16} />{t('cancel')}</button>} />
      <div className="mb-8 flex items-center justify-between gap-1 overflow-x-auto pb-1">{stepLabels.map((label, index) => <div key={label} className="flex min-w-max items-center gap-2"><div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${index <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{index < step ? <Check size={14} /> : index + 1}</div><span className={`hidden text-[11px] font-bold sm:inline ${index === step ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>{index < stepLabels.length - 1 && <div className={`h-px w-8 sm:w-12 ${index < step ? 'bg-primary' : 'bg-border'}`} />}</div>)}</div>
      {step === 0 && <section className="soft-card fade-up rounded-3xl p-5 md:p-8"><div className="grid gap-5 md:grid-cols-2"><Field label={t('farmName')} value={draft.farm || profile.farmName} onChange={(value) => onUpdate({ farm: value })} testId="input-test-farm" /><Field label={t('animalGroup')} hint={t('animalHint')} value={draft.animalGroup} onChange={(value) => onUpdate({ animalGroup: value })} testId="input-animal-group" placeholder={t('animalHint')} /><Field label={t('sampleId')} hint={t('sampleIdHint')} value={draft.sampleId} onChange={(value) => onUpdate({ sampleId: value })} testId="input-sample-id" placeholder="S-2025-04" /></div><div className="mt-7 flex flex-wrap items-center gap-3 border-t border-border pt-6"><button data-testid="button-qr-demo" type="button" onClick={() => onUpdate({ sampleId: `SIM-QR-${Math.floor(100 + Math.random() * 900)}` })} className="secondary-action text-xs"><QrCode size={16} />{t('qrDemo')}</button><span className="text-xs text-muted-foreground">{t('qrHint')}</span></div>{draft.sampleId.startsWith('SIM-QR') && <div data-testid="status-qr-identified" className="mt-4 flex items-center gap-2 rounded-xl bg-accent/25 px-3 py-2 text-xs font-bold text-accent-foreground"><ScanLine size={15} />{t('identified')}: {draft.sampleId}</div>}</section>}
      {step === 1 && <section className="soft-card fade-up rounded-3xl p-5 md:p-8"><div className="grid gap-6 md:grid-cols-[.9fr_1.1fr]"><div><h2 className="text-lg font-extrabold">{t('sample')}</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t('photoHint')}</p><label data-testid="label-upload-sample" className="mt-5 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/35 bg-secondary/35 p-4 text-center transition hover:bg-secondary">{draft.sampleImage ? <img data-testid="img-sample-preview" src={draft.sampleImage} alt="Silage sample preview" className="h-44 w-full rounded-xl object-cover" /> : <><ImagePlus className="mb-3 text-primary" size={30} /><span className="text-sm font-bold">{t('addPhoto')}</span><span className="mt-1 text-xs text-muted-foreground">{t('photoHint')}</span></>}<input data-testid="input-sample-photo" type="file" accept="image/*" className="hidden" onChange={onImage} /></label>{draft.sampleImage && <button data-testid="button-remove-photo" type="button" onClick={() => onUpdate({ sampleImage: '' })} className="mt-3 text-xs font-bold text-destructive">{t('removePhoto')}</button>}</div><div className="rounded-2xl bg-primary p-6 text-primary-foreground"><Camera size={22} className="text-accent" /><h3 className="mt-7 text-xl font-extrabold">{t('sampleId')}</h3><p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">{draft.sampleId || '—'}<br />{t('qrHint')}</p><div className="mt-8 border-t border-primary-foreground/15 pt-4 text-xs text-primary-foreground/60">{t('sensorNote')}</div></div></div></section>}
      {step === 2 && <section className="soft-card fade-up rounded-3xl p-5 md:p-8"><h2 className="text-lg font-extrabold">{t('howMeasure')}</h2><div className="mt-5 grid gap-3 md:grid-cols-2"><ModeCard active={draft.mode === 'demo'} onClick={() => onUpdate({ mode: 'demo', readings: demoReadings })} title={t('demoSensor')} hint={t('demoSensorHint')} badge={t('simulated')} icon={<Activity size={19} />} testId="button-mode-demo" /><ModeCard active={draft.mode === 'manual'} onClick={() => onUpdate({ mode: 'manual' })} title={t('manualDemo')} hint={t('manualDemoHint')} badge={t('manual')} icon={<Pencil size={19} />} testId="button-mode-manual" /></div><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><ReadingField label={t('pH')} value={draft.readings.ph} unit="" onChange={(value) => setReading('ph', value)} testId="input-ph" min="2" max="7" step="0.01" /><ReadingField label={t('moisture')} value={draft.readings.moisture} unit="%" onChange={(value) => setReading('moisture', value)} testId="input-moisture" min="10" max="70" /><ReadingField label={t('temperature')} value={draft.readings.temperature} unit="°C" onChange={(value) => setReading('temperature', value)} testId="input-temperature" min="0" max="60" step="0.1" /><ReadingField label={t('voc')} value={draft.readings.voc} unit="idx" onChange={(value) => setReading('voc', value)} testId="input-voc" min="0" max="100" /><ReadingField label={t('nir')} value={draft.readings.nir} unit="%" onChange={(value) => setReading('nir', value)} testId="input-nir" min="0" max="100" /></div><div className="mt-6 flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-2 text-xs text-muted-foreground"><Cloud size={14} className="text-primary" />{t('sensorNote')}</div></section>}
      {step === 3 && <AnalysisPanel analysis={analysis} readings={draft.readings} language={language} t={t} />}
      {step === 4 && <section className="soft-card fade-up rounded-3xl p-5 md:p-8"><div className="grid gap-6 lg:grid-cols-[1fr_.85fr]"><div><div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><Droplets size={19} /></div><div><h2 className="text-lg font-extrabold">{t('milkSupport')}</h2><p className="text-xs text-muted-foreground">{t('milkSupportHint')}</p></div></div><Field label={t('targetMilk')} hint={t('targetHint')} value={draft.milkTarget} onChange={(value) => onUpdate({ milkTarget: value })} testId="input-target-milk" type="number" /><div className={`mt-5 rounded-2xl border p-5 ${toneClasses[analysis.quality]}`}><div className="text-xs font-bold uppercase tracking-wider">{t('estimate')}</div><div className="mt-2 text-3xl font-extrabold">{milkEstimate(draft.milkTarget, analysis)} <span className="text-sm font-semibold">kg/cow/day</span></div><div className="mt-2 text-xs font-semibold">{t('confidence')}: {toneLabel(analysis.quality, language)}</div><p className="mt-3 text-xs leading-relaxed">{t('uncertainty')}</p></div></div><div><Field label={t('actualMilk')} hint={t('actualHint')} value={draft.actualMilk} onChange={(value) => onUpdate({ actualMilk: value })} testId="input-actual-milk" type="number" placeholder="Optional" /><div className="mt-6 rounded-2xl border border-accent/35 bg-accent/15 p-4"><div className="flex items-center gap-2 text-sm font-bold"><ShieldCheck size={17} className="text-primary" />{t('simulated')}</div><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t('sensorNote')} {t('uncertainty')}</p></div></div></div></section>}
      <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row"><button data-testid="button-step-back" type="button" onClick={() => step === 0 ? onCancel() : setStep((current) => current - 1)} className="secondary-action"><ArrowLeft size={16} />{step === 0 ? t('cancel') : t('back')}</button>{step < 4 ? <button data-testid="button-step-continue" type="button" disabled={!canContinue} onClick={() => setStep((current) => current + 1)} className="primary-action disabled:cursor-not-allowed disabled:opacity-45">{step === 2 ? t('calculate') : t('continue')}<ArrowRight size={16} /></button> : <button data-testid="button-save-test" type="button" onClick={onSave} className="primary-action"><Save size={17} />{t('finish')}</button>}</div>
    </div>
  );
}

function Field({ label, hint, value, onChange, testId, type = 'text', placeholder }: { label: string; hint?: string; value: string; onChange: (value: string) => void; testId: string; type?: string; placeholder?: string }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-bold">{label}</span>{hint && <span className="mb-2 block text-xs text-muted-foreground">{hint}</span>}<input data-testid={testId} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="field-input" /></label>;
}

function ModeCard({ active, onClick, title, hint, badge, icon, testId }: { active: boolean; onClick: () => void; title: string; hint: string; badge: string; icon: ReactNode; testId: string }) {
  return <button data-testid={testId} type="button" onClick={onClick} className={`rounded-2xl border p-4 text-left transition ${active ? 'border-primary bg-secondary/70 shadow-[0_0_0_3px_hsl(var(--primary)/.1)]' : 'border-border bg-card hover:bg-secondary/40'}`}><div className="flex items-start justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div><span className={`rounded-full px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{badge}</span></div><div className="mt-4 text-sm font-extrabold">{title}</div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p></button>;
}

function ReadingField({ label, value, unit, onChange, testId, min, max, step }: { label: string; value: number; unit: string; onChange: (value: string) => void; testId: string; min: string; max: string; step?: string }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold text-muted-foreground">{label}</span><div className="relative"><input data-testid={testId} type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} className="field-input pr-12 font-bold" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">{unit}</span></div></label>;
}

function AnalysisPanel({ analysis, readings, language, t }: { analysis: Analysis; readings: Readings; language: Language; t: (key: string) => string }) {
  const scoreTone = analysis.quality;
  const riskStatusTone = riskTone(analysis.risk);
  const recommendationStatusTone = recommendationTone(analysis.recommendation);
  const sensors: Array<{ key: keyof Readings; label: string; value: number; unit: string }> = [
    { key: 'ph', label: t('pH'), value: readings.ph, unit: '' },
    { key: 'moisture', label: t('moisture'), value: readings.moisture, unit: '%' },
    { key: 'temperature', label: t('temperature'), value: readings.temperature, unit: '°C' },
    { key: 'voc', label: t('voc'), value: readings.voc, unit: 'idx' },
    { key: 'nir', label: t('nir'), value: readings.nir, unit: '%' },
  ];
  return <section className="fade-up grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><div className={`soft-card rounded-3xl p-6 md:p-8 ${tonePanelClasses[scoreTone]}`}><div className="flex items-center justify-between"><span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">{t('simulated')}</span><Gauge className="text-accent" size={20} /></div><div className="mt-12 text-6xl font-extrabold tracking-[-.06em]">{analysis.score}</div><div className="mt-1 text-sm font-semibold text-white/70">{t('score')} / 100</div><div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/20 pt-4"><div><div className="text-xs text-white/65">{t('quality')}</div><div data-testid="status-quality" className="mt-2 inline-flex rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-sm font-extrabold">{qualityLabel(analysis.quality, language)}</div></div><div><div className="text-xs text-white/65">{t('spoilageRisk')}</div><div data-testid="status-risk" className="mt-2 inline-flex rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-sm font-extrabold">{riskLabel(analysis.risk, language)}</div></div></div></div><div className="soft-card rounded-3xl p-5 md:p-8"><div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><Lightbulb size={19} /></div><div><h2 className="text-lg font-extrabold">{t('analysis')}</h2><p className="text-xs text-muted-foreground">{t('reasons')}</p></div></div><div className="space-y-3">{analysis.reasons.map((reason) => <div key={reason} data-testid={`reason-${reason}`} className="flex gap-3 rounded-xl bg-secondary/50 p-3 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-primary" /><span>{reasonLabel(reason, language)}</span></div>)}</div><div className={`mt-6 rounded-2xl border p-4 ${toneClasses[recommendationStatusTone]}`}><div className="text-xs font-bold uppercase tracking-wider">{t('recommendation')}</div><div className="mt-2 font-extrabold">{recommendationLabel(analysis.recommendation, language)}</div><p className="mt-2 text-sm leading-relaxed">{recommendationText(analysis.recommendation, t)}</p></div><div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{sensors.map((sensor) => { const tone = readingTone(sensor.key, sensor.value); return <div key={sensor.key} className={`rounded-xl border p-3 ${toneClasses[tone]}`}><div className="text-[10px] font-bold uppercase tracking-wider">{sensor.label}</div><div className="mt-1 text-lg font-extrabold">{sensor.value}{sensor.unit}</div><div className="mt-1 text-[10px] font-bold uppercase">{toneLabel(tone, language)}</div></div>; })}</div></div></section>;
}

function ProfilePage({ profile, language, t, onUpdate }: { profile: Profile; language: Language; t: (key: string) => string; onUpdate: (patch: Partial<Profile>) => void }) {
  const [saved, setSaved] = useState(false);
  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };
  return <div><PageHeading eyebrow={t('profile')} title={t('profileTitle')} description={t('profileHint')} /><section className="soft-card rounded-3xl p-5 md:p-8"><div className="mb-7 flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-extrabold text-primary-foreground">{(profile.name || 'F').slice(0, 1).toUpperCase()}</div><div><h2 className="text-lg font-extrabold">{profile.name}</h2><p className="text-sm text-muted-foreground">{profile.farmName}</p></div></div><div className="grid gap-5 md:grid-cols-2"><Field label={t('yourName')} value={profile.name} onChange={(value) => onUpdate({ name: value })} testId="input-profile-name" /><Field label={t('farmName')} value={profile.farmName} onChange={(value) => onUpdate({ farmName: value })} testId="input-profile-farm" /><Field label={t('farmLocation')} value={profile.location} onChange={(value) => onUpdate({ location: value })} testId="input-profile-location" /><Field label={t('herdSize')} value={profile.herdSize} onChange={(value) => onUpdate({ herdSize: value })} testId="input-profile-herd" type="number" /><Field label={t('breed')} value={profile.breed || ''} onChange={(value) => onUpdate({ breed: value })} testId="input-profile-breed" /><Field label={t('lactationStage')} value={profile.lactationStage || ''} onChange={(value) => onUpdate({ lactationStage: value })} testId="input-profile-lactation" /><Field label={t('milkYield')} value={profile.milkYield || ''} onChange={(value) => onUpdate({ milkYield: value })} testId="input-profile-yield" /><Field label={t('ration')} value={profile.ration || ''} onChange={(value) => onUpdate({ ration: value })} testId="input-profile-ration" /></div><button data-testid="button-save-profile" type="button" onClick={save} className="primary-action mt-7"><Save size={16} />{saved ? t('saved') : t('saveProfile')}</button></section><section className="soft-card mt-5 rounded-3xl p-5 md:p-8"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><Languages size={19} /></div><div><h2 className="text-lg font-extrabold">{t('preferences')}</h2><p className="mt-1 text-sm text-muted-foreground">{t('languageHint')}</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{(['en', 'kn', 'hi'] as Language[]).map((option) => <button key={option} data-testid={`button-language-${option}`} type="button" onClick={() => onUpdate({ language: option })} className={`flex items-center justify-between rounded-xl border p-3 text-left text-sm font-bold transition ${language === option ? 'border-primary bg-secondary text-primary' : 'border-border bg-card hover:bg-secondary/50'}`}><span>{option === 'en' ? t('english') : option === 'kn' ? t('kannada') : t('hindi')}</span>{language === option && <Check size={16} />}</button>)}</div></section></div>;
}

function HistoryPage({ tests, language, t, selectedTestId, onSelect, onDelete, onNavigateToTest }: { tests: TestRecord[]; language: Language; t: (key: string) => string; selectedTestId: string | null; onSelect: (id: string | null) => void; onDelete: (id: string) => void; onNavigateToTest: () => void }) {
  const selected = tests.find((test) => test.id === selectedTestId);
  return <div><PageHeading eyebrow={t('history')} title={t('historyTitle')} description={t('historyHint')} action={<button data-testid="button-history-new-test" type="button" onClick={onNavigateToTest} className="primary-action"><Plus size={17} />{t('startTest')}</button>} />{tests.length === 0 ? <EmptyState t={t} onAction={onNavigateToTest} /> : <><section className="soft-card rounded-3xl p-5 md:p-7"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">{t('trend')}</h2><p className="mt-1 text-xs text-muted-foreground">{t('historyHint')}</p></div><BarChart3 size={20} className="text-primary" /></div><div className="flex h-40 items-end gap-2 border-b border-border px-1 pb-0">{tests.slice(0, 12).reverse().map((test) => <button data-testid={`bar-test-${test.id}`} key={test.id} type="button" onClick={() => onSelect(test.id)} className="group relative flex h-full flex-1 items-end" title={`${test.sampleId}: ${test.analysis.score}`}><span className={`w-full rounded-t-lg transition group-hover:opacity-70 ${test.analysis.risk === 'low' ? 'bg-chart-1' : test.analysis.risk === 'medium' ? 'bg-chart-2' : 'bg-chart-4'}`} style={{ height: `${Math.max(13, test.analysis.score)}%` }} /></button>)}</div><div className="mt-3 flex justify-between text-[10px] font-semibold text-muted-foreground"><span>{tests.length > 1 ? formatDate(tests[Math.min(11, tests.length - 1)].createdAt, language) : formatDate(tests[0].createdAt, language)}</span><span>{formatDate(tests[0].createdAt, language)}</span></div></section><section className="mt-5 grid gap-3">{tests.map((test) => <TestListRow key={test.id} test={test} language={language} t={t} onClick={() => onSelect(test.id)} />)}</section></>}{selected && <TestDetail test={selected} language={language} t={t} onClose={() => onSelect(null)} onDelete={() => onDelete(selected.id)} />}</div>;
}

function TestDetail({ test, language, t, onClose, onDelete }: { test: TestRecord; language: Language; t: (key: string) => string; onClose: () => void; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const readingCards: Array<{ key: keyof Readings; label: string; value: number; unit: string }> = [
    { key: 'ph', label: t('pH'), value: test.readings.ph, unit: '' },
    { key: 'moisture', label: t('moisture'), value: test.readings.moisture, unit: '%' },
    { key: 'temperature', label: t('temperature'), value: test.readings.temperature, unit: '°C' },
    { key: 'voc', label: t('voc'), value: test.readings.voc, unit: 'idx' },
    { key: 'nir', label: t('nir'), value: test.readings.nir, unit: '%' },
  ];
  return <div className="fixed inset-0 z-40 flex items-end justify-center bg-primary/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"><div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-3xl md:p-8"><div className="mb-6 flex items-start justify-between"><div><div className="text-xs font-bold uppercase tracking-wider text-primary">{t('detail')}</div><h2 className="display-title mt-2 text-3xl font-extrabold">{test.sampleId}</h2><p className="mt-1 text-sm text-muted-foreground">{test.farm} · {formatDate(test.createdAt, language)}</p></div><button data-testid="button-close-detail" type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary"><X size={17} /></button></div>{test.sampleImage && <img data-testid="img-detail-sample" src={test.sampleImage} alt="Saved silage sample" className="mb-5 h-36 w-full rounded-2xl object-cover" />}<div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><MiniMetric label={t('score')} value={`${test.analysis.score}`} tone={test.analysis.quality} /><MiniMetric label={t('quality')} value={qualityLabel(test.analysis.quality, language)} tone={test.analysis.quality} /><MiniMetric label={t('spoilageRisk')} value={riskLabel(test.analysis.risk, language)} tone={riskTone(test.analysis.risk)} /><MiniMetric label={t('temperature')} value={`${test.readings.temperature}°C`} tone={readingTone('temperature', test.readings.temperature)} /></div><div className={`mt-5 rounded-2xl border p-4 ${toneClasses[recommendationTone(test.analysis.recommendation)]}`}><div className="text-xs font-bold uppercase tracking-wider">{t('recommendation')}</div><p className="mt-2 text-sm font-bold">{recommendationText(test.analysis.recommendation, t)}</p></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">{readingCards.map((reading) => { const tone = readingTone(reading.key, reading.value); return <div key={reading.key} className={`rounded-xl border p-3 ${toneClasses[tone]}`}><div className="text-[10px] font-bold uppercase">{reading.label}</div><div className="mt-1 font-extrabold">{reading.value}{reading.unit}</div><div className="mt-1 text-[10px] font-bold uppercase">{toneLabel(tone, language)}</div></div>; })}</div><div className="mt-7 flex items-center justify-between border-t border-border pt-5">{confirming ? <div className="flex w-full flex-wrap items-center justify-between gap-3"><div><div className="text-sm font-bold">{t('deleteConfirm')}</div><div className="text-xs text-muted-foreground">{t('deleteHint')}</div></div><div className="flex gap-2"><button data-testid="button-cancel-delete" type="button" onClick={() => setConfirming(false)} className="secondary-action text-xs">{t('cancel')}</button><button data-testid="button-confirm-delete" type="button" onClick={onDelete} className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground">{t('delete')}</button></div></div> : <><span className="text-xs font-semibold text-muted-foreground">{test.mode === 'demo' ? t('simulated') : t('manual')}</span><button data-testid="button-delete-test" type="button" onClick={() => setConfirming(true)} className="inline-flex items-center gap-2 text-xs font-bold text-destructive"><Trash2 size={15} />{t('deleteTest')}</button></>}</div></div></div>;
}

function MiniMetric({ label, value, tone }: { label: string; value: string; tone?: StatusTone }) {
  return <div className={`rounded-xl border p-3 ${tone ? toneClasses[tone] : 'border-border bg-background/50'}`}><div className="text-[10px] font-bold uppercase tracking-wider">{label}</div><div className="mt-1 truncate text-sm font-extrabold">{value}</div></div>;
}

function VoiceGuide({ open, state, response, question, language, t, analysis, onClose, onAsk, onQuestionChange, onStartListening, onStopSpeaking }: { open: boolean; state: VoiceState; response: string; question: string; language: Language; t: (key: string) => string; analysis: Analysis; onClose: () => void; onAsk: (question: string) => void; onQuestionChange: (question: string) => void; onStartListening: () => void; onStopSpeaking: () => void }) {
  if (!open) return null;
  const quick = [t('quickRisk'), t('quickFeed'), t('quickMilk')];
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/30 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="w-full max-w-lg rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-3xl md:p-7"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 text-primary"><Volume2 size={17} /><span className="text-xs font-bold uppercase tracking-[0.16em]">{t('voiceTitle')}</span></div><h2 className="display-title mt-2 text-2xl font-extrabold">{t('voiceHint')}</h2></div><button data-testid="button-close-voice" type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary"><X size={17} /></button></div><div className="mt-6 flex flex-col items-center rounded-2xl bg-primary p-6 text-center text-primary-foreground"><button data-testid="button-start-listening" type="button" onClick={onStartListening} className={`flex h-16 w-16 items-center justify-center rounded-full ${state.listening ? 'pulse-dot bg-accent text-accent-foreground' : 'bg-primary-foreground text-primary'} transition`}><Mic size={24} /></button><div className="mt-3 text-sm font-bold">{state.listening ? t('listening') : t('tapToSpeak')}</div><div className="mt-1 text-xs text-primary-foreground/65">{languageLabel(language)}</div></div>{state.error && <div data-testid="status-voice-error" className="mt-4 flex gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive"><MicOff size={15} className="shrink-0" />{state.error}</div>}{response && <div data-testid="text-voice-response" className="mt-4 rounded-2xl border border-border bg-secondary/55 p-4 text-sm leading-relaxed">{response}</div>}<div className="mt-5"><div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('quickQuestions')}</div><div className="flex flex-wrap gap-2">{quick.map((item) => <button key={item} data-testid={`button-quick-question-${item}`} type="button" onClick={() => onAsk(item)} className="secondary-action text-xs">{item}</button>)}</div></div><form className="mt-5 flex gap-2" onSubmit={(event) => { event.preventDefault(); if (question.trim()) { onAsk(question.trim()); onQuestionChange(''); } }}><input data-testid="input-voice-question" value={question} onChange={(event) => onQuestionChange(event.target.value)} placeholder={t('typedQuestion')} className="field-input min-w-0" /><button data-testid="button-ask-voice" type="submit" className="primary-action shrink-0 px-4">{t('ask')}</button></form><div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="text-xs text-muted-foreground">{t('score')}: <strong>{analysis.score}</strong></span>{state.speaking && <button data-testid="button-stop-speaking" type="button" onClick={onStopSpeaking} className="inline-flex items-center gap-2 text-xs font-bold text-primary"><VolumeX size={15} />{t('stopSpeaking')}</button>}</div></div></div>;
}

function reasonLabel(reason: string, language: Language) {
  const labels: Record<Language, Record<string, string>> = {
    en: { highPh: 'pH is above the usual stable range.', wet: 'Moisture is higher than the comfortable range.', dry: 'Moisture is lower than the comfortable range.', warm: 'Temperature may increase aerobic activity.', voc: 'VOC index is elevated and deserves a closer look.', digestibility: 'NIR digestibility is below the stronger range.', stable: 'pH, moisture, temperature, VOC, and NIR are sitting in a stable window.' },
    kn: { highPh: 'pH ಸಾಮಾನ್ಯ ಸ್ಥಿರ ವ್ಯಾಪ್ತಿಗಿಂತ ಹೆಚ್ಚಾಗಿದೆ.', wet: 'ತೇವಾಂಶ ಆರಾಮದಾಯಕ ವ್ಯಾಪ್ತಿಗಿಂತ ಹೆಚ್ಚಾಗಿದೆ.', dry: 'ತೇವಾಂಶ ಆರಾಮದಾಯಕ ವ್ಯಾಪ್ತಿಗಿಂತ ಕಡಿಮೆಯಾಗಿದೆ.', warm: 'ತಾಪಮಾನ ಏರೋಬಿಕ್ ಚಟುವಟಿಕೆಯನ್ನು ಹೆಚ್ಚಿಸಬಹುದು.', voc: 'VOC ಸೂಚ್ಯಂಕ ಹೆಚ್ಚಾಗಿದೆ; ಇನ್ನಷ್ಟು ಗಮನಿಸಿ.', digestibility: 'NIR ಜೀರ್ಣತೆ ಉತ್ತಮ ವ್ಯಾಪ್ತಿಗಿಂತ ಕಡಿಮೆಯಾಗಿದೆ.', stable: 'pH, ತೇವಾಂಶ, ತಾಪಮಾನ, VOC ಮತ್ತು NIR ಸ್ಥಿರ ವ್ಯಾಪ್ತಿಯಲ್ಲಿವೆ.' },
    hi: { highPh: 'pH सामान्य स्थिर सीमा से ऊपर है।', wet: 'नमी आरामदायक सीमा से अधिक है।', dry: 'नमी आरामदायक सीमा से कम है।', warm: 'तापमान एरोबिक गतिविधि बढ़ा सकता है।', voc: 'VOC इंडेक्स बढ़ा हुआ है; ध्यान से देखें।', digestibility: 'NIR पाचन बेहतर सीमा से नीचे है।', stable: 'pH, नमी, तापमान, VOC और NIR स्थिर सीमा में हैं।' },
  };
  return labels[language][reason] ?? labels.en[reason];
}

function recommendationLabel(recommendation: Analysis['recommendation'], language: Language) {
  const labels: Record<Language, Record<Analysis['recommendation'], string>> = {
    en: { feed: 'Feed as planned', blend: 'Blend with a better lot', hold: 'Hold and inspect' },
    kn: { feed: 'ಯೋಜನೆಯಂತೆ ನೀಡಿ', blend: 'ಉತ್ತಮ ಲಾಟ್ ಜೊತೆ ಮಿಶ್ರಣಿಸಿ', hold: 'ತಡೆದು ಪರಿಶೀಲಿಸಿ' },
    hi: { feed: 'योजना के अनुसार खिलाएं', blend: 'बेहतर लॉट के साथ मिलाएं', hold: 'रोककर जांचें' },
  };
  return labels[language][recommendation];
}

function recommendationText(recommendation: Analysis['recommendation'], t: (key: string) => string) {
  return recommendation === 'feed' ? t('recommendationFeed') : recommendation === 'blend' ? t('recommendationBlend') : t('recommendationHold');
}

function qualityLabel(quality: Analysis['quality'], language: Language) {
  const labels: Record<Language, Record<Analysis['quality'], string>> = {
    en: { good: 'Good', watch: 'Watch', risk: 'At risk' },
    kn: { good: 'ಉತ್ತಮ', watch: 'ಗಮನಿಸಿ', risk: 'ಅಪಾಯ' },
    hi: { good: 'अच्छा', watch: 'ध्यान दें', risk: 'जोखिम' },
  };
  return labels[language][quality];
}

function riskLabel(risk: Analysis['risk'], language: Language) {
  const labels: Record<Language, Record<Analysis['risk'], string>> = {
    en: { low: 'Low', medium: 'Medium', high: 'High' },
    kn: { low: 'ಕಡಿಮೆ', medium: 'ಮಧ್ಯಮ', high: 'ಹೆಚ್ಚು' },
    hi: { low: 'कम', medium: 'मध्यम', high: 'अधिक' },
  };
  return labels[language][risk];
}

function milkEstimate(target: string, analysis: Analysis) {
  const base = Number(target) || 0;
  if (!base) return '—';
  const directional = base + (analysis.score - 70) * 0.018;
  return directional.toFixed(1);
}

export default function RootApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <ErrorBoundary resetKey="nexora">
            <App />
          </ErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}