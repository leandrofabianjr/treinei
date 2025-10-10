'use server';

import {
  Box,
  Button,
  Center,
  Skeleton,
  Stack,
  Textarea,
} from '@chakra-ui/react';
import { Suspense } from 'react';
import TrainningTemplateValidation from './components/TrainningTemplateValidation';

export default async function TrainningTemplateReader({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const url = params.url?.toString() || '';

  if (!url) {
    return (
      <Center>
        <form>
          <Stack gap={8} minWidth={{ md: 'md' }}>
            <Textarea
              name="url"
              placeholder="Informe a URL do template de treino"
            />
            <Button type="submit">Ler template de treino</Button>
          </Stack>
        </form>
      </Center>
    );
  }

  return (
    <Suspense fallback={<TrainningTemplateValidationSkeleton />}>
      <TrainningTemplateValidation url={url} />
    </Suspense>
  );
}

async function TrainningTemplateValidationSkeleton() {
  return (
    <Box>
      <Skeleton variant="shine" width="full" height="8" />
      <Skeleton variant="shine" width="full" height="8" />
    </Box>
  );
}
