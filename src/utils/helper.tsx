import { ethers } from 'ethers';
import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from 'ethereum-multicall';
import MulticalABI from '../abis/multicall.json';
const ETH_MULTICALL_ADDRESS = '0xeefba1e63905ef1d7acba5a8513c70307c1ce441';
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
export const resolveENS = async (list: any[], provider: any) => {
  let processedList = await Promise.all(
    list.map(async (line) => {
      if (line.toLowerCase().endsWith('.eth')) {
        const resolvedAddress = await provider.resolveName(line);
        return { address: resolvedAddress, ens: line };
      } else {
        return { address: line, ens: null };
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
  list: any[],
  amount: number,
  provider: any
) => {
  const multicall_num = 1000;
  const multicall_group = [];
  while (list.length > multicall_num) {
    multicall_group.push(
      multicall(
        list.splice(0, multicall_num),
        provider,
        ETH_MULTICALL_ADDRESS,
        'getEthBalance'
      )
    );
  }
  multicall_group.push(
    multicall(list, provider, ETH_MULTICALL_ADDRESS, 'getEthBalance')
  );

  let multicall_res = await Promise.all(multicall_group);
  var balances = multicall_res.reduce(function (a, b) {
    return a.concat(b);
  });

  console.log('balances', balances);
  balances = balances.filter((item) => Number(item.ethBalance) > amount);
  // return balances.map((item) => item.address);
  return balances; //.map((item) => item.address);
};

export const multicall = async (
  list: any[],
  provider: any,
  contractAddress: string,
  methodName: string
) => {
  const multicall = new Multicall({
    ethersProvider: provider,
    tryAggregate: true,
  });

  const contractCallContext = list.map((item) => {
    let address = item.address;
    return {
      reference: address,
      contractAddress: contractAddress,
      abi: MulticalABI,
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
  let hexBalances = [];

  // console.log('balances.results', balances.results);
  // for (const item of Object.entries(balances.results)) {
  //   let balanceHex = item[1].callsReturnContext[0].returnValues[0].hex;
  //   let address = item[1].callsReturnContext[0].reference;
  //   hexBalances.push({
  //     address: address,
  //     ethBalance: Number(ethers.utils.formatEther(balanceHex)),
  //   });
  // }

  Object.entries(balances.results).forEach(([address, item], index) => {
    console.log('TEST', address, item);
    let balanceHex = item.callsReturnContext[0].returnValues[0].hex;
    // let address = callsReturnContext[0].reference;
    hexBalances.push({
      address: address,
      ethBalance: Number(ethers.utils.formatEther(balanceHex)),
      ens: list[index].ens,
    });
  });

  console.log('hexBalances', hexBalances);
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
