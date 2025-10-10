import {
  convertZeppTrainningTemplateToTrainningTemplate,
  ZeppTrainningTemplate,
} from '@/lib/zepp-trainning-template';
import { Button, Code, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import ReadActivityFile from '../../ReadActivityFile';

async function getZeppTrainningTemplateFromUrl(
  strUrl: string
): Promise<ZeppTrainningTemplate> {
  const parsedUrl = new URL(strUrl.toString());
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error('URL inválida');
  }

  const url = parsedUrl.searchParams.has('data')
    ? new URL(parsedUrl.searchParams.get('data') as string)
    : parsedUrl;

  console.log('url', url.toString());
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  console.log('data', response);
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
}

export default async function TrainningTemplateValidation({
  url: strUrl,
}: {
  url: string;
}) {
  try {
    const zeppTrainningTemplate = await getZeppTrainningTemplateFromUrl(strUrl);

    const trainningTemplate = convertZeppTrainningTemplateToTrainningTemplate(
      zeppTrainningTemplate
    );

    return (
      <ReadActivityFile
        trainning={trainningTemplate}
        zeppTemplate={zeppTrainningTemplate}
      />
    );
  } catch (error) {
    return (
      <Stack>
        <Text as="p">Erro ao ler o template</Text>
        <Code size="lg" colorPalette={'red'} variant="surface">
          {error?.toString() || ''}
        </Code>
        <Button asChild>
          <Link href="/read-activity/trainning-template">Voltar</Link>
        </Button>
      </Stack>
    );
  }
}
