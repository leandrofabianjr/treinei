import type { FitData } from "@/fit-file";

export enum TrainningTemplateIntervalType {
  WarmUp,
  Trainning,
  Rest,
  Recovery,
  Cooldown,
}

export enum TrainningTemplateIntervalUnit {
  Time,
  Distance,
}

export interface TrainningTemplateInterval {
  type: TrainningTemplateIntervalType;
  unit: TrainningTemplateIntervalUnit;
  unitValue: number;
  speedBounds?: { min: number; max: number; };
  description: string;
}

export interface TrainningTemplate {
  title: string;
  description: string;
  intervals: TrainningTemplateInterval[];
}

export enum TrainningIntervalIntensity {
  None,
  Walking,
  Jogging,
  Z1,
  Z2,
  Z3,
  Z4,
}

export interface TrainningInterval {
  startTime: Date;
  endTime: Date;
  durationInSeconds: number;
  distanceInMeters: number;
  speedBounds?: { min: number; max: number };
  intensity: TrainningIntervalIntensity;
  description?: string;
}

export interface TrainningData {
  template: TrainningTemplate;
  data: FitData;
  intervals: TrainningInterval[];
  kmTimesInSeconds: number[];
  statistics: {
    totalTime: number;
    totalDistance: number;
    averageSpeed: number;
    averagePace: number;
  };
}
