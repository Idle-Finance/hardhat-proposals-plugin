// tslint:disable-next-line no-implicit-dependencies
import { createFixtureLoader } from "@ethereum-waffle/provider";
import { assert } from "chai";
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

    const { governor, votingToken, proposer, simpleStorage } = await loadFixture(alphaProposalFixture);

    let proposal = this.hre.proposals.builders.alpha()
      .setGovernor(governor)
      .setVotingToken(votingToken)
      .setProposer(proposer)
      .addAction(simpleStorage, "set", [BigNumber.from("1")])
      .addAction(simpleStorage, "set", [BigNumber.from("2")])
      .addAction(simpleStorage, "set", [BigNumber.from("3")])
      .addAction(simpleStorage, "set", [BigNumber.from("4")])
      .addAction(simpleStorage, "set", [BigNumber.from("5")])
      .addAction(simpleStorage, "set", [BigNumber.from("6")])
      // .addAction(governor, "castVote", [BigNumber.from("1"), true])
      .addAction(simpleStorage, "set", [BigNumber.from("8")])
      .addAction(simpleStorage, "set", [BigNumber.from("9")])
      .addAction(simpleStorage, "set", [BigNumber.from("10")])
      .setDescription("Test Proposal")
      .build();

    // await proposal.propose();

    await proposal.simulate()

    console.log(await simpleStorage.get())
    // await proposal.queue()
    // await proposal.execute()


    await proposal.printProposalInfo()
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
      .addAction(simpleStorage, "set", [BigNumber.from("1")])
      .addAction(simpleStorage, "set", [BigNumber.from("2")])
      .addAction(simpleStorage, "set", [BigNumber.from("3")])
      .setDescription("Test Proposal")
      .build();

    await proposal.propose();
    await provider.send("evm_mine", [])
    await provider.send("evm_mine", [])
    await proposal.vote(proposer);
    await proposal.vote(voter2, false);

    let fetchedProposal = this.hre.proposals.proposals.alpha()
    fetchedProposal.setGovernor(governor)
    fetchedProposal.setVotingToken(votingToken)

    await this.hre.run("proposal", { governor: governor.address, 'votingToken': votingToken.address, id: 1})
  })
});
