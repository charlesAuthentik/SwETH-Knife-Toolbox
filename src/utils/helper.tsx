import { ethers } from 'ethers';
import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from 'ethereum-multicall';
import MulticalABI from '../abis/multicall.json';

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

export const resolveENS = async (list: string[], provider: any) => {
  let processedList = await Promise.all(
    list.map(async (line) => {
      if (line.toLowerCase().endsWith('.eth')) {
        return await provider.resolveName(line);
      } else {
        return line;
      }
    })
  );
  //Some invalid .eth address could resolve to null
  processedList = removeInvalidAddress(processedList);
  return processedList;
};

export const hasXETH = async (
  list: string[],
  amount: number,
  provider: any
) => {
  let processedList;
  let count = 0;

  processedList = await Promise.all(
    list.map(async (line, index) => {
      const balance = await provider.getBalance(line);
      count++;
      return { address: line, ethBalance: ethers.utils.formatEther(balance) };
    })
  );

  processedList = processedList.filter(
    (item) => Number(item.ethBalance) > amount
  );
  return processedList.map((item) => item.address);
};

export const hasXETH_multicall = async (
  list: string[],
  amount: number,
  provider: any
) => {
  const multicall_num = 1000;
  const multicall_group = [];
  while (list.length > multicall_num) {
    multicall_group.push(multicall(list.splice(0, multicall_num), provider));
  }
  multicall_group.push(multicall(list, provider));

  let multicall_res = await Promise.all(multicall_group);
  var balances = multicall_res.reduce(function (a, b) {
    return a.concat(b);
  });

  balances = balances.filter((item) => Number(item.balance) > 100);
  return balances.map((item) => item.address);
};

export const multicall = async (list: string[], provider: any) => {
  const multicall = new Multicall({
    ethersProvider: provider,
    tryAggregate: true,
  });

  const contractCallContext = list.map((address, index) => {
    return {
      reference: address,
      contractAddress: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
      abi: MulticalABI,
      calls: [
        {
          reference: address,
          methodName: 'getEthBalance',
          methodParameters: [address],
        },
      ],
    };
  });

  const balances = await multicall.call(contractCallContext);
  let hexBalances = [];

  for (const item of Object.entries(balances.results)) {
    let balanceHex = item[1].callsReturnContext[0].returnValues[0].hex;
    hexBalances.push({
      address: item[1].callsReturnContext[0].reference,
      balance: Number(ethers.utils.formatEther(balanceHex)),
    });
  }
  return hexBalances;
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
