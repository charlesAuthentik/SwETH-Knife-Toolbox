import { PropsWithChildren } from 'react';
import Image from 'next/image';
import { AppShell, Header, Group, Text, Button } from '@mantine/core';
import CustomNavbar from './CustomNavbar';

// import NavbarSimple from './NavbarSimple';
// import FooterSimple from './FooterSimple';

// import GetWallet from './GetWallet';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <AppShell
      padding='md'
      // navbar={<CustomNavbar />}
      header={
        <Header height={60}>
          <Group sx={{ height: '100%' }} px={20} position='apart'>
            <Text>SwETH Knife Toolbox</Text>
            {/* <Text>SwETH Knife Toolbox</Text> */}
            <Image src='/images/allo_logo.svg' height={65} width={120} />
            {/* <GetWallet /> */}
          </Group>
        </Header>
      }
      // footer={
      //   <FooterSimple
      //     links={[
      //       { link: '/', label: 'Home' },
      //       { link: '/', label: 'Privacy' },
      //       { link: '/', label: 'Careers' },
      //     ]}
      //   />
      // }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      {children}
    </AppShell>
  );
};

export default Layout;
