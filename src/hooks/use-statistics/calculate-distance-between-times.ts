import type { FitDataRecord } from "../../fit-file";

// Radius of Earth in meters (mean value)
const R_EARTH_METERS = 6371000;

/**
 * Calculates the distance between two GPS coordinates using the Haversine formula.
 * @param lat1 Latitude of point 1 (in degrees).
 * @param lon1 Longitude of point 1 (in degrees).
 * @param lat2 Latitude of point 2 (in degrees).
 * @param lon2 Longitude of point 2 (in degrees).
 * @returns The distance in meters (m).
 */
const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  // 1. Convert degrees to radians
  const toRad = (angle: number) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in meters
  return R_EARTH_METERS * c;
}

/**
 * Calculates the running distance (in meters) between two specified times 
 * by summing the Haversine distance between consecutive records.
 * * @param records Array of FIT record messages.
 * @param startTime Target start time (Date object).
 * @param endTime Target end time (Date object).
 * @returns The calculated distance in meters.
 */
export function calculateDistanceBetweenTimes(
  records: FitDataRecord[],
  startTime: Date,
  endTime: Date
): number {
  if (!records || records.length < 2 || startTime.getTime() >= endTime.getTime()) {
    return 0;
  }

  // Convert target times to Unix milliseconds
  const targetStartMs = startTime.getTime();
  const targetEndMs = endTime.getTime();

  let totalDistanceMeters = 0;
  let previousRecord: FitDataRecord | null = null;
  let startedTracking = false;

  for (const currentRecord of records) {
    const currentTimeMs = currentRecord.timestamp.getTime();

    // Start tracking when the timestamp hits or exceeds the startTime
    if (currentTimeMs >= targetStartMs && !startedTracking) {
      startedTracking = true;
    }

    // Stop processing if we've passed the end time
    if (currentTimeMs > targetEndMs) {
      break;
    }

    // 2. Core Distance Calculation (only runs if started and a previous point exists)
    if (startedTracking && previousRecord) {
      // Calculate Haversine distance from the previous point to the current point
      const segmentDistance = haversineDistance(
        previousRecord.position_lat,
        previousRecord.position_long,
        currentRecord.position_lat,
        currentRecord.position_long
      );
      totalDistanceMeters += segmentDistance;
    }

    // 3. Update the previous record for the next iteration
    // The previous record only needs to be updated if the current record is the start 
    // point or inside the window.
    if (currentTimeMs >= targetStartMs) {
      previousRecord = currentRecord;
    }
  }

  // Round the result for practical use
  return Math.round(totalDistanceMeters * 100) / 100;
}

/**
 * Finds the end of an interval from a given start time and distance.
 *
 * This function goes through a list of FitDataRecords, starting from the given start time,
 * and calculates the total distance traveled between each record. It stops when the total
 * distance traveled reaches the given distance, and returns the record at which
 * this happens.
 *
 * If the given start time is earlier than the first record in the list, or if the given
 * distance is less than the distance traveled between the first two records, the function
 * will return null.
 *
 * @param records The list of FitDataRecords to search through.
 * @param startTime The start time of the interval.
 * @param distance The total distance to be traveled.
 * @returns The record at which the total distance traveled reaches the given distance, or null if not found.
 */
export const getEndOfIntervalFromDistance = (
  records: FitDataRecord[],
  startTime: Date,
  distance: number
): { index: number, record: FitDataRecord } | null => {
  if (!records || records.length < 2) {
    return null;
  }

  let totalDistanceMeters = 0;
  let previousRecord: FitDataRecord | null = null;
  let startedTracking = false;

  for (const [index, currentRecord] of records.entries()) {
    const currentTimeMs = currentRecord.timestamp.getTime();

    // Start tracking when the timestamp hits or exceeds the startTime
    if (currentTimeMs >= startTime.getTime() && !startedTracking) {
      startedTracking = true;
    }

    // 2. Core Distance Calculation (only runs if started and a previous point exists)
    if (startedTracking && previousRecord) {
      // Calculate Haversine distance from the previous point to the current point
      const segmentDistance = haversineDistance(
        previousRecord.position_lat,
        previousRecord.position_long,
        currentRecord.position_lat,
        currentRecord.position_long
      );
      totalDistanceMeters += segmentDistance;
    }

    // 3. Update the previous record for the next iteration
    // The previous record only needs to be updated if the current record is the start 
    // point or inside the window.
    if (currentTimeMs >= startTime.getTime()) {
      previousRecord = currentRecord;
    }

    if (totalDistanceMeters >= distance) {
      return { index, record: currentRecord };
    }
  }

  return null;
}