// tslint:disable-next-line no-implicit-dependencies
import { createFixtureLoader } from "@ethereum-waffle/provider";
import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

import { alphaProposalFixture } from "./fixtures";
import { useEnvironment } from "./helpers";

describe("AlphaProposalBuilder", function () {
  useEnvironment("hardhat-project")

  it("builds proposal", async function() {

    const loadFixture = this.hre.waffle.createFixtureLoader(
      this.hre.waffle.provider.getWallets(),
      this.hre.waffle.provider
    );

    const { governor, votingToken, proposer, voter2, simpleStorage } = await loadFixture(alphaProposalFixture);

    let proposal = this.hre.proposals.builders.alpha()
      .setGovernor(governor)
      .setVotingToken(votingToken)
      .setProposer(voter2)
      .addContractAction(simpleStorage, "set", [BigNumber.from("1")])
      .addContractAction(simpleStorage, "set", [BigNumber.from("2")])
      .addContractAction(simpleStorage, "set", [BigNumber.from("3")])
      .addContractAction(simpleStorage, "set", [BigNumber.from("4")])
      .addContractAction(simpleStorage, "set", [BigNumber.from("5")])
      .addContractAction(simpleStorage, "set", [BigNumber.from("6")])
      // .addContractAction(governor, "castVote", [BigNumber.from("1"), true])
      .addContractAction(simpleStorage, "set", [BigNumber.from("8")])
      .addContractAction(simpleStorage, "set", [BigNumber.from("9")])
      .addContractAction(simpleStorage, "set", [BigNumber.from("10")])
      .setDescription("Test Proposal")
      .build();

    // await proposal.propose();

    await proposal.simulate()

    let storageValue = await simpleStorage.get()
    expect(storageValue).to.equal(BigNumber.from("10"))
  });

  it("loads proposal via task", async function() {
    const loadFixture = this.hre.waffle.createFixtureLoader(
      this.hre.waffle.provider.getWallets(),
      this.hre.waffle.provider
    );

    const { provider, governor, votingToken, proposer, simpleStorage, voter2 } = await loadFixture(alphaProposalFixture);

    let proposal = this.hre.proposals.builders.alpha()
      .setGovernor(governor)
      .setVotingToken(votingToken)
      .setProposer(proposer)
      .addContractAction(simpleStorage, "set", [BigNumber.from("1")])
      .addContractAction(simpleStorage, "set", [BigNumber.from("2")])
      .addContractAction(simpleStorage, "set", [BigNumber.from("3")])
      .setDescription("Test Proposal")
      .build();

    await proposal.propose();
    await provider.send("evm_mine", [])
    await provider.send("evm_mine", [])
    await proposal.vote(proposer);
    await proposal.vote(voter2, false);

    await this.hre.run("proposal", { governor: governor.address, votingToken: votingToken.address, id: proposal.id.toNumber()})
  })
});
