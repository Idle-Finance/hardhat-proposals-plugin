import { exception } from "console";
import { BigNumber, BytesLike, Contract, Wallet, utils } from "ethers";
import {
  FormatTypes,
  FunctionFragment,
  hexDataSlice,
  Result,
} from "ethers/lib/utils";
import { HardhatPluginError } from "hardhat/plugins";

import { GovernorAlpha } from "./types/ethers-contracts/GovernorAlpha";
import { IAlphaProposal } from "./types/types";

enum ProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed
}

export class AlphaProposal implements IAlphaProposal {
  public readonly governor: GovernorAlpha;

  public id: BigNumber;
  public proposer: Wallet | null;
  public targets: string[];
  public values: BigNumber[];
  public signatures: string[];
  public calldatas: BytesLike[];

  public description: string;

  public contracts: (Contract | null)[];
  public args: (Result | null)[];

  constructor(governor: GovernorAlpha) {
    this.governor = governor;

    this.id = BigNumber.from("0");
    this.proposer = null;
    this.targets = new Array<string>();
    this.values = new Array<BigNumber>();
    this.signatures = new Array<string>();
    this.calldatas = new Array<BytesLike>();

    this.description = "";

    this.contracts = new Array<Contract | null>();
    this.args = new Array<Result | null>();
  }

  public async propose(proposer?: Wallet) {
    if (proposer) {
      this.proposer = proposer
    }

    if (this.proposer) {
      const proposalId = await this.governor.connect(this.proposer).callStatic.propose(
        this.targets,
        this.values,
        this.signatures,
        this.calldatas,
        this.description
      );

      await this.governor.connect(this.proposer).propose(this.targets,
        this.values,
        this.signatures,
        this.calldatas,
        this.description)

      this.id = proposalId;
    }
    else {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Cannot propose without a proposer")
    }
  }

  public async vote(signer: Wallet) {
    throw exception("Not implmenented")
  }

  public async queue(signer?: Wallet) {
    throw exception("Not implmenented")
  }

  public async execute(signer?: Wallet) {
    throw exception("Not implmenented")
  }

  public async printProposalInfo() {
    if (this.id.isZero()) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Proposal has not been submitted yet")
    }
    const proposalInfo = await this.governor.proposals(this.id)
    const proposalState = await this.governor.state(this.id)
    
    const state = ProposalState[proposalState]

    console.log(`Proposal Id: ${this.id.toString()}`)
    console.log(`State: ${state.toString()}`)

    for (let i = 0; i < this.targets.length; i++) {
      const contract = this.contracts[i]
      const target = this.targets[i]
      const signature = this.signatures[i]
      const value = this.values[i]
      const args = this.args[i]
      
      let name = ""
      if (contract?.functions['name()'] != null) {
        name = (await contract.functions['name()']()).toString()
      }

      console.log(`Action ${i}`)
      if (name == "") {
        console.log(` ├─ target ───── ${target}`)
      }
      else {
        console.log(` ├─ target ───── ${target} (name: ${name})`)
      }
      if (!value.isZero()) {
        console.log(` ├─ value ────── ${utils.formatEther(value.toString())} ETH`)
      }
      console.log(` ├─ signature ── ${signature}`)
      console.log(` └─ args ─────── ${args}`)
    }
  }
}

export class AlphaProposalBuilder {
  public readonly governor: GovernorAlpha;
  private readonly maxActions: number;
  private proposal: AlphaProposal;

  constructor(governor: Contract, maxActions: number = 10) {
    this.governor = governor as GovernorAlpha;
    this.maxActions = maxActions;

    this.proposal = new AlphaProposal(this.governor);
  }

  setProposer(proposer: Wallet): AlphaProposalBuilder {
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
