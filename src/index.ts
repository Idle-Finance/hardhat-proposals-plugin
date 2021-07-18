import { task, extendEnvironment , extendConfig} from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import path from "path";

import { AlphaProposal, AlphaProposalBuilder } from "./proposals";
// import { ExampleHardhatRuntimeEnvironmentField } from "./ExampleHardhatRuntimeEnvironmentField";
// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import "./type-extensions";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    // We apply our default config here. Any other kind of config resolution
    // or normalization should be placed here.
    //
    // `config` is the resolved config, which will be used during runtime and
    // you should modify.
    // `userConfig` is the config as provided by the user. You should not modify
    // it.
    //
    // If you extended the `HardhatConfig` type, you need to make sure that
    // executing this function ensures that the `config` object is in a valid
    // state for its type, including its extentions. For example, you may
    // need to apply a default value, like in this example.
    const userGovernor = userConfig.proposals?.governor
    const userVotingToken = userConfig.proposals?.votingToken

    config.proposals = {
      governor: userGovernor ? userGovernor : "",
      votingToken: userVotingToken ? userVotingToken : ""
    }
  }
);

extendEnvironment((hre) => {
  // We add a field to the Hardhat Runtime Environment here.
  // We use lazyObject to avoid initializing things until they are actually
  // needed.
  hre.proposals = lazyObject(() => {
    return {
      builders: {
        alpha: async () => new AlphaProposalBuilder(hre, hre.config.proposals.governor, hre.config.proposals.votingToken)
      }
    }
  });
});
