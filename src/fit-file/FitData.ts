export interface FitDataActivity {
  timestamp: Date;
  total_timer_time: number;
  num_sessions: number;
  type: string;
  event: string;
  event_type: string;
  local_timestamp: string;
}

export interface FitDataSession {
  timestamp: Date;
  start_time: Date;
  sport: string;
  sub_sport: string;
  total_distance: number;
  total_timer_time: number;
  total_elapsed_time: number;
  total_ascent: number;
  total_descent: number;
  total_calories: number;
  avg_heart_rate: number;
  max_heart_rate: number;
  min_heart_rate: number;
  total_training_effect: number;
  total_anaerobic_effect: number;
  avg_step_length: number
}

export interface FitDataLap {
  start_time: Date;
  timestamp: Date;
  total_elapsed_time: number;
  total_distance: number;
  total_descent: number;
  total_ascent: number;
}

export interface FitDataRecord {
  timestamp: Date;
  position_lat: number;
  position_long: number;
  speed: number;
  heart_rate: number;
  cadence: number;
  altitude: number;
  power: number;
  elapsed_time: number;
  timer_time: number;
}

export interface FitDataEvent {
  timestamp: Date;
  event: string;
  event_type: string;
}

export interface FitData {
  protocolVersion: number;
  profileVersion: number;
  activity: FitDataActivity;
  sessions: FitDataSession[];
  laps: FitDataLap[];
  records: FitDataRecordWithPace[];
  events: FitDataEvent[];
};


export type FitDataRecordWithPace = FitDataRecord & {
  decimalPace: number;
  formattedPace: string;
};