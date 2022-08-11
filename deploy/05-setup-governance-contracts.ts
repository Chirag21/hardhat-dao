import { TransactionResponse } from "@ethersproject/providers";
import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { TimeLock, GovernorContract } from "../typechain-types";
import { ADDRESS_ZERO } from "../helper-hardhat-config";

const setupContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();
  const timeLock: TimeLock = await ethers.getContract("TimeLock", deployer);
  const governor: GovernorContract = await ethers.getContract("GovernorContract", deployer);

  log("----------------------------------------------------");
  log("Setting up contracts for roles...");
  // would be great to use multicall here...
  const proposerRole = await timeLock.PROPOSER_ROLE();
  const executorRole = await timeLock.EXECUTOR_ROLE();
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

  const proposerTx = await timeLock.grantRole(proposerRole, governor.address);
  await proposerTx.wait(1);
  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
  await executorTx.wait(1);
  // Now that access are allocated revoke the role from deployer.
  const revokeTx: TransactionResponse = await timeLock.revokeRole(adminRole, deployer);
  await revokeTx.wait(1);
  // Now, anything the timelock wants to do has to go th  const {abi}  =TimeLock;
};

export default setupContracts;
setupContracts.tags = ["all", "setup"];
