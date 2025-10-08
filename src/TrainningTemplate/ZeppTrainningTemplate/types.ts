export interface ZeppTrainningInterval {
  type: string;
}

export interface ZeppTrainningIntervalParent {
  type: 'PARENT';
  children: ZeppTrainningInterval[];
}

export interface ZeppTrainningIntervalCircle {
  type: 'CIRCLE';
  circleTimes: number;
  children: ZeppTrainningInterval[];
}

export interface ZeppTrainningIntervalNode {
  type: 'NODE';
  trainingInterval: ZeppTrainningIntervalNodeData;
}
export interface ZeppTrainningIntervalNodeData {
  intervalType: string;
  intervalUnit: string;
  intervalUnitValue: string;
  alertRule: string;
  alertRuleDetail: string;
  lengthUnit: number;
  intervalDesc: string;
}

export interface ZeppTrainningTemplate {
  title: string;
  description: string;
  trainingIntervals: ZeppTrainningIntervalParent;
}