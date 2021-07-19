import { BigNumber, BytesLike, Contract, Signer } from "ethers";
import { Result } from "ethers/lib/utils";

export type ContractLike = Contract | string

export interface AlphaReceipt {
  voter: string;
  hasVoted: boolean;
  support: boolean;
  votes: BigNumber;
}

export enum AlphaProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed,
}

export interface IAlphaProposal {
  id: BigNumber;
  proposer: Signer | null;

  targets: string[];
  values: BigNumber[];
  signatures: string[];
  calldatas: BytesLike[];

  contracts: (Contract | null)[];
  args: (Result)[];
}
