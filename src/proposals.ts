import { BigNumber, BytesLike, Contract } from "ethers";
import {
  FormatTypes,
  FunctionFragment,
  hexDataSlice,
  Result,
} from "ethers/lib/utils";
import { HardhatPluginError } from "hardhat/plugins";

import { IAlphaProposal } from "./types";

export class AlphaProposal implements IAlphaProposal {
  public id: number;
  public proposer: string | null;
  public targets: string[];
  public values: BigNumber[];
  public signatures: string[];
  public calldatas: BytesLike[];

  public contracts: (Contract | null)[];
  public args: (Result | null)[];

  constructor() {
    this.id = 0;
    this.proposer = null;
    this.targets = new Array<string>();
    this.values = new Array<BigNumber>();
    this.signatures = new Array<string>();
    this.calldatas = new Array<BytesLike>();

    this.contracts = new Array<Contract | null>();
    this.args = new Array<Result | null>();
  }
}

export class AlphaProposalBuilder {
  public readonly governor: Contract;
  private readonly maxActions: number;
  private proposal: AlphaProposal;

  constructor(governor: Contract, maxActions: number = 10) {
    this.governor = governor;
    this.maxActions = maxActions;

    this.proposal = new AlphaProposal();
  }

  addAction(
    contract: Contract,
    method: string,
    args: any[],
    value: number = 0
  ): AlphaProposalBuilder {
    if (this.proposal.targets.length >= this.maxActions) {
      throw new HardhatPluginError(
        "hardhat-proposals-plugin",
        "Too many actions on proposal"
      );
    }

    const _interface = contract.interface;
    const functionFragment: FunctionFragment = _interface.getFunction(method);
    const signature = functionFragment.format(FormatTypes.sighash);

    const functionData = _interface.encodeFunctionData(functionFragment, args);
    const functionArgs = _interface.decodeFunctionData(
      functionFragment,
      functionData
    );

    const calldata = hexDataSlice(functionData, 4); // Remove the sighash from the function data

    this.proposal.targets.push(contract.address);
    this.proposal.values.push(BigNumber.from(value));

    this.proposal.signatures.push(signature);
    this.proposal.calldatas.push(calldata);

    this.proposal.contracts.push(contract);
    this.proposal.args.push(functionArgs);

    return this;
  }

  build(): AlphaProposal {
    return this.proposal;
  }
}
