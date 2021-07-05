import { BigNumber, BytesLike, Contract, Wallet, utils, ContractReceipt, ContractTransaction } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import {
  FormatTypes,
  FunctionFragment,
  hexDataSlice,
  Result,
} from "ethers/lib/utils";
import { HardhatPluginError } from "hardhat/plugins";

import { GovernorAlpha } from "./types/ethers-contracts/GovernorAlpha";
import { VotingToken } from "./types/ethers-contracts/VotingToken";
import { Timelock__factory } from "./types/ethers-contracts/factories/Timelock__factory";
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
  public readonly provider: JsonRpcProvider
  
  public readonly governor: GovernorAlpha;
  public readonly votingToken: VotingToken;

  public id: BigNumber;
  public proposer: Wallet | null;
  public targets: string[];
  public values: BigNumber[];
  public signatures: string[];
  public calldatas: BytesLike[];

  public description: string;

  public contracts: (Contract | null)[];
  public args: (Result)[];

  constructor(provider: JsonRpcProvider, governor: GovernorAlpha, votingToken: VotingToken) {
    this.provider = provider;
    this.governor = governor;
    this.votingToken = votingToken

    this.id = BigNumber.from("0");
    this.proposer = null;
    this.targets = new Array<string>();
    this.values = new Array<BigNumber>();
    this.signatures = new Array<string>();
    this.calldatas = new Array<BytesLike>();

    this.description = "";

    this.contracts = new Array<Contract | null>();
    this.args = new Array<Result>();
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

  private validProposal() {
    return !this.id.isZero()
  }

  private async getProposalState(): Promise<ProposalState> {
    if (!this.validProposal()) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Proposal has not been submitted yet")
    }
    const proposalState = await this.governor.state(this.id)

    return proposalState as ProposalState
  }

  public async vote(signer: Wallet, support: boolean=true) {
    if (!this.validProposal()) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Proposal has not been submitted yet")
    }

    let currentState = await this.getProposalState()
    if (currentState == ProposalState.Active) {
      await this.governor.connect(signer).castVote(this.id, support)
    } else {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Proposal is not in an active state")
    }
  }

  public async queue(signer?: Wallet) {
    if (!this.validProposal()) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Proposal has not been submitted yet")
    }

    let governor = this.governor
    if (signer) {
      governor = governor.connect(signer)
    }

    governor.queue(this.id)
  }

  public async execute(signer?: Wallet) {
    if (!this.validProposal()) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Proposal has not been submitted yet")
    }

    let governor = this.governor
    if (signer) {
      governor = governor.connect(signer)
    }

    governor.execute(this.id)
  }

  // queues the action to the timelock by impersonating the governor
  // advances time in order to execute proposal
  // analyses errors
  public async simulate() {
    await this.provider.send("hardhat_impersonateAccount", [this.governor.address])
    await this.provider.send("hardhat_setBalance", [this.governor.address, "0xffffffffffffffff"])
    let governorSigner = await this.provider.getSigner(this.governor.address)

    let timelock = new Timelock__factory(governorSigner).attach(await this.governor.timelock())
    
    await this.provider.send("hardhat_impersonateAccount", [timelock.address])
    await this.provider.send("hardhat_setBalance", [timelock.address, "0xffffffffffffffff"])
    let timelockSigner = await this.provider.getSigner(timelock.address)
    
    let blockInfo = await this.provider.getBlock("latest")
    let delay = await timelock.delay()

    let eta = delay.add(blockInfo.timestamp).add("50")

    this.provider.send("evm_setAutomine", [false])
    for (let i = 0; i < this.targets.length; i++) {
      await timelock.queueTransaction(this.targets[i], this.values[i], this.signatures[i], this.calldatas[i], eta)
    }
    this.provider.send("evm_mine", [])
    this.provider.send("evm_mine", [eta.toNumber()])

    let receipts = new Array<ContractTransaction>();
    for (let i = 0; i < this.targets.length; i++) {
      await timelock.executeTransaction(this.targets[i], this.values[i], this.signatures[i], this.calldatas[i], eta).then(
        receipt => {receipts.push(receipt)},
        async (timelockError) => {
          // analyse error
          let timelockErrorMessage = timelockError.error.message.match(/^[\w\s:]+'(.*)'$/m)[1]
          let contractErrorMesage

          // call the method on the contract as if it was the timelock
          // this will produce a more relavent message as to the failure of the action
          let contract = await this.contracts[i]?.connect(timelockSigner)
          if (contract) {
            await contract.callStatic[this.signatures[i]](...this.args[i]).catch(contractError => {
              contractErrorMesage = contractError.message.match(/^[\w\s:]+'(.*)'$/m)[1]
            })
          }

          throw new HardhatPluginError("hardhat-proposals-plugin", 
          `Proposal action ${i} failed.
          Target: ${this.targets[i]}
          Signature: ${this.signatures[i]}
          Args: ${this.args[i]}\n
          Timelock revert message: ${timelockErrorMessage}
          Contract revert message: ${contractErrorMesage}`)
        }
      )
    }

    this.provider.send("evm_mine", [])
    for (let i = 0; i < this.targets.length; i++) {
      let r = await receipts[i].wait().catch(r => {return r.receipt as ContractReceipt})
      if (r.status != 1) {
        throw new HardhatPluginError("hardhat-proposals-plugin", `Action ${i} failed`)
      }
    }
    this.provider.send("evm_setAutomine", [true])
    await this.provider.send("hardhat_stopImpersonatingAccount", [this.governor.address])
    await this.provider.send("hardhat_stopImpersonatingAccount", [timelock.address])
  }

  public async printProposalInfo() {
    console.log('--------------------------------------------------------')
    if (this.validProposal()) {
      const proposalInfo = await this.governor.proposals(this.id)
      const state = await this.getProposalState()
      
      let votingTokenName = await this.votingToken.name();
      let votingTokenDecimals = BigNumber.from("10").pow(await this.votingToken.decimals());
      
      console.log(`Id: ${this.id.toString()}`)
      console.log(`For Votes: ${proposalInfo.forVotes.div(votingTokenDecimals)} ${votingTokenName} Votes`)
      console.log(`Agasint Votes: ${proposalInfo.againstVotes.div(votingTokenDecimals)} ${votingTokenName} Votes`)

      console.log(`Vote End: ${proposalInfo.endBlock}`)

      console.log(`State: ${state.toString()}`)
    } else {
      console.log("Unsubmitted proposal")
    }

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
  public readonly provider: JsonRpcProvider
  public readonly governor: GovernorAlpha;
  public readonly votingToken: VotingToken
  private readonly maxActions: number;
  private proposal: AlphaProposal;

  constructor(provider: JsonRpcProvider, governor: Contract, votingToken: Contract, maxActions: number = 10) {
    this.provider = provider
    this.governor = governor as GovernorAlpha;
    this.votingToken = votingToken as VotingToken;
    this.maxActions = maxActions;

    this.proposal = new AlphaProposal(this.provider, this.governor, this.votingToken);
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
