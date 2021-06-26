// tslint:disable-next-line no-implicit-dependencies
import { assert } from "chai";
import { BigNumber } from "ethers";

import { AlphaProposalBuilder } from "../src/proposals";

import { useEnvironment } from "./helpers";

describe("AlphaProposalBuilder", function () {
  useEnvironment("hardhat-project");

  it("builds proposal", async function () {
    const governor = await this.hre.ethers.getContractAt(
      require("../abi/governorAlpha.json"),
      "0xc0da01a04c3f3e0be433606045bb7017a7323e38"
    );

    const x = governor.functions.castVote(BigNumber.from("1"), true);

    const a = new AlphaProposalBuilder(governor)
      .addAction(governor, "castVote", [BigNumber.from("1"), true])
      .build();
  });
});
