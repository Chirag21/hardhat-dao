import { run } from "hardhat";

const verify = async (contractAddress: string, args: any[]) => {
  console.log("Verifying.................");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified"))
      console.log("Contract is already verified!");
    else console.error(error);
  }
};

export default verify;
