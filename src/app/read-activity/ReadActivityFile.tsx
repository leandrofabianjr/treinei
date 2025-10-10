'use client';

import FitFileUploader from '@/components/features/FitFileUploader';
import SpeedChart from '@/components/features/SpeedChart';
import JsonViewer from '@/components/ui/JsonViewer';
import type { FitData } from '@/lib/fit-file';
import {
  buildTrainningData,
  TrainningTemplateIntervalType,
  type TrainningData,
  type TrainningTemplate,
} from '@/lib/trainning';
import {
  getColorForIntensity,
  getIntensityFromDescription,
  getLabelForSpeedBounds,
  getLabelForUnit,
  getLaberForIntensity,
} from '@/lib/trainning/utils';
import {
  ZeppTrainningInterval,
  ZeppTrainningIntervalCircle,
  ZeppTrainningIntervalNode,
  ZeppTrainningTemplate,
} from '@/lib/zepp-trainning-template';
import { convertZeppTrainningIntervalNodeToTrainningInterval } from '@/lib/zepp-trainning-template/utils';
import {
  Box,
  Button,
  Center,
  Collapsible,
  Float,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { HiCheck } from 'react-icons/hi';

export default function ReadActivityFile({
  trainning,
  zeppTemplate,
}: {
  trainning: TrainningTemplate;
  zeppTemplate: ZeppTrainningTemplate;
}) {
  const [trainningData, setTrainningData] = useState<TrainningData | null>(
    null
  );

  const onDataFitRead = (fitData: FitData | null) => {
    if (fitData && trainning) {
      const trainningData = buildTrainningData(fitData, trainning);
      setTrainningData(trainningData);
    }
  };

  if (trainningData) {
    return (
      <Stack gap={4}>
        <TrainningStatistics zeppTemplate={zeppTemplate} data={trainningData} />
        <SpeedChart data={trainningData} />
      </Stack>
    );
  }

  return (
    <Center>
      <Stack gap={8} minWidth={{ md: 'md' }}>
        <TrainningTemplateViewer
          trainningTemplate={trainning}
          zeppTrainningTemplate={zeppTemplate}
        />

        <FitFileUploader onDataRead={onDataFitRead} />

        <Button>Confirmar</Button>
      </Stack>
    </Center>
  );
}

function TrainningTemplateViewer({
  zeppTrainningTemplate,
  trainningTemplate,
}: {
  zeppTrainningTemplate: ZeppTrainningTemplate;
  trainningTemplate: TrainningTemplate;
}) {
  return (
    <Collapsible.Root unmountOnExit>
      <Collapsible.Trigger width={'full'}>
        <Box
          display="flex"
          alignItems="center"
          gap="4"
          bg="bg.emphasized"
          padding={'4'}
        >
          <HiCheck color="green" /> Template de treino lido
        </Box>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Box padding="4" borderWidth="1px">
          <Heading>Template de treino Zepp:</Heading>
          <JsonViewer data={zeppTrainningTemplate} expandUntilLevel={0} />
          <Heading>Template de treino:</Heading>
          <JsonViewer data={trainningTemplate} expandUntilLevel={0} />
        </Box>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function TrainningStatistics({
  data,
  zeppTemplate,
}: {
  data: TrainningData;
  zeppTemplate: ZeppTrainningTemplate;
}) {
  return (
    <Box width="fit-content" borderRadius="md" overflow="hidden">
      {zeppTemplate.trainingIntervals.children.map((child, i) => (
        <TrainningStatisticsInterval key={i} interval={child} />
      ))}
    </Box>
  );
}

function TrainningStatisticsInterval({
  interval,
}: {
  interval: ZeppTrainningInterval;
}) {
  if (interval.type === 'NODE') {
    return (
      <TrainningStatisticsIntervalNode
        interval={interval as ZeppTrainningIntervalNode}
      />
    );
  }

  if (interval.type === 'CIRCLE') {
    return (
      <TrainningStatisticsIntervalCircle
        interval={interval as ZeppTrainningIntervalCircle}
      />
    );
  }

  return <JsonViewer data={interval} expandUntilLevel={0} />;
}

function TrainningStatisticsIntervalNode({
  interval,
}: {
  interval: ZeppTrainningIntervalNode;
}) {
  const trainning =
    convertZeppTrainningIntervalNodeToTrainningInterval(interval);
  const { type, description, unit, unitValue, speedBounds } = trainning;
  const typeLabel = {
    [TrainningTemplateIntervalType.WarmUp]: 'Aquecimento',
    [TrainningTemplateIntervalType.Trainning]: 'Treino',
    [TrainningTemplateIntervalType.Rest]: 'Descanso',
    [TrainningTemplateIntervalType.Recovery]: 'Recuperação',
    [TrainningTemplateIntervalType.Cooldown]: 'Arrefecimento',
  }[type];

  const intensity = getIntensityFromDescription(description);
  const colorIntensity = getColorForIntensity(intensity);
  const labelIntensity = getLaberForIntensity(intensity);
  const unitLabel = getLabelForUnit(unit, unitValue);
  const paceBounds = speedBounds ? getLabelForSpeedBounds(speedBounds) : '';

  return (
    <Box
      position="relative"
      paddingBottom="5"
      paddingX="4"
      bgColor={colorIntensity}
    >
      <Float
        placement="bottom-end"
        transform={'translate(-50%, -50%)'}
        right="1"
        bottom="0"
      >
        <Text
          color="gray.200"
          fontSize="sm"
          fontWeight="bold"
          textTransform="uppercase"
        >
          {typeLabel}
        </Text>
      </Float>
      <HStack>
        <Heading>{unitLabel}</Heading>
        <Heading>{labelIntensity}</Heading>
        {paceBounds && <Heading>({paceBounds})</Heading>}
      </HStack>

      {/* <JsonViewer data={interval} expandUntilLevel={0} />
      <JsonViewer data={trainning} expandUntilLevel={0} /> */}
    </Box>
  );
}

function TrainningStatisticsIntervalCircle({
  interval: { children, circleTimes },
}: {
  interval: ZeppTrainningIntervalCircle;
}) {
  return (
    <Box display="flex" flexDirection="row" alignItems="stretch">
      <Center bg="bg.emphasized" padding="4">
        <Text as="span" fontSize="lg">
          {circleTimes}x
        </Text>
      </Center>
      <Box flex="1">
        {children.map((child, i) => (
          <TrainningStatisticsInterval key={i} interval={child} />
        ))}
      </Box>
    </Box>
  );
}
