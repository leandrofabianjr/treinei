import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  IconButton,
  Image,
  Menu,
  Portal,
  Stack,
} from '@chakra-ui/react';
import { LuMoon, LuSun } from 'react-icons/lu';
import { useColorMode, useColorModeValue } from './color-mode';

interface Props {
  children: React.ReactNode;
}

const NavLink = (props: Props) => {
  const { children } = props;

  return (
    <Box
      as="a"
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
    >
      {children}
    </Box>
  );
};

export default function Nav() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <NavLink>
            <Image
              w="10"
              h="10"
              src="./icon.svg"
              style={
                colorMode == 'dark'
                  ? { filter: 'invert(93%) hue-rotate(180deg)' }
                  : {}
              }
            />
          </NavLink>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} gap={7}>
              <IconButton
                aria-label="Toggle color mode"
                variant="outline"
                onClick={toggleColorMode}
              >
                {colorMode === 'light' ? <LuMoon /> : <LuSun />}
              </IconButton>

              <Menu.Root positioning={{ placement: 'bottom-end' }}>
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
