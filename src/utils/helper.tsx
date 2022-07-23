import { ethers } from 'ethers';
import { Multicall } from 'ethereum-multicall';
import MulticalABI from '../abis/multicall.json';
import ERC20ABI from '../abis/erc20.json';
const ETH_MULTICALL_ADDRESS = '0xeefba1e63905ef1d7acba5a8513c70307c1ce441';
import { Item } from './types';
type Token = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
};

export const removeDuplicate = (list: string[]): string[] => {
  return [...new Set(list)];
};

export const removeWhitespace = (list: string[]): string[] => {
  return list.map((line) => line.trim());
};

export const removeInvalidAddress = (list: string[]): string[] => {
  return list.filter(
    (line) =>
      line &&
      (ethers.utils.isAddress(line) || line.toLowerCase().endsWith('.eth'))
  );
};
export const removeInvalidAddressObj = (list: any[]): string[] => {
  return list.filter(
    (line) =>
      line &&
      line.address &&
      (ethers.utils.isAddress(line.address) ||
        line.address.toLowerCase().endsWith('.eth'))
  );
};
export const resolveENS = async (list: Item[], provider: any) => {
  let processedList = await Promise.all(
    list.map(async (item) => {
      const address = item.address;
      if (address.toLowerCase().endsWith('.eth')) {
        const resolvedAddress = await provider.resolveName(address);
        return { ...item, address: resolvedAddress, ens: address };
      } else {
        return item;
      }
    })
  );
  //Some invalid .eth address could resolve to null
  processedList.forEach((line) => {
    if (line && !line.address) {
      console.log('line', line);
    }
  });
  processedList = removeInvalidAddressObj(processedList);
  console.log('resolveENS', processedList);
  return processedList;
};

export const lookupENS = async (list: Item[], provider: any) => {
  let processedList = await Promise.all(
    list.map(async (item) => {
      if (!item.ens) {
        const ensName = await provider.lookupAddress(item.address);
        return { ...item, ens: ensName };
      } else {
        return item;
      }
    })
  );

  //Some invalid .eth address could resolve to null
  processedList.forEach((line) => {
    if (line && !line.address) {
      console.log('line', line);
    }
  });
  // processedList = removeInvalidAddressObj(processedList);
  console.log('lookupENS', processedList);

  return processedList;
};

export const groupMulticall = async (
  list: Item[],
  provider: any,
  token: Token
) => {
  const multicall_num = 1000;
  const multicall_group = [];
  while (list.length > multicall_num) {
    multicall_group.push(
      multicall(list.splice(0, multicall_num), provider, token)
    );
  }
  multicall_group.push(multicall(list, provider, token));

  let multicall_res = await Promise.all(multicall_group);
  var balances = multicall_res.reduce(function (a, b) {
    return a.concat(b);
  });

  console.log('balances', balances);
  // balances = balances.filter((item) => Number(item.ethBalance) > amount);
  // return balances.map((item) => item.address);
  return balances; //.map((item) => item.address);
};

export const multicall = async (list: Item[], provider: any, token: Token) => {
  let contractAddress;
  let methodName;
  let abi;
  let balanceName = token.symbol + 'Balance';
  if (token.address === '0x0000000000000000000000000000000000000000') {
    contractAddress = ETH_MULTICALL_ADDRESS;
    methodName = 'getEthBalance';
    abi = MulticalABI;
  } else {
    contractAddress = token.address;
    methodName = 'balanceOf';
    abi = ERC20ABI;
  }
  console.log('contractAddress', contractAddress, methodName, balanceName);
  const multicall = new Multicall({
    ethersProvider: provider,
    tryAggregate: true,
  });

  const contractCallContext = list.map((item) => {
    let address = item.address;
    return {
      reference: address,
      contractAddress: contractAddress,
      abi: abi,
      calls: [
        {
          reference: address,
          methodName: methodName,
          methodParameters: [address],
        },
      ],
    };
  });

  const balances = await multicall.call(contractCallContext);

  let balance_dict = {};
  Object.entries(balances.results).forEach(([address, item], index) => {
    let balanceHex = item.callsReturnContext[0].returnValues[0].hex;
    balance_dict[address] = Number(
      ethers.utils.formatUnits(balanceHex, token.decimals)
    );
  });
  let processedList = list.map((item, index) => {
    return { ...item, [balanceName]: balance_dict[item.address] };
  });

  return processedList;
};

// processedList = processedList.filter((n) => n);

// if (actions.includes(RESOLVE_ENS)) {
//   processedList = await Promise.all(
//     processedList.map(async (line) => {
//       if (line.endsWith('.eth')) {
//         // console.log('eth', line);
//         return await provider.resolveName(line);
//       } else {
//         return line;
//       }
//     })
//   );
// }
// console.log('here2', processedList);
