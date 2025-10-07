import trainningData from './trainning-data.json';
import type { ZeppTrainningInterval, ZeppTrainningIntervalCircle, ZeppTrainningIntervalNode, ZeppTrainningIntervalParent, ZeppTrainningTemplate } from './ZeppTrainningTemplate';

export const loadTrainningTemplate = (): TrainningTemplate => {
  return convertZeppTrainningTemplateToTrainningTemplate(
    trainningData as ZeppTrainningTemplate
  );
}

const convertZeppTrainningIntervalNodeToTrainningInterval = ({ trainingInterval: intervalData }: ZeppTrainningIntervalNode): TrainningTemplateInterval => {
  const type = {
    '0': TrainningTemplateIntervalType.WarmUp,
    '1': TrainningTemplateIntervalType.Trainning,
    '2': TrainningTemplateIntervalType.Rest,
    '3': TrainningTemplateIntervalType.Recovery,
    '4': TrainningTemplateIntervalType.Cooldown,
  }[intervalData.intervalType]!;

  const unit = {
    '0': TrainningTemplateIntervalUnit.Distance,
    '1': TrainningTemplateIntervalUnit.Time,
  }[intervalData.intervalUnit]!;

  const speedBounds = Number(intervalData.alertRule) == 1
    ? {
      min: 1 / Number(intervalData.alertRuleDetail.split('-')[0]) * 1000,
      max: 1 / Number(intervalData.alertRuleDetail.split('-')[1]) * 1000,
    }
    : undefined;

  return {
    type,
    unit,
    unitValue: Number(intervalData.intervalUnitValue),
    speedBounds,
    description: intervalData.intervalDesc,
  } as TrainningTemplateInterval;
}

const convertZeppTrainningIntervalToTrainningInterval = (zeppInterval: ZeppTrainningInterval): TrainningTemplateInterval[] => {
  switch (zeppInterval.type) {
    case 'PARENT':
      {
        const { children } = (zeppInterval as ZeppTrainningIntervalParent);
        return children.map((child) =>
          convertZeppTrainningIntervalToTrainningInterval(child)
        ).flat();
      }
    case 'CIRCLE':
      {
        const { circleTimes, children } = (zeppInterval as ZeppTrainningIntervalCircle);
        const childrenIntervals = children.map((child) =>
          convertZeppTrainningIntervalToTrainningInterval(child)
        ).flat();
        return Array(circleTimes).fill(childrenIntervals).flat();
      }
    case 'NODE':
      {
        const nodeInterval = (zeppInterval as ZeppTrainningIntervalNode);
        return [convertZeppTrainningIntervalNodeToTrainningInterval(nodeInterval)];
      }
    default:
      return [];
  }
}

const convertZeppTrainningTemplateToTrainningTemplate = (zeppTrainningTemplate: ZeppTrainningTemplate) => {
  const { title, description, trainingIntervals } = zeppTrainningTemplate;

  const intervals = convertZeppTrainningIntervalToTrainningInterval(trainingIntervals);


  const trainning: TrainningTemplate = { title, description, intervals };
  return trainning;
}


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