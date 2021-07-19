import { deployContract, Fixture, MockProvider } from "ethereum-waffle";
import { utils, Wallet } from "ethers";

import {
  GovernorAlpha,
  Timelock,
  TimelockTest,
  VotingToken,
  SimpleStorage
} from "./ethers-contracts";

interface BaseFixture {
  provider: MockProvider,
  wallets: Wallet[]
}

interface AlphaContracts {
  governor: GovernorAlpha;
  timelock: Timelock;
  votingToken: VotingToken;
}

interface Actors {
  deployer: Wallet;
  guardian: Wallet;
  proposer: Wallet;
  voter1: Wallet;
  voter2: Wallet;
  voter3: Wallet;
}

type AlphaContractsAndActorFixture = AlphaContracts & Actors & BaseFixture;

interface AlphaProposalsFixture extends AlphaContractsAndActorFixture {
  simpleStorage: SimpleStorage
} // can be extended in the future

export const alphaProposalFixture: Fixture<AlphaProposalsFixture> =
  async function (wallets: Wallet[], provider): Promise<AlphaProposalsFixture> {
    const [deployer, guardian, proposer, voter1, voter2, voter3] = wallets;

    const votingToken = (await deployContract(
      deployer,
      require("../src/bytecode/votingToken.json"),
      [deployer.address]
    )) as VotingToken;
    const harnessTimelock = (await deployContract(
      deployer,
      require("../src/bytecode/timelock__test.json"),
      [deployer.address, "172800"]
    )) as TimelockTest;

    const governor = (await deployContract(
      deployer,
      require("../src/bytecode/governorAlpha.json"),
      [harnessTimelock.address, votingToken.address, guardian.address]
    )) as GovernorAlpha;

    const simpleStorage = (await deployContract(deployer, require("../src/bytecode/simpleStorage.json"))) as SimpleStorage

    // transfer timelock to governor
    await harnessTimelock.connect(deployer).harnessSetAdmin(governor.address)
    const timelock: Timelock = harnessTimelock as Timelock

    // transfer tokens
    await votingToken
      .connect(deployer)
      .transfer(proposer.address, utils.parseUnits("100001"));
    await votingToken
      .connect(deployer)
      .transfer(voter1.address, utils.parseUnits("1000000"));
    await votingToken
      .connect(deployer)
      .transfer(voter2.address, utils.parseUnits("500000"));
    await votingToken
      .connect(deployer)
      .transfer(voter3.address, utils.parseUnits("1000"));

      
      // self delegate
    await votingToken.connect(proposer).delegate(proposer.address);
    await votingToken.connect(voter1).delegate(voter1.address);
    await votingToken.connect(voter2).delegate(voter2.address);
    await votingToken.connect(voter3).delegate(voter3.address);

    return {
      governor,
      timelock,
      votingToken,
      deployer,
      guardian,
      proposer, // distribute 100,001 tokens (proposal threshold)
      voter1, // distribute 1,000,000 tokens
      voter2, // distribute   500,000 tokens
      voter3, // distribute     1,000 tokens
      provider,
      wallets,
      simpleStorage: simpleStorage
    };
  };
