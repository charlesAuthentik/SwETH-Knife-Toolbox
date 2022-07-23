import React, { forwardRef } from 'react';
import { Avatar, Button, Group, Modal, Select, Text } from '@mantine/core';
import { useTokenList } from '@usedapp/core';

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  logoURI: string;
  label: string;
  description: string;
}

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

const TokenModal = ({
  opened,
  setOpened,
  value,
  setValue,
  queryToken,
  tokensData,
}) => {
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
          value={value}
          onChange={setValue}
        ></Select>
        <Button
          onClick={() => {
            queryToken();
            setOpened(false);
          }}
        >
          Confirm
        </Button>
      </Modal>
    </>
  ) : (
    <></>
  );
};

export default TokenModal;
