import React, { forwardRef, ItemProps } from 'react';
import { Avatar, Button, Group, Modal, Select, Text } from '@mantine/core';
import { useTokenList } from '@usedapp/core';

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
const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ logoURI, label, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={logoURI} size='sm' />
        <div>
          <Text size='sm'>{label}</Text>
        </div>
      </Group>
    </div>
  )
);

const TokenModal = ({ opened, setOpened }) => {
  let { tokens } = useTokenList(UNI_LIST, 1) || {};
  let tokensData = tokens?.map((token) => ({
    ...token,
    label: token.name,
    value: token.address,
  }));
  tokensData = [ETHER].concat(tokensData || []);
  console.log(tokens);
  return tokensData ? (
    <>
      <Modal
        centered
        opened={opened}
        onClose={() => setOpened(false)}
        title='Select your Token'
        withCloseButton={false}
      >
        <p className='mb-4 flex justify-center font-bold text-accent'>
          Add Requirement
        </p>

        <Select
          label='Select Network'
          placeholder='Pick one'
          data={[
            { value: 'ethereum', label: 'Ethereum' },
            // { value: 'polygon', label: 'Polygon' },
          ]}
        />
        <Select
          label='Select Type'
          placeholder='Pick one'
          data={[
            { value: 'token', label: 'Token' },
            // { value: 'nft', label: 'NFT' },
          ]}
        />

        <Select
          label='Select Type'
          placeholder='Pick one'
          searchable
          itemComponent={SelectItem}
          data={tokensData}
        ></Select>
        <Button>Confirm</Button>
      </Modal>
    </>
  ) : (
    <></>
  );
};

export default TokenModal;
