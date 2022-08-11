import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig, MIN_DELAY } from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployTimeLock: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, network, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { log, deploy } = deployments;

  const args = [MIN_DELAY, [], []];

  const timelock = await deploy("TimeLock", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });

  log(`Timelock deployed at : ${timelock.address}`);

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(timelock.address, args);
  }
};

export default deployTimeLock;
deployTimeLock.tags = ["all", "timelock"];
