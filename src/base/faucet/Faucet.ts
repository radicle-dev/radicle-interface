import * as ethers from 'ethers';

import type { Config } from '@app/config';
import { assert } from '@app/error';
import type { TransactionResponse } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';

export async function withdraw(amount: number, config: Config): Promise<TransactionResponse> {
  assert(config.signer);

  const faucet = new ethers.Contract(
    config.radToken.faucet,
    config.abi.faucet,
    config.signer
  );

  return faucet.withdraw(config.radToken.address, ethers.utils.parseUnits(amount.toString()));
}

export async function getMaxWithdrawAmount(config: Config): Promise<ethers.BigNumber> {
  assert(config.signer);

  const faucet = new ethers.Contract(
    config.radToken.faucet,
    config.abi.faucet,
    config.signer
  );

  return faucet.maxWithdrawAmount();
}

export async function calculateTimeLock(amount: ethers.BigNumber, config: Config): Promise<ethers.BigNumber> {
  assert(config.signer);

  const faucet = new ethers.Contract(
    config.radToken.faucet,
    config.abi.faucet,
    config.signer
  );

  return faucet.calculateTimeLock(parseUnits(amount.toString()));
}

export async function lastWithdrawalByUser(config: Config): Promise<ethers.BigNumber> {
  assert(config.signer);

  const address = config.signer.getAddress();

  const faucet = new ethers.Contract(
    config.radToken.faucet,
    config.abi.faucet,
    config.signer
  );

  return faucet.lastWithdrawalByUser(address);
}
