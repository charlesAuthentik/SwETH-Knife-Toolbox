import { Stack, Textarea, Title, Button, Text } from '@mantine/core';
import { GridColDef } from '@mui/x-data-grid';
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
  groupMulticall,
  lookupENS,
} from '../utils/helper';
import DataTable from '../components/DataGrid';
import TokenModal from '../components/TokenModal';
import { useTokenList } from '@usedapp/core';
declare var window: any;

type Item = {
  address: string;
  ens?: string;
  ethBalance?: number;
};

const UNI_LIST = 'https://gateway.ipfs.io/ipns/tokens.uniswap.org'; //Todo: Website will crash if this link is not reachable. Add checker
const ETHER = {
  label: 'Ether',
  value: '0x0000000000000000000000000000000000000000',
  chainId: 1,
  address: '0x0000000000000000000000000000000000000000',
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
  logoURI:
    'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
};

const Home: NextPage = () => {
  let { tokens } = useTokenList(UNI_LIST, 1) || {};
  let tokensData = tokens?.map((token) => ({
    ...token,
    label: token.name,
    value: token.address,
  }));
  tokensData = tokensData?.concat(ETHER);
  let provider: any;
  if (typeof window === 'undefined') {
    /* we're on the server */
  } else {
    // provider = new ethers.providers.Web3Provider(window?.ethereum);
    provider = new ethers.providers.JsonRpcProvider(
      // 'https://eth-mainnet.g.alchemy.com/v2/2pdTZSj3sBYaKJllEXEwpXeOKY6XVwve'
      'https://mainnet.infura.io/v3/012fb328d8014b5baee8f34025c9a065'
    );
  }

  const [columns, setColumns] = useState<GridColDef[]>([
    { field: 'address', headerName: 'Address', width: 400 },
    { field: 'ens', headerName: 'ENS', width: 200 },
    {
      field: 'ETHBalance',
      headerName: 'ETH Balance',
      type: 'number',
      width: 100,
    },
  ]);

  const [outputList, setOutputList] = useState<string[]>([]);
  const [value, setValue] = useState('');
  const selectedToken = useMemo(
    () => tokensData?.find((token) => token.value === value),
    [value]
  );

  const [addressList, setAddressList] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const processList = async (addressList) => {
    setLoading(true);
    let cleanupList = addressList.split(/\r?\n|,/).filter((element) => element);
    console.log('HERE', cleanupList);
    cleanupList = removeWhitespace(cleanupList);
    cleanupList = removeDuplicate(cleanupList);
    cleanupList = removeInvalidAddress(cleanupList);
    console.log('here1', cleanupList);
    let processedList: Item[] = cleanupList.map((address) => {
      return {
        address: address,
      };
    });
    console.log('here2', processedList);

    processedList = await resolveENS(processedList, provider);
    setOutputList(processedList);
    processedList = await lookupENS(processedList, provider);
    setOutputList(processedList);
    processedList = await groupMulticall(processedList, provider, ETHER);
    // console.log('here2', processedList);
    setOutputList(processedList);
    setLoading(false);
  };
  console.log('actions', typeof addressList, outputList);

  const queryToken = async () => {
    console.log('queryToken');
    let balanceName = selectedToken!.symbol + 'Balance';
    console.log('queryToken');

    setColumns((prevState) => [
      ...prevState,
      {
        field: balanceName,
        headerName: selectedToken!.name,
        type: 'number',
        width: 100,
      },
    ]);
    let processedList = await groupMulticall(
      outputList,
      provider,
      selectedToken!
    );
    setOutputList(processedList);
  };
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
        <Stack>
          {/* <div style={{ width: 200 }}> */}
          <Button
            fullWidth={true}
            onClick={async () => await processList(addressList)}
            loading={loading}
          >
            Process
          </Button>

          <Button fullWidth={true} onClick={() => setOpenModal(true)}>
            Add Token
          </Button>
        </Stack>
        <Text>Addresses</Text>
        <Text>{selectedToken?.name}</Text>
        <Text>
          {outputList
            ? `Total number of Addresses = ${outputList.length}`
            : null}
        </Text>
        <DataTable data={outputList} columns={columns} />
      </Stack>
      <TokenModal
        opened={openModal}
        setOpened={setOpenModal}
        value={value}
        setValue={setValue}
        queryToken={queryToken}
        tokensData={tokensData}
      />
    </>
  );
};

export default Home;
