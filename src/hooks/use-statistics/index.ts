import type { TrainningInterval } from "../../App";
import { addPaceToRecord, calculatePaceDecimal, type FitData, type FitDataRecord } from "../../fit-file";
import { TrainningTemplateIntervalUnit, type TrainningTemplate, type TrainningTemplateInterval } from "../../TrainningTemplate";
import { calculateDistanceBetweenTimes, getEndOfIntervalFromDistance } from "./calculate-distance-between-times";

export const useStatistics = () => {

  const addPaceToRecords = (records: FitDataRecord[]) => {
    return records.map(addPaceToRecord);
  }

  const getNextIntervalData = (startTime: Date, interval: TrainningTemplateInterval, fitData: FitData): TrainningInterval => {
    switch (interval.unit) {
      case TrainningTemplateIntervalUnit.Time:
        {
          const endTime = new Date(startTime.getTime() + interval.unitValue * 1000);
          const durationInSeconds = interval.unitValue;
          const distanceInMeters = calculateDistanceBetweenTimes(fitData.records, startTime, endTime);
          return { startTime, endTime, durationInSeconds, distanceInMeters };
        }
      case TrainningTemplateIntervalUnit.Distance:
        {
          const endOfInterval = getEndOfIntervalFromDistance(
            fitData.records,
            startTime,
            interval.unitValue
          );
          if (!endOfInterval) {
            throw new Error("Fim de intervalo não encontrado!");
          }
          const endTime = endOfInterval.timestamp;
          const durationInSeconds = (endOfInterval.timestamp.getTime() - startTime.getTime()) / 1000;
          const distanceInMeters = interval.unitValue;
          return { startTime, endTime, durationInSeconds, distanceInMeters };
        }
      default:
        throw new Error("Unidade de intervalo não suportada!");
    }
  }


  const createIntervalsData = (fitData: FitData, trainning: TrainningTemplate): TrainningInterval[] => {
    let currentTime = fitData.activity.timestamp;
    const intervals: TrainningInterval[] = trainning.intervals.slice(0, -1).map((interval) => {
      const intervalData = getNextIntervalData(currentTime, interval, fitData);
      currentTime = intervalData.endTime;
      return intervalData;
    });

    return intervals;
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

  return {
    addPaceToRecords,
    createIntervalsData,
    createStatistics,
  };
};