'use client';

import { Box, Code, Float, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
// import { RxFrame, RxImage, RxSquare, RxText } from 'react-icons/rx';

type JsonNodeType = string | number | boolean | object;

const ROOT_NODE_NAME = '__root_node__';

const JsonViewerExpandableNode = ({
  name,
  data,
  type,
  currentLevel,
  marginIdent,
  expandUntilLevel = Infinity,
}: {
  name: string | number;
  data: JsonNodeType;
  type: 'object' | 'array';
  currentLevel: number;
  marginIdent: number;
  expandUntilLevel?: number;
}) => {
  const marginLeft = currentLevel * marginIdent;
  const openSymbol = type === 'object' ? '{' : '[';
  console.log(name);
  const closeSymbol =
    (type === 'object' ? '}' : ']') + (name === ROOT_NODE_NAME ? '' : ',');
  const entries = Array.isArray(data)
    ? data.map((item, i) => [i, item])
    : Object.entries(data);

  const [isOpen, setIsOpen] = useState(currentLevel < expandUntilLevel);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const hasName = typeof name === 'string';

  return (
    <Stack gap={0}>
      <Box
        position="relative"
        marginLeft={marginLeft}
        onClick={toggle}
        cursor={'pointer'}
      >
        {hasName ? (
          <JsonViewerAttributeName name={name} />
        ) : (
          <Float placement="middle-start">
            <Text color="gray.400" marginRight={8} as="span">
              {name}
            </Text>
          </Float>
        )}
        {openSymbol}
        {isOpen ? '' : `...${closeSymbol}`}
      </Box>
      {isOpen && (
        <>
          {entries.map(([name, item], i) => (
            <JsonViewerNode
              name={name}
              key={i}
              data={item}
              currentLevel={currentLevel + 1}
              marginIdent={marginIdent}
              expandUntilLevel={expandUntilLevel}
            />
          ))}
          <Box marginLeft={marginLeft} onClick={toggle} cursor={'pointer'}>
            {closeSymbol}
          </Box>
        </>
      )}
    </Stack>
  );
};

const JsonViewerAttributeName = ({ name }: { name: string }) => {
  if (name === ROOT_NODE_NAME) {
    return <></>;
  }
  return (
    <>
      {name}:{'  '}
    </>
  );
};

const JsonViewerLeafNode = ({
  name,
  data,
  currentLevel = 0,
  marginIdent = 4,
}: {
  name: string;
  data: JsonNodeType;
  currentLevel?: number;
  marginIdent?: number;
}) => {
  const marginLeft = currentLevel * marginIdent;
  const formattedData =
    typeof data === 'string' ? `"${data}"` : data.toString();
  return (
    <Box flexDirection="row" marginLeft={marginLeft}>
      <JsonViewerAttributeName name={name} />
      <Code size="lg" colorPalette="gray" variant="surface">
        {formattedData}
      </Code>
      ,
    </Box>
  );
};

const JsonViewerNode = ({
  name,
  data,
  currentLevel = 0,
  marginIdent = 4,
  expandUntilLevel = Infinity,
}: {
  name: string;
  data: JsonNodeType;
  currentLevel?: number;
  marginIdent?: number;
  expandUntilLevel?: number;
}) => {
  if (Array.isArray(data)) {
    return (
      <JsonViewerExpandableNode
        name={name}
        data={data}
        type="array"
        currentLevel={currentLevel}
        marginIdent={marginIdent}
        expandUntilLevel={expandUntilLevel}
      />
    );
  }
  switch (typeof data) {
    case 'object':
      return (
        <JsonViewerExpandableNode
          name={name}
          data={data}
          type="object"
          currentLevel={currentLevel}
          marginIdent={marginIdent}
          expandUntilLevel={expandUntilLevel}
        />
      );
    case 'string':
    case 'number':
    case 'boolean':
      return (
        <JsonViewerLeafNode
          name={name}
          data={data}
          currentLevel={currentLevel}
          marginIdent={marginIdent}
        />
      );
    default:
      return (
        <JsonViewerLeafNode
          marginIdent={marginIdent}
          name={name}
          data={JSON.stringify(data)}
        />
      );
  }
};

export default function JsonViewer({ data, expandUntilLevel = Infinity }: { data: JsonNodeType, expandUntilLevel?: number }) {
  try {
    const json = JSON.parse(JSON.stringify(data));
    return (
      <JsonViewerNode name={ROOT_NODE_NAME} data={json} expandUntilLevel={expandUntilLevel} />
    );
  } catch (e) {
    return (
      <Box>
        <Code size="lg" colorPalette={'red'} variant="surface">
          JSON inválido
        </Code>
      </Box>
    );
  }
}
