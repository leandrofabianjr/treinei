import { useEffect, useState } from 'react';
import { allExpanded, defaultStyles, JsonView } from 'react-json-view-lite';
import './App.css';
import FitFileUploader from './components/FitFileUploader';
import SpeedChart from './components/SpeedChart';
import type { FitData } from './fit-file';
import {
  loadTrainningTemplate,
  type TrainningTemplate,
} from './TrainningTemplate';

function App() {
  const [data, setData] = useState<FitData | null>(null);
  const [trainning, setTrainning] = useState<TrainningTemplate | null>(null);

  useEffect(() => {
    const trainningData = loadTrainningTemplate();
    setTrainning(trainningData);
  }, []);

  return (
    <>
      <div>
        <h2>.FIT File Parser</h2>
        <FitFileUploader onDataRead={setData} />
        {/* <ZeppTrainningTemplate onDataRead={setTrainning} /> */}

        {data && (
          <div>
            <h3>Fit Data:</h3>
            <SpeedChart data={data} trainning={trainning} />
            {/* <JsonView
            data={data}
            clickToExpandNode={true}
            shouldExpandNode={allExpanded}
            style={defaultStyles}
          /> */}
          </div>
        )}

        {trainning && (
          <div>
            <h3>Trainning:</h3>
            <JsonView
              data={trainning}
              clickToExpandNode={true}
              shouldExpandNode={allExpanded}
              style={defaultStyles}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default App;
