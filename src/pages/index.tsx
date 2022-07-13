import {
  CheckboxGroup,
  Checkbox,
  Stack,
  Textarea,
  Title,
  Button,
  Center,
} from '@mantine/core';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useMemo, useState } from 'react';
import { ethers } from 'ethers';
import {
  removeDuplicate,
  removeInvalidAddress,
  removeWhitespace,
  resolveENS,
  hasXETH,
  hasXETH_multicall,
} from '../utils/helper';
import { Column, Table } from 'react-virtualized';
import 'react-virtualized/styles.css';
const REMOVE_WHITESPACE = 'REMOVE_WHITESPACE';
const REMOVE_DUPLICATE = 'REMOVE_DUPLICATE';
const REMOVE_INVALID = 'REMOVE_INVALID';
const RESOLVE_ENS = 'RESOLVE_ENS';
const HASXETH = 'HASXETH';
declare var window: any;

const Home: NextPage = () => {
  let provider: any;
  if (typeof window === 'undefined') {
    /* we're on the server */
  } else {
    // provider = new ethers.providers.Web3Provider(window?.ethereum);
    provider = new ethers.providers.JsonRpcProvider(
      'https://eth-mainnet.g.alchemy.com/v2/2pdTZSj3sBYaKJllEXEwpXeOKY6XVwve'
    );
  }
  const list = [
    { name: 'Brian Vaughn', description: 'Software engineer' },
    // And so on...
  ];
  const [addressList, setAddressList] = useState('');
  const [actions, setActions] = useState<string[]>([
    REMOVE_WHITESPACE,
    REMOVE_DUPLICATE,
    REMOVE_INVALID,
  ]);
  const [outputList, setOutputList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const processList = async (addressList, actions) => {
    setLoading(true);
    let processedList = addressList.split('\n');
    if (actions.includes(REMOVE_DUPLICATE)) {
      processedList = removeDuplicate(processedList);
    }
    if (actions.includes(REMOVE_WHITESPACE)) {
      processedList = removeWhitespace(processedList);
    }
    if (actions.includes(REMOVE_INVALID)) {
      processedList = removeInvalidAddress(processedList);
    }
    if (actions.includes(RESOLVE_ENS)) {
      processedList = await resolveENS(processedList, provider);
    }
    if (actions.includes(HASXETH)) {
      processedList = await hasXETH_multicall(processedList, 0, provider);
    }
    setOutputList(processedList);
    setLoading(false);
  };
  console.log('actions', typeof addressList, outputList);

  return (
    <>
      <Head>
        <title>SwETH Knife Toolbox</title>
        <meta
          name='description'
          content='Toolbox for batch processing ETH addresses'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Stack>
        <Title order={1}>Process your ETH Addresses</Title>
        <Textarea
          value={addressList}
          onChange={(event) => setAddressList(event.currentTarget.value)}
          placeholder='0x'
          label='Addresses'
          description={
            addressList
              ? `Total number of Addresses = ${
                  addressList.split(/\r|\r\n|\n/).length
                }`
              : null
          }
          required
          // size='sm'
          minRows={7}
          maxRows={7}
          // autosize={true}
        />
        <Center>
          <Stack>
            <CheckboxGroup
              defaultValue={[REMOVE_DUPLICATE]}
              label='Select actions'
              // description=''
              value={actions}
              onChange={setActions}
              required
            >
              <Checkbox value={REMOVE_INVALID} label='Remove Invalid Address' />
              <Checkbox value={REMOVE_DUPLICATE} label='Remove Duplicate' />
              <Checkbox value={REMOVE_WHITESPACE} label='Remove White Space' />
              <Checkbox value={RESOLVE_ENS} label='Convert ENS' />
              <Checkbox value={HASXETH} label='Has ETH Balance' />
              <Checkbox value='Has Activity' label='Has Activity' />
            </CheckboxGroup>

            {/* <div style={{ width: 200 }}> */}
            <Button
              fullWidth={true}
              onClick={async () => await processList(addressList, actions)}
              loading={loading}
            >
              Process
            </Button>
            {/* </div> */}
          </Stack>
        </Center>
        <Textarea
          placeholder='0x'
          label='Addresses'
          value={outputList.join('\n')}
          description={
            outputList
              ? `Total number of Addresses = ${outputList.length}`
              : null
          }
          minRows={10}
          maxRows={10}
        />
        {/* <Table
          width={1000}
          height={300}
          headerHeight={20}
          rowHeight={30}
          rowCount={outputList.length}
          rowGetter={({ index }) => outputList[index]}
        >
          <Column label='Address' dataKey='address' width={800} />
          <Column width={200} label='Balance' dataKey='balance' />
        </Table>*/}
      </Stack>
    </>
  );
};

export default Home;
