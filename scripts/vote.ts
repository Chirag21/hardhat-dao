import fs from "fs";
import { developmentChains, proposalsFile, VOTING_PERIOD } from "../helper-hardhat-config";
import { network } from "hardhat";
import { ethers } from "hardhat";
import { GovernorContract } from "../typechain-types/contracts/governance_standard/GovernorContract";
import { ContractReceipt, ContractTransaction } from "@ethersproject/contracts";
import { moveBlocks } from "../utils/move-blocks";
import { BigNumberish } from "ethers";

const index = 0;

async function main(proposalIndex: number) {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  const proposalId = <BigNumberish>proposals[network.config.chainId!][proposalIndex];

  console.log(proposalId);

  // 0=Against, 1=For, 2=Abstain
  const voteType = 1;
  const reason = "Because I can";
  await vote(proposalId, voteType, reason);
}

async function vote(proposalId: BigNumberish, voteType: number, reason: string) {
  const governor: GovernorContract = await ethers.getContract("GovernorContract");
  console.log("Voting....");
  const voteTx: ContractTransaction = await governor.castVoteWithReason(
    proposalId,
    voteType,
    reason
  );
  const voteTxReceipt: ContractReceipt = await voteTx.wait(1);
  console.log("Voted!");
  console.log(voteTxReceipt.events![0].args!.reason);
  const proposalState = await governor.state(proposalId);
  console.log(`Current proposal state : ${proposalState}`);

  // move the blocks to go at end voting period
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1);
  }
}

main(index)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
