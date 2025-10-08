"use server";

import { Box, Button, Heading, Skeleton, Textarea } from "@chakra-ui/react";
import { Suspense } from "react";
import TrainningTemplateValidation from "./components/TrainningTemplateValidation";

export default async function TrainningTemplateReader({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const url = new URL(params.url?.toString() || "");
  console.log("url", url.toString());
  const response = await fetch(url);

  if (response.ok) {
    console.log("data", await response.json());
  }

  if (!url) {
    return (
      <Box>
        <form>
          <Textarea
            name="url"
            placeholder="Informe a URL do template de treino"
          />
          <Button type="submit">Ler template de treino</Button>
        </form>
      </Box>
    );
  }

  return (
    <Box>
      <Heading>Template de treino</Heading>
      <Suspense fallback={<TrainningTemplateValidationSkeleton />}>
        <TrainningTemplateValidation url={url} />
      </Suspense>
    </Box>
  );
}

async function TrainningTemplateValidationSkeleton() {
  return (
    <Box>
      <Skeleton
        variant="shine"
        width="full"
        height="5"
        css={{
          "--start-color": "colors.pink.500",
          "--end-color": "colors.orange.500",
        }}
      />
    </Box>
  );
}
