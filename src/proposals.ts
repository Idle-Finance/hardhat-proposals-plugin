import { BigNumber, BytesLike, Contract, Signer, utils, ContractReceipt, ContractTransaction, BigNumberish } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
// import { EthereumProvider } from "hardhat/types";
import { Result, defaultAbiCoder } from "ethers/lib/utils";
import { EthereumProvider, HardhatRuntimeEnvironment } from "hardhat/types";
import { HardhatPluginError } from "hardhat/plugins";

import { GovernorAlpha, VotingToken } from "./ethers-contracts/index"
import { Timelock__factory } from "./ethers-contracts/factories/Timelock__factory";

import { AlphaProposalState, IAlphaProposal } from "./types";

export class AlphaProposal implements IAlphaProposal {
  private readonly hre: HardhatRuntimeEnvironment
  public readonly ethersProvider: JsonRpcProvider
  public readonly provider: EthereumProvider
  
  public governor?: GovernorAlpha;
  public votingToken?: VotingToken;

  public id: BigNumber;
  public proposer: Signer | null;
  public targets: string[];
  public values: BigNumber[];
  public signatures: string[];
  public calldatas: BytesLike[];

  public description: string;

  public contracts: (Contract | null)[];
  public args: (Result)[];

  constructor(hre: HardhatRuntimeEnvironment, governor?: GovernorAlpha, votingToken?: VotingToken) {
    this.hre = hre
    this.provider = hre.network.provider;
    this.ethersProvider = hre.ethers.provider;

    this.governor = governor
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

  public setGovernor(governor: GovernorAlpha) {
    this.governor = governor
  }

  public setVotingToken(votingToken: VotingToken) {
    this.votingToken = votingToken
  }

  public _ready() : boolean {
    return this.governor !== undefined && this.votingToken !== undefined
  }

  public async propose(proposer?: Signer) {
    if (!this._ready()) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Cannot execute without governor or voting token")
    }
    if (proposer) {
      this.proposer = proposer
    }

    if (this.proposer) {
      const governorAsProposer = this.governor!.connect(this.proposer)
      const proposalId = await governorAsProposer.callStatic.propose(
        this.targets,
        this.values,
        this.signatures,
        this.calldatas,
        this.description
      );

      await governorAsProposer.propose(
        this.targets,
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

  public async loadFromId(id: BigNumberish) {
    if (this.governor === undefined) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Cannot load data without governor")
    }

    this.id = BigNumber.from(id)
    let proposalInfo = await this.governor.proposals(id)
    let actionsInfo = await this.governor.getActions(id)

    this.proposer = new this.hre.ethers.VoidSigner(proposalInfo.proposer)
    this.targets = actionsInfo.targets
    this.values = actionsInfo[1] // `values` gets overwrittn by array.values
    this.signatures = actionsInfo.signatures
    this.calldatas = actionsInfo.calldatas

    this.description = "<DESCRIPTION NOT LOADED>"
    
    let args = []
    
    for (let i = 0; i < this.targets.length; i++) {
      const signature = this.signatures[i];
      const calldata = this.calldatas[i];

      const arg = defaultAbiCoder.decode([ signature ], calldata);
      args.push(arg)
    }
    
    this.args = args
  }

  private proposalSubmitted() {
    return !this.id.isZero()
  }

  private async getProposalState(): Promise<AlphaProposalState> {
    if (!this._ready()) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Cannot execute without governor or voting token")
    }
    if (!this.proposalSubmitted()) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Proposal has not been submitted yet")
    }
    const proposalState = await this.governor!.state(this.id)

    return proposalState as AlphaProposalState
  }

  public async vote(signer: Signer, support: boolean=true) {
    if (!this._ready()) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Cannot execute without governor or voting token")
    }
    if (!this.proposalSubmitted()) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Proposal has not been submitted yet")
    }

    let currentState = await this.getProposalState()
    if (currentState == AlphaProposalState.Active) {
      await this.governor!.connect(signer).castVote(this.id, support)
    } else {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Proposal is not in an active state")
    }
  }

  public async queue(signer?: Signer) {
    if (!this._ready()) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Cannot execute without governor or voting token")
    }
    if (!this.proposalSubmitted()) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Proposal has not been submitted yet")
    }

    let governor = this.governor
    if (signer) {
      governor = governor!.connect(signer)
    }

    await governor!.queue(this.id)
  }

  public async execute(signer?: Signer) {
    if (!this._ready()) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Cannot propose without a proposer")
    }
    if (!this.proposalSubmitted()) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Proposal has not been submitted yet")
    }

    let governor = this.governor
    if (signer) {
      governor = governor!.connect(signer)
    }

    await governor!.execute(this.id)
  }

  // queues the action to the timelock by impersonating the governor
  // advances time in order to execute proposal
  // analyses errors
  public async simulate() {
    if (!this._ready()) {
      throw new HardhatPluginError("hardhat-proposals-plugin", "Cannot execute without governor or voting token")
    }
    // if (!(this.provider instanceof Ethereu)) {
    //   throw new HardhatPluginError("hardhat-proposals-plugin", "Cannot simulate on this provider")
    // }
    await this.provider.send("hardhat_impersonateAccount", [this.governor!.address])
    await this.provider.send("hardhat_setBalance", [this.governor!.address, "0xffffffffffffffff"])
    let governorSigner = await this.hre.ethers.getSigner(this.governor!.address)

    let timelock = Timelock__factory.connect(await this.governor!.timelock(), governorSigner)
    
    await this.provider.send("hardhat_impersonateAccount", [timelock.address])
    await this.provider.send("hardhat_setBalance", [timelock.address, "0xffffffffffffffff"])
    let timelockSigner = await this.ethersProvider.getSigner(timelock.address)
    
    let blockInfo = await this.ethersProvider.getBlock("latest")
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
    await this.provider.send("hardhat_stopImpersonatingAccount", [this.governor!.address])
    await this.provider.send("hardhat_stopImpersonatingAccount", [timelock.address])
  }

  public async printProposalInfo() {
    console.log('--------------------------------------------------------')
    if (this.proposalSubmitted() && this._ready()) {
      const proposalInfo = await this.governor!.proposals(this.id)
      const state = await this.getProposalState()
      
      let votingTokenName = await this.votingToken!.name();
      let votingTokenDecimals = BigNumber.from("10").pow(await this.votingToken!.decimals());
      
      console.log(`Id: ${this.id.toString()}`)
      console.log(`Description: ${this.description}`)
      console.log(`For Votes: ${proposalInfo.forVotes.div(votingTokenDecimals)} ${votingTokenName} Votes`)
      console.log(`Agasint Votes: ${proposalInfo.againstVotes.div(votingTokenDecimals)} ${votingTokenName} Votes`)

      console.log(`Vote End: ${proposalInfo.endBlock}`)

      console.log(`State: ${state.toString()}`)
    } else if (this._ready()) {
      console.log("Unsubmitted proposal")
      console.log(`Description: ${this.description}`)
    } else {
      console.log("Cannot execute without governor or voting token")
      return
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
      for (let j = 0; j < args.length-1; j++) {
        const arg = args[j];
        console.log(` ├─ args [ ${j} ] ─ ${arg}`)
      }
      console.log(` └─ args [ ${args.length-1} ] ─ ${args[args.length-1]}`)
    }
  }
}
