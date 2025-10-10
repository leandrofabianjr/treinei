import {
  addPaceToRecord,
  calculatePaceDecimal,
  formatPace,
  type FitData,
  type FitDataRecord,
} from "@/lib/fit-file";
import {
  calculateDistanceBetweenTimes,
  getEndOfIntervalFromDistance,
} from "./distance-calculation";
import {
  TrainningIntervalIntensity,
  TrainningTemplateIntervalUnit,
  type TrainningData,
  type TrainningInterval,
  type TrainningTemplate,
  type TrainningTemplateInterval
} from "./types";

const addPaceToRecords = (records: FitDataRecord[]) => {
  return records.map(addPaceToRecord);
};

export const getIntensityFromDescription = (description: string): TrainningIntervalIntensity => {
  const intensity =
    {
      caminhada: TrainningIntervalIntensity.Walking,
      trote: TrainningIntervalIntensity.Jogging,
      z1: TrainningIntervalIntensity.Z1,
      z2: TrainningIntervalIntensity.Z2,
      z3: TrainningIntervalIntensity.Z3,
      z4: TrainningIntervalIntensity.Z4,
    }[description?.trim()?.toLowerCase()] || TrainningIntervalIntensity.None;

  return intensity;
}

export const getLaberForIntensity = (intensity: TrainningIntervalIntensity): string => {
  const label = {
    [TrainningIntervalIntensity.Walking]: 'Caminhada',
    [TrainningIntervalIntensity.Jogging]: 'Trote',
    [TrainningIntervalIntensity.Z1]: 'Z1',
    [TrainningIntervalIntensity.Z2]: 'Z2',
    [TrainningIntervalIntensity.Z3]: 'Z3',
    [TrainningIntervalIntensity.Z4]: 'Z4',
  } as const;

  return label[intensity as keyof typeof label] || '';
}

export const getLabelForUnit = (unit: TrainningTemplateIntervalUnit, unitValue: number): string => {
  switch (unit) {
    case TrainningTemplateIntervalUnit.Time:
      {
        const minDecimal = unitValue / 60;
        const hours = Math.floor(minDecimal / 60);
        const min = Math.floor(minDecimal);
        const sec = Math.round((minDecimal - min) * 60);
        return [
          hours > 0 ? `${hours}h` : '',
          min > 0 ? `${min}m` : '',
          sec > 0 ? `${sec}s` : '',
        ].join(' ');
      }
    case TrainningTemplateIntervalUnit.Distance:
      {
        if (unitValue >= 1000) {
          return `${(unitValue / 1000).toFixed(2)}km`;
        } else {
          return `${unitValue}m`;
        }
      }
    default:
      return 'Unidade não reconhecida';
  }
}

export const getLabelForSpeedBounds = (bounds: { min: number, max: number }): string => {
  const minPace = formatPace(calculatePaceDecimal(bounds.min));
  const maxPace = formatPace(calculatePaceDecimal(bounds.max));
  return `${minPace} - ${maxPace}`
}

const getNextIntervalData = (
  startTime: Date,
  interval: TrainningTemplateInterval,
  fitData: FitData
): TrainningInterval => {
  const { unit, unitValue, speedBounds, description } = interval;

  const intensity = getIntensityFromDescription(description);

  const intervalData = {
    startTime,
    intensity,
    description,
    speedBounds,
  } as TrainningInterval;

  switch (unit) {
    case TrainningTemplateIntervalUnit.Time:
      {
        const endTime = new Date(startTime.getTime() + unitValue * 1000);
        const distanceInMeters = calculateDistanceBetweenTimes(
          fitData.records,
          startTime,
          endTime
        );
        intervalData.endTime = endTime;
        intervalData.durationInSeconds = unitValue;
        intervalData.distanceInMeters = distanceInMeters;
      }
      break;
    case TrainningTemplateIntervalUnit.Distance:
      {
        const endOfInterval = getEndOfIntervalFromDistance(
          fitData.records,
          startTime,
          unitValue
        );
        if (!endOfInterval) {
          throw new Error("Fim de intervalo não encontrado!");
        }
        const endTime = endOfInterval.record.timestamp;
        const durationInSeconds =
          (endTime.getTime() - startTime.getTime()) / 1000;
        intervalData.endTime = endTime;
        intervalData.durationInSeconds = durationInSeconds;
        intervalData.distanceInMeters = unitValue;
      }
      break;
  }

  return intervalData;
};

const createIntervalsData = (
  fitData: FitData,
  trainning: TrainningTemplate
): TrainningInterval[] => {
  let currentTime = fitData.activity.timestamp;
  const intervals: TrainningInterval[] = trainning.intervals.map((interval) => {
    const intervalData = getNextIntervalData(currentTime, interval, fitData);
    currentTime = intervalData.endTime;
    return intervalData;
  });

  return intervals;
};

const createEachDistanceTimesInSeconds = (
  fitData: FitData,
  eachMeters = 1000
): number[] => {
  const kmTimesInSeconds: number[] = [];
  const startTime = fitData.activity.timestamp;
  let startRecord: FitDataRecord | null = fitData.records[0];
  while (startRecord) {
    const endOfInterval = getEndOfIntervalFromDistance(
      fitData.records,
      startRecord.timestamp,
      eachMeters
    );
    if (!endOfInterval) break;
    const { index, record } = endOfInterval;
    kmTimesInSeconds.push(
      (record.timestamp.getTime() - startTime.getTime()) / 1000
    );
    startRecord =
      index == fitData.records.length - 1 ? null : fitData.records[index + 1];
  }

  return kmTimesInSeconds;
};

const createStatistics = (intervals: TrainningInterval[]) => {
  const totalTime = intervals.reduce(
    (total, interval) => total + interval.durationInSeconds,
    0
  );
  const totalDistance = intervals.reduce(
    (total, interval) => total + interval.distanceInMeters,
    0
  );
  const averageSpeed = totalDistance / totalTime;
  const averagePace = calculatePaceDecimal(averageSpeed);
  return { totalTime, totalDistance, averageSpeed, averagePace };
};

export const buildTrainningData = (
  fitData: FitData,
  trainning: TrainningTemplate
): TrainningData => {
  const records = addPaceToRecords(fitData.records);
  const data = { ...fitData, records };
  const intervals = createIntervalsData(data, trainning);
  const kmTimesInSeconds = createEachDistanceTimesInSeconds(data);
  const statistics = createStatistics(intervals);
  return {
    template: trainning,
    data,
    intervals,
    kmTimesInSeconds,
    statistics,
  };
};

export const colorsByIntensity = {
  [TrainningIntervalIntensity.Walking]: '#3366AA',
  [TrainningIntervalIntensity.Jogging]: '#4499CC',
  [TrainningIntervalIntensity.Z1]: '#66CCCC',
  [TrainningIntervalIntensity.Z2]: '#FF9966',
  [TrainningIntervalIntensity.Z3]: '#CC3333',
  [TrainningIntervalIntensity.Z4]: '#990000',
};

export const getColorForIntensity = (intensity: TrainningIntervalIntensity): string => {
  const i = intensity as keyof typeof colorsByIntensity;
  return colorsByIntensity[i] || 'gray';
};