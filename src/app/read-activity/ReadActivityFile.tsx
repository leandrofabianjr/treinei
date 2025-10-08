"use client";

import FitFileUploader from "@/components/features/FitFileUploader";
import SpeedChart from "@/components/features/SpeedChart";
import type { FitData } from "@/lib/fit-file";
import {
  buildTrainningData,
  type TrainningData,
  type TrainningTemplate,
} from "@/lib/trainning";
import { Heading } from "@chakra-ui/react";
import { useState } from "react";
import { allExpanded, defaultStyles, JsonView } from "react-json-view-lite";

export default function ReadActivityFile() {
  const [trainningData, setTrainningData] = useState<TrainningData | null>(
    null
  );
  const [trainning, setTrainning] = useState<TrainningTemplate | null>(null);

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
      <Heading>.FIT File Parser</Heading>

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
    </>
  );
}
