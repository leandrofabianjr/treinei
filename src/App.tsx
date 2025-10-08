import { useEffect, useState } from 'react';
import { allExpanded, defaultStyles, JsonView } from 'react-json-view-lite';
import './App.css';
import FitFileUploader from './components/FitFileUploader';
import SpeedChart from './components/SpeedChart';
import type { FitData } from './fit-file';
import { useStatistics } from './hooks/use-statistics';
import {
  loadTrainningTemplate,
  type TrainningTemplate,
} from './TrainningTemplate';

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

function App() {
  const [trainningData, setTrainningData] = useState<TrainningData | null>(
    null
  );
  const [trainning, setTrainning] = useState<TrainningTemplate | null>(null);
  const {
    addPaceToRecords,
    createIntervalsData,
    createStatistics,
    createEachDistanceTimesInSeconds,
  } = useStatistics();

  useEffect(() => {
    const trainningData = loadTrainningTemplate();
    setTrainning(trainningData);
  }, []);

  const onDataFitRead = (fitData: FitData | null) => {
    console.log('passou aqui');
    if (fitData && trainning) {
      const records = addPaceToRecords(fitData.records);
      const sortedRecords = [...records].sort((a, b) => a.speed - b.speed);
      console.log(sortedRecords.map((r) => ({ t: r.timestamp, s: r.speed })));

      const data = { ...fitData, records };
      const intervals = createIntervalsData(data, trainning);
      const kmTimesInSeconds = createEachDistanceTimesInSeconds(data);
      const statistics = createStatistics(intervals);
      console.log(kmTimesInSeconds);
      setTrainningData({
        template: trainning,
        data,
        intervals,
        kmTimesInSeconds,
        statistics,
      });
    } else {
      setTrainningData(trainningData);
    }
  };

  return (
    <>
      <div>
        <h2>.FIT File Parser</h2>
        {/* <ZeppTrainningTemplate onDataRead={setTrainning} /> */}

        {trainning && (
          <>
            <FitFileUploader onDataRead={onDataFitRead} />

            {trainningData && (
              <div>
                <h3>Fit Data:</h3>
                <SpeedChart data={trainningData} />
                <JsonView
                  data={trainningData}
                  clickToExpandNode={true}
                  shouldExpandNode={allExpanded}
                  style={defaultStyles}
                />
              </div>
            )}

            <div>
              <h3>Trainning:</h3>
              <JsonView
                data={trainning}
                clickToExpandNode={true}
                shouldExpandNode={allExpanded}
                style={defaultStyles}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;
