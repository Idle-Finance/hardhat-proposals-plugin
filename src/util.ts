import { BigNumber } from "ethers";

export function toBigNumber(x: any): BigNumber {return BigNumber.from(x.toString())}
