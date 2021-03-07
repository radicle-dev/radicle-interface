import { ethers } from "ethers";

const abi = [
  "function token() view returns (address)",
  "function totalVestingAmount() view returns (uint256)",
  "function vestingStartTime() view returns (uint256)",
  "function vestingPeriod() view returns (uint256)",
  "function cliffPeriod() view returns (uint256)",
  "function beneficiary() view returns (address)",
  "function interrupted() view returns (bool)",
  "function withdrawn() view returns (uint256)",
  "function withdrawableBalance() view returns (uint256)",
  "function withdrawVested()",
];

const tokenAbi = [
  "function symbol() view returns (string)",
];

export async function getInfo(address, config) {
  const contract = new ethers.Contract(address, abi, config.provider);
  const signer = config.provider.getSigner();

  const token = await contract.token();
  const beneficiary = await contract.beneficiary();
  const withdrawable = await contract.withdrawableBalance();
  const withdrawn = await contract.withdrawn();
  const total = await contract.totalVestingAmount();

  const tokenContract = new ethers.Contract(token, tokenAbi, config.provider);
  const symbol = await tokenContract.symbol();

  return {
    token: token,
    symbol: symbol,
    beneficiary: beneficiary,
    totalVesting: format(total),
    withdrawableBalance: format(withdrawable),
    withdrawn: format(withdrawn),
  };
}

function format(n) {
  return ethers.utils.commify(parseFloat(ethers.utils.formatUnits(n)).toFixed(2));
}
