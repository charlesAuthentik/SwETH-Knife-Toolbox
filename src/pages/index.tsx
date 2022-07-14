import {
  CheckboxGroup,
  Checkbox,
  Stack,
  Textarea,
  Title,
  Button,
  Center,
  Text,
} from '@mantine/core';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import {
  removeDuplicate,
  removeInvalidAddress,
  removeWhitespace,
  resolveENS,
  hasXETH,
  hasXETH_multicall,
} from '../utils/helper';
import DataTable from '../components/DataGrid';
import TokenModal from '../components/TokenModal';

const CLEAN_UP_ADDRESS = 'CLEAN_UP_ADDRESS';
const REMOVE_WHITESPACE = 'REMOVE_WHITESPACE';
const REMOVE_DUPLICATE = 'REMOVE_DUPLICATE';
const REMOVE_INVALID = 'REMOVE_INVALID';
const RESOLVE_ENS = 'RESOLVE_ENS';
const HASXETH = 'HASXETH';
declare var window: any;

type Item = {
  address: string;
  ens: string;
  ethBalance: number;
};

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
  const [outputList, setOutputList] = useState<string[]>([]);

  const [addressList, setAddressList] = useState('');
  const [actions, setActions] = useState<string[]>([
    REMOVE_WHITESPACE,
    REMOVE_DUPLICATE,
    REMOVE_INVALID,
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const processList = async (addressList, actions) => {
    setLoading(true);
    let processedList = addressList.split('\n');
    processedList = removeWhitespace(processedList);
    processedList = removeDuplicate(processedList);
    processedList = removeInvalidAddress(processedList);
    console.log('here1', processedList);

    processedList = await resolveENS(processedList, provider);
    // if (actions.includes(HASXETH)) {
    processedList = await hasXETH_multicall(processedList, 0, provider);
    // }
    console.log('here2', processedList);
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
            {/* <div style={{ width: 200 }}> */}
            <Button
              fullWidth={true}
              onClick={async () => await processList(addressList, actions)}
              loading={loading}
            >
              Process
            </Button>

            {/* <Button
              fullWidth={true}
              onClick={() => setOpenModal(true)}
              // loading={loading}
            >
              Add Token
            </Button> */}
            {/* </div> */}
          </Stack>
        </Center>
        <Text>Addresses</Text>
        <Text>
          {outputList
            ? `Total number of Addresses = ${outputList.length}`
            : null}
        </Text>
        <DataTable data={outputList} />
      </Stack>
      <TokenModal opened={openModal} setOpened={setOpenModal} />
    </>
  );
};

export default Home;
