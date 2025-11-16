
export interface Athlete {
  id: string;
  name: string;
  dob: string;
  injuryHistory: string;
  assessments: {
    bioimpedance: Bioimpedance[];
    isometricStrength: IsometricStrength[];
    generalStrength: GeneralStrength[];
    cmj: Cmj[];
    vo2max: Vo2max[];
  };
}

export interface Assessment {
  id: string;
  date: string;
  observations?: string;
}

export interface Bioimpedance extends Assessment {
  weight: number; // kg
  fatPercentage: number;
  muscleMass: number; // kg
  visceralFat: number;
  hydration: number; // %
}

export interface IsometricStrength extends Assessment {
  quadricepsR: number; // kgf
  quadricepsL: number; // kgf
  hamstringsR: number; // kgf
  hamstringsL: number; // kgf
}

export enum GeneralStrengthExercise {
  HALF_SQUAT = "Meio Agachamento",
  ROW = "Remada",
  BENCH_PRESS = "Supino",
}

export interface GeneralStrength extends Assessment {
  exercise: GeneralStrengthExercise;
  load: number; // kg
}

export interface Cmj extends Assessment {
  height: number; // cm
  power: number; // W
  depth: number; // cm
  unilateralJumpR?: number; // cm
  unilateralJumpL?: number; // cm
  load?: number; // kg
}

export interface Vo2max extends Assessment {
  vo2max: number; // ml/(kg*min)
  maxHeartRate: number; // bpm
  thresholdHeartRate: number; // bpm
  maxVentilation: number; // l/min
  thresholdVentilation: number; // l/min
  maxLoad: number; // km/h
  thresholdLoad: number; // km/h
  vam: number; // km/h
  rec10s: number; // bpm
  rec30s: number; // bpm
  rec60s: number; // bpm
  score: number; // 0-100
}

export type AssessmentType = 'bioimpedance' | 'isometricStrength' | 'generalStrength' | 'cmj' | 'vo2max';
export type AssessmentData = Bioimpedance | IsometricStrength | GeneralStrength | Cmj | Vo2max;

export interface IQRatio {
  ratio: number;
  status: 'good' | 'bad';
}