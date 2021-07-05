// tslint:disable-next-line no-implicit-dependencies
import { createFixtureLoader } from "@ethereum-waffle/provider";
import { assert } from "chai";
import { BigNumber } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

import { AlphaProposalBuilder } from "../src/proposals";

import { alphaProposalFixture } from "./fixtures";
import { useEnvironment } from "./helpers";

describe("AlphaProposalBuilder", function () {
  useEnvironment("hardhat-project")

  it("builds proposal", async function () {
    this.hre.waffle.provider

    const loadFixture = this.hre.waffle.createFixtureLoader(
      this.hre.waffle.provider.getWallets(),
      this.hre.waffle.provider
    );

    const { provider, governor, votingToken, proposer, simpleStorage } = await loadFixture(alphaProposalFixture);

    const proposal = new AlphaProposalBuilder(provider, governor, votingToken)
      .setProposer(proposer)
      .addAction(simpleStorage, "set", [BigNumber.from("1")])
      .addAction(simpleStorage, "set", [BigNumber.from("2")])
      .addAction(simpleStorage, "set", [BigNumber.from("3")])
      .addAction(simpleStorage, "set", [BigNumber.from("4")])
      .addAction(simpleStorage, "set", [BigNumber.from("5")])
      .addAction(simpleStorage, "set", [BigNumber.from("6")])
      .addAction(governor, "castVote", [BigNumber.from("1"), true])
      .addAction(simpleStorage, "set", [BigNumber.from("8")])
      .addAction(simpleStorage, "set", [BigNumber.from("9")])
      .addAction(simpleStorage, "set", [BigNumber.from("10")])
      .setDescription("Test Proposal")
      .build();

    await proposal.propose();

    await proposal.simulate()

    console.log(await simpleStorage.get())
    // await proposal.queue()
    // await proposal.execute()


    await proposal.printProposalInfo()
  });
});
