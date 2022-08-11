import { ethers, network } from "hardhat";
import {
  developmentChains,
  NEW_STORE_VALUE,
  FUNC,
  PROPOSAL_DESCRIPTION,
  VOTING_DELAY,
  proposalsFile,
} from "../helper-hardhat-config";
import { GovernorContract } from "../typechain-types/contracts/governance_standard/GovernorContract";
import { Box } from "../typechain-types/contracts/Box";
import { moveBlocks } from "../utils/move-blocks";
import { TransactionReceipt } from "@ethersproject/providers";
import fs from "fs";

export async function propose(
  functionToCall: string,
  args: any[],
  proposalDescription: string
): Promise<void> {
  const governor: GovernorContract = await ethers.getContract("GovernorContract");
  const box: Box = await ethers.getContract("Box");
  //@ts-ignore
  const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args);
  console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`);
  console.log(`Proposal description: \n ${PROPOSAL_DESCRIPTION}`);
  const proposeTx = await governor.propose(
    [box.address],
    [0],
    [encodedFunctionCall],
    proposalDescription
  );
  const proposeReceipt: TransactionReceipt = await proposeTx.wait(1);

  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1);
  }

  //@ts-ignore
  const proposalId = proposeReceipt.events[0].args.proposalId;
  console.log(`Proposed with proposal ID:\n  ${proposalId}`);

  // save the proposalId
  let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  proposals[network.config.chainId!.toString()].push(proposalId.toString());
  fs.writeFileSync(proposalsFile, JSON.stringify(proposals));

  const proposalState = await governor.state(proposalId);
  const proposalSnapShot = await governor.proposalSnapshot(proposalId);
  const proposalDeadline = await governor.proposalDeadline(proposalId);

  // The state of the proposal. 1 is not passed. 0 is passed.
  console.log(`Current Proposal State: ${proposalState}`);
  // What block # the proposal was snapshot
  console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
  // The block number the proposal voting expires
  console.log(`Current Proposal Deadline: ${proposalDeadline}`);
}

propose(FUNC, [NEW_STORE_VALUE], PROPOSAL_DESCRIPTION)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
