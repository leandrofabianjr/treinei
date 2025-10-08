import FitParser from 'fit-file-parser';
import { type FitDataRecord, type FitDataRecordWithPace } from './FitData';

export const readFitFile = (
  buffer: ArrayBuffer,
  callback: (err: Error | null, data: unknown) => void
) => {
  // Initialize the FitParser instance
  const fitParser = new FitParser({
    // Configuration options (optional)
    force: true, // If true, continues parsing even if there are errors
    speedUnit: 'm/s',
    lengthUnit: 'm',
    temperatureUnit: 'celsius',
    // ... other options
  });
  return fitParser.parse(buffer, callback);
}

/**
   * Calculates pace in decimal minutes per kilometer (min/km) from speed in m/s.
   * @param speedMs The speed in meters per second.
   * @returns The pace in decimal minutes per kilometer, or Infinity if stopped.
   */
export const calculatePaceDecimal = (speedMs: number): number => {
  // If speed is 0, return Infinity or a placeholder
  if (speedMs <= 0) {
    return 0;
  }

  // 1. Convert m/s to km/h (speedMs * 3.6)
  const speedKmH = speedMs * 3.6;

  // 2. Convert km/h to min/km (60 / speedKmH)
  const totalMinutesPerKm = 60 / speedKmH;

  return totalMinutesPerKm;
};

/**
 * Formats decimal minutes into M:SS string format.
 * @param decimalMinutes The pace in decimal minutes (e.g., 10.55).
 * @returns The pace as a formatted string (e.g., "10:33").
 */
export const formatPace = (decimalMinutes: number): string => {
  if (decimalMinutes === 0) {
    return `0'00"`; // Or "Stopped"
  }

  const minutes = Math.floor(decimalMinutes);
  // Calculate the seconds component: (decimal part * 60) and round to nearest second
  const seconds = Math.round((decimalMinutes - minutes) * 60);

  // Pad the seconds with a leading zero if necessary
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${minutes}'${formattedSeconds}"`;
};


/**
 * Adds pace in decimal minutes per kilometer and formatted
 * string to a FitDataRecord.
 *
 * @param record The FitDataRecord to add pace to.
 * @returns The modified FitDataRecord with pace added.
 */
export const addPaceToRecord = (record: FitDataRecord): FitDataRecordWithPace => {
  const decimalPace = calculatePaceDecimal(record.speed);
  const formattedPace = formatPace(decimalPace);
  return {
    ...record,
    speed: Number(record.speed.toFixed(2)),
    decimalPace: Number(decimalPace.toFixed(2)),
    formattedPace,
  } as FitDataRecordWithPace;
};
