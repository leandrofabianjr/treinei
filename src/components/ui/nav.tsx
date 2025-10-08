"use client";

import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  Image,
  Menu,
  Portal,
  Stack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useColorMode, useColorModeValue } from "./color-mode";
import ColorModeToggleButton from "./ColorModeToggleButton";

export default function Nav() {
  const { colorMode } = useColorMode();
  return (
    <>
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <Button variant="ghost" asChild>
            <Link href="/">
              <Image
                w="10"
                h="10"
                src="./icon.svg"
                style={
                  colorMode == "dark"
                    ? { filter: "invert(93%) hue-rotate(180deg)" }
                    : {}
                }
              />
            </Link>
          </Button>

          <Flex alignItems={"center"}>
            <Stack direction={"row"} gap={7}>
              <ColorModeToggleButton />

              <Menu.Root positioning={{ placement: "bottom-end" }}>
                <Menu.Trigger asChild>
                  <Button variant="ghost" size="sm">
                    <Avatar.Root size="sm">
                      <Avatar.Fallback name="Nome do usuário" />
                      <Avatar.Image />
                    </Avatar.Root>
                  </Button>
                </Menu.Trigger>

                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Center>
                        <Avatar.Root size="sm">
                          <Avatar.Fallback name="Nome do usuário" />
                          <Avatar.Image />
                        </Avatar.Root>
                      </Center>
                      <br />
                      <Center>
                        <p>Username</p>
                      </Center>
                      <br />
                      <Menu.Separator />
                      <Menu.ItemGroup>
                        <Menu.ItemGroupLabel>Align</Menu.ItemGroupLabel>
                        <Menu.Item value="left">Left</Menu.Item>
                        <Menu.Item value="middle">Middle</Menu.Item>
                        <Menu.Item value="right">Right</Menu.Item>
                      </Menu.ItemGroup>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}
