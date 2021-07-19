import { BigNumber, Contract, Signer } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

import {
  FormatTypes,
  FunctionFragment,
  hexDataSlice
} from "ethers/lib/utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { HardhatPluginError } from "hardhat/plugins";

import { GovernorAlpha, VotingToken } from "./ethers-contracts/index"
import { VotingToken__factory } from "./ethers-contracts/factories/VotingToken__factory";
import { GovernorAlpha__factory } from "./ethers-contracts/factories/GovernorAlpha__factory";

import { AlphaProposal } from "./proposals";
import { ContractLike } from "./types";

export class AlphaProposalBuilder {
  private readonly hre: HardhatRuntimeEnvironment
  public readonly ethersProvider: JsonRpcProvider
  private readonly maxActions: number;
  public governor?: GovernorAlpha;
  public votingToken?: VotingToken;
  private proposal: AlphaProposal;

  constructor(hre: HardhatRuntimeEnvironment, governor?: ContractLike, votingToken?: ContractLike, maxActions?: number);
  constructor(hre: HardhatRuntimeEnvironment, governor: ContractLike, votingToken: ContractLike, maxActions: number = 10) {
    this.hre = hre
    this.ethersProvider = hre.ethers.provider

    if (governor instanceof Contract) {
      this.governor = governor as GovernorAlpha;
    } else if (typeof governor === 'string' && governor !== "") {
      this.governor = GovernorAlpha__factory.connect(governor, this.ethersProvider)
    }

    if (votingToken instanceof Contract) {
      this.votingToken = votingToken as VotingToken
    }
    else if (typeof votingToken === 'string' && votingToken !== "") {
      this.votingToken = VotingToken__factory.connect(votingToken, this.ethersProvider)
    }

    this.maxActions = maxActions || 10;
    this.proposal = new AlphaProposal(hre, this.governor, this.votingToken);
  }

  setGovernor(governor: ContractLike): AlphaProposalBuilder {
    let _governor: GovernorAlpha
    if (governor instanceof Contract) {
      _governor = governor as GovernorAlpha
    } else if (typeof governor === 'string') {
      _governor = GovernorAlpha__factory.connect(governor, this.ethersProvider)
    } else {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Invalid governor")
    }

    this.governor = _governor
    this.proposal.setGovernor(_governor)

    return this;
  }

  setVotingToken(votingToken: ContractLike): AlphaProposalBuilder {
    let _votingToken: VotingToken
    if (votingToken instanceof Contract) {
      _votingToken = votingToken as VotingToken
    } else if (typeof votingToken === 'string') {
      _votingToken = VotingToken__factory.connect(votingToken, this.ethersProvider)
    } else {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Invalid governor")
    }

    this.votingToken = _votingToken
    this.proposal.setVotingToken(_votingToken)

    return this;
  }

  setProposer(proposer: Signer): AlphaProposalBuilder {
    this.proposal.proposer = proposer

    return this;
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

    // get function signature
    const _interface = contract.interface;
    const functionFragment: FunctionFragment = _interface.getFunction(method);
    const signature = functionFragment.format(FormatTypes.sighash);

    if (functionFragment.inputs.length != args.length) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "arguments length do not match signature")
    }

    // encode function call data
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

  setDescription(description: string): AlphaProposalBuilder {
    this.proposal.description = description;

    return this;
  }

  build(): AlphaProposal {
    return this.proposal;
  }
}
