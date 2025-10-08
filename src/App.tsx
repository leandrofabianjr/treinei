import { Container, Heading } from '@chakra-ui/react';
import { useState } from 'react';
import { allExpanded, defaultStyles, JsonView } from 'react-json-view-lite';
import FitFileUploader from './components/FitFileUploader';
import SpeedChart from './components/SpeedChart';
import Nav from './components/ui/nav';
import type { FitData } from './fit-file';
import { buildTrainningData } from './TrainningTemplate/hooks/use-statistics';
import type {
  TrainningData,
  TrainningTemplate,
} from './TrainningTemplate/types';
import { ZeppTrainningTemplateUploader } from './TrainningTemplate/ZeppTrainningTemplate';

function App() {
  const [trainningData, setTrainningData] = useState<TrainningData | null>(
    null
  );
  const [trainning, setTrainning] = useState<TrainningTemplate | null>(null);

  // useEffect(() => {
  //   const trainningData = loadTrainningTemplate();
  //   setTrainning(trainningData);
  // }, []);

  const onTrainningTemplateRead = (trainning: TrainningTemplate | null) => {
    if (trainning) {
      setTrainning(trainning);
    }
  };

  const onDataFitRead = (fitData: FitData | null) => {
    if (fitData && trainning) {
      const trainningData = buildTrainningData(fitData, trainning);
      setTrainningData(trainningData);
    }
  };

  return (
    <>
      <Nav />
      <Container>
        <Heading>.FIT File Parser</Heading>
        <ZeppTrainningTemplateUploader onDataRead={onTrainningTemplateRead} />

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
      </Container>
    </>
  );
}

export default App;
