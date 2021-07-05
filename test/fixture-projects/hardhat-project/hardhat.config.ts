// We load the plugin here.
// tslint:disable-next-line no-implicit-dependencies
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle"
import { HardhatUserConfig } from "hardhat/types";

import "../../../src/index";

const config: HardhatUserConfig = {
  solidity: "0.7.3",
  defaultNetwork: "hardhat"
};

export default config;
