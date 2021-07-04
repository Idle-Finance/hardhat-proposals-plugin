// tslint:disable-next-line no-implicit-dependencies
import { loadFixture } from "@ethereum-waffle/provider";
import { assert } from "chai";
import { BigNumber } from "ethers";

import { AlphaProposalBuilder } from "../src/proposals";

import { alphaProposalFixture } from "./fixtures";

describe("AlphaProposalBuilder", function () {
  it("builds proposal", async function () {
    const { governor, proposer, voter1 } = await loadFixture(alphaProposalFixture);

    const proposal = new AlphaProposalBuilder(governor)
      .setProposer(proposer)
      .addAction(governor, "castVote", [BigNumber.from("1"), true])
      .addAction(governor, "castVote", [BigNumber.from("2"), false], 5)
      .setDescription("Test Proposal")
      .build();

    await proposal.propose();

    // await proposal.vote(voter1)
    // await proposal.queue()
    // await proposal.execute()

    await proposal.printProposalInfo()
  });
});
