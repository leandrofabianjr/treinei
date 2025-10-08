import { type TrainningTemplate } from './types';
// import { convertZeppTrainningTemplateToTrainningTemplate, type ZeppTrainningTemplate } from './ZeppTrainningTemplate';
// import trainningData from './trainning-data.json';
// export const loadLocalTrainningTemplate = (): TrainningTemplate => {
//   return convertZeppTrainningTemplateToTrainningTemplate(
//     trainningData as ZeppTrainningTemplate
//   );
// }

interface TrainningTemplateReaderProps {
  /**
   * Callback function that receives the parsed JSON object.
   * @param data The JSON object fetched from the URL.
   */
  onDataRead: (data: TrainningTemplate | null) => void;
}

export type TrainningTemplateReader = React.FC<TrainningTemplateReaderProps>;