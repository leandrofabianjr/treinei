import { Button, Center, Heading, Stack } from "@chakra-ui/react";
import Link from "next/link";

export default function Home() {
  return (
    <Center>
      <Stack gap={4} alignItems="center">
        <Heading>Treinei</Heading>
        <Button asChild>
          <Link href="/read-activity/trainning-template">Ler atividade</Link>
        </Button>
      </Stack>
    </Center>
  );
}
