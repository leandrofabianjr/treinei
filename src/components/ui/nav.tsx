import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  Menu,
  Portal,
  Stack,
  useDisclosure,
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Box>Logo</Box>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} gap={7}>
              <Button onClick={toggleColorMode}>
                {colorMode === 'light' ? <LuMoon /> : <LuSun />}
              </Button>

              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button
                    variant="plain"
                    size="sm"
                    as={Button}
                    cursor={'pointer'}
                    rounded={'full'}
                    minW={0}
                  >
                    <Avatar.Root size="sm">
                      <Avatar.Fallback name="Nome do usuário" />
                      <Avatar.Image src="https://avatars.dicebear.com/api/male/username.svg" />
                    </Avatar.Root>
                  </Button>
                </Menu.Trigger>

                <Portal>
                  <Menu.Positioner alignItems={'center'}>
                    <Menu.Content>
                      <Center>
                        <Avatar.Root size="sm">
                          <Avatar.Fallback name="Nome do usuário" />
                          <Avatar.Image src="https://avatars.dicebear.com/api/male/username.svg" />
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
