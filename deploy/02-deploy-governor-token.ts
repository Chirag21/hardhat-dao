import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
import verify from "../utils/verify";
import { ethers } from "hardhat";
import { TransactionResponse } from "@ethersproject/providers";

const deployGovernorToken: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, network } = hre;
  const { deployer } = await getNamedAccounts();
  const { log, deploy } = deployments;
  log("---------------------------------------------------------");
  log("Deploying GovernanceToken contract and waiting for confirmations...");
  const governanceToken = await deploy("GovernanceToken", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });

  log(`GovernanceToken deployed at : ${governanceToken.address}`);

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(governanceToken.address, []);
  }

  await delegate(governanceToken.address, deployer);
  log("Delegated");
};

const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
  const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress);
  const tx: TransactionResponse = await governanceToken.delegate(delegatedAccount);
  const txResponse = await tx.wait(1);
  console.log(`Checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`);
};

export default deployGovernorToken;
deployGovernorToken.tags = ["all", "governor"];
