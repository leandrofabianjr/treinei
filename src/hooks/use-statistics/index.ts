import { TrainningIntervalIntensity, type TrainningInterval } from "../../App";
import { addPaceToRecord, calculatePaceDecimal, type FitData, type FitDataRecord } from "../../fit-file";
import { TrainningTemplateIntervalUnit, type TrainningTemplate, type TrainningTemplateInterval } from "../../TrainningTemplate";
import { calculateDistanceBetweenTimes, getEndOfIntervalFromDistance } from "./calculate-distance-between-times";

export const useStatistics = () => {

  const addPaceToRecords = (records: FitDataRecord[]) => {
    return records.map(addPaceToRecord);
  }

  const getNextIntervalData = (startTime: Date, interval: TrainningTemplateInterval, fitData: FitData): TrainningInterval => {
    const { unit, unitValue, speedBounds, description } = interval;
    const intensity = {
      'caminhada': TrainningIntervalIntensity.Walking,
      'trote': TrainningIntervalIntensity.Jogging,
      'z1': TrainningIntervalIntensity.Z1,
      'z2': TrainningIntervalIntensity.Z2,
      'z3': TrainningIntervalIntensity.Z3,
      'z4': TrainningIntervalIntensity.Z4
    }[description?.trim()?.toLowerCase()] || TrainningIntervalIntensity.None;

    const intervalData = { startTime, intensity, description, speedBounds } as TrainningInterval;

    switch (unit) {
      case TrainningTemplateIntervalUnit.Time:
        {
          const endTime = new Date(startTime.getTime() + unitValue * 1000);
          const distanceInMeters = calculateDistanceBetweenTimes(fitData.records, startTime, endTime);
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
          const durationInSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
          intervalData.endTime = endTime;
          intervalData.durationInSeconds = durationInSeconds;
          intervalData.distanceInMeters = unitValue;
        }
        break;
    }

    return intervalData;
  }


  const createIntervalsData = (fitData: FitData, trainning: TrainningTemplate): TrainningInterval[] => {
    let currentTime = fitData.activity.timestamp;
    const intervals: TrainningInterval[] = trainning.intervals.map((interval) => {
      const intervalData = getNextIntervalData(currentTime, interval, fitData);
      currentTime = intervalData.endTime;
      return intervalData;
    });

    return intervals;
  };

  const createEachDistanceTimesInSeconds = (fitData: FitData, eachMeters = 1000): number[] => {
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
      kmTimesInSeconds.push((record.timestamp.getTime() - startTime.getTime()) / 1000);
      startRecord = index == fitData.records.length - 1 ? null : fitData.records[index + 1];
    }

    return kmTimesInSeconds;
  }

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
    createEachDistanceTimesInSeconds,
    createStatistics,
  };
};