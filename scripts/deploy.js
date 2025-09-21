const { ethers } = require("hardhat");

async function main() {
  console.log("Starting contract deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy VerifierGateway first
  console.log("\n1. Deploying VerifierGateway...");
  const VerifierGateway = await ethers.getContractFactory("VerifierGateway");
  const verifierGateway = await VerifierGateway.deploy(ethers.ZeroAddress); // Will be updated later
  await verifierGateway.waitForDeployment();
  const verifierGatewayAddress = await verifierGateway.getAddress();
  console.log("VerifierGateway deployed to:", verifierGatewayAddress);

  // Deploy PayoutSplitter
  console.log("\n2. Deploying PayoutSplitter...");
  const PayoutSplitter = await ethers.getContractFactory("PayoutSplitter");
  const payoutSplitter = await PayoutSplitter.deploy(
    ethers.ZeroAddress, // Will be updated after TaskRegistry deployment
    deployer.address // Platform wallet
  );
  await payoutSplitter.waitForDeployment();
  const payoutSplitterAddress = await payoutSplitter.getAddress();
  console.log("PayoutSplitter deployed to:", payoutSplitterAddress);

  // Deploy TaskRegistry
  console.log("\n3. Deploying TaskRegistry...");
  const TaskRegistry = await ethers.getContractFactory("TaskRegistry");
  const taskRegistry = await TaskRegistry.deploy(
    verifierGatewayAddress,
    payoutSplitterAddress
  );
  await taskRegistry.waitForDeployment();
  const taskRegistryAddress = await taskRegistry.getAddress();
  console.log("TaskRegistry deployed to:", taskRegistryAddress);

  // Update addresses in other contracts
  console.log("\n4. Updating contract addresses...");
  
  // Update VerifierGateway with TaskRegistry address
  await verifierGateway.setTaskRegistry(taskRegistryAddress);
  console.log("Updated VerifierGateway with TaskRegistry address");

  // Update PayoutSplitter with TaskRegistry address
  await payoutSplitter.setTaskRegistry(taskRegistryAddress);
  console.log("Updated PayoutSplitter with TaskRegistry address");

  // Add USDC as supported token (placeholder address for testnet)
  const USDC_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual USDC address
  await taskRegistry.addSupportedToken(USDC_ADDRESS);
  await payoutSplitter.addSupportedToken(USDC_ADDRESS);
  console.log("Added USDC as supported token");

  console.log("\n=== Deployment Summary ===");
  console.log("VerifierGateway:", verifierGatewayAddress);
  console.log("PayoutSplitter:", payoutSplitterAddress);
  console.log("TaskRegistry:", taskRegistryAddress);
  console.log("Platform Wallet:", deployer.address);

  console.log("\n=== Environment Variables ===");
  console.log("NEXT_PUBLIC_TASK_REGISTRY_ADDRESS=" + taskRegistryAddress);
  console.log("NEXT_PUBLIC_PAYOUT_SPLITTER_ADDRESS=" + payoutSplitterAddress);
  console.log("NEXT_PUBLIC_VERIFIER_GATEWAY_ADDRESS=" + verifierGatewayAddress);
  console.log("NEXT_PUBLIC_USDC_ADDRESS=" + USDC_ADDRESS);

  // Verify contracts (optional)
  console.log("\n5. Verifying contracts...");
  try {
    await hre.run("verify:verify", {
      address: verifierGatewayAddress,
      constructorArguments: [ethers.ZeroAddress],
    });
    console.log("VerifierGateway verified");
  } catch (error) {
    console.log("VerifierGateway verification failed:", error);
  }

  try {
    await hre.run("verify:verify", {
      address: payoutSplitterAddress,
      constructorArguments: [ethers.ZeroAddress, deployer.address],
    });
    console.log("PayoutSplitter verified");
  } catch (error) {
    console.log("PayoutSplitter verification failed:", error);
  }

  try {
    await hre.run("verify:verify", {
      address: taskRegistryAddress,
      constructorArguments: [verifierGatewayAddress, payoutSplitterAddress],
    });
    console.log("TaskRegistry verified");
  } catch (error) {
    console.log("TaskRegistry verification failed:", error);
  }

  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
