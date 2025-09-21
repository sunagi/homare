// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TaskRegistry.sol";
import "../src/PayoutSplitter.sol";
import "../src/VerifierGateway.sol";

contract DeployWithTokenScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy VerifierGateway first
        console.log("\n1. Deploying VerifierGateway...");
        VerifierGateway verifierGateway = new VerifierGateway(address(0)); // Will be updated later
        console.log("VerifierGateway deployed to:", address(verifierGateway));

        // Deploy PayoutSplitter
        console.log("\n2. Deploying PayoutSplitter...");
        PayoutSplitter payoutSplitter = new PayoutSplitter(address(0), deployer); // Will be updated later
        console.log("PayoutSplitter deployed to:", address(payoutSplitter));

        // Deploy TaskRegistry
        console.log("\n3. Deploying TaskRegistry...");
        TaskRegistry taskRegistry = new TaskRegistry(address(verifierGateway), address(payoutSplitter));
        console.log("TaskRegistry deployed to:", address(taskRegistry));

        // Update addresses in other contracts
        console.log("\n4. Updating contract addresses...");
        
        // Update VerifierGateway with TaskRegistry address
        verifierGateway.setTaskRegistry(address(taskRegistry));
        console.log("Updated VerifierGateway with TaskRegistry address");

        // Update PayoutSplitter with TaskRegistry address
        payoutSplitter.setTaskRegistry(address(taskRegistry));
        console.log("Updated PayoutSplitter with TaskRegistry address");

        // Add native token (A0GI) as supported token for 0G testnet
        address NATIVE_TOKEN_ADDRESS = address(0); // Native token (A0GI) represented as address(0)
        taskRegistry.addSupportedToken(NATIVE_TOKEN_ADDRESS);
        payoutSplitter.addSupportedToken(NATIVE_TOKEN_ADDRESS);
        console.log("Added native token (A0GI) as supported token");

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("VerifierGateway:", address(verifierGateway));
        console.log("PayoutSplitter:", address(payoutSplitter));
        console.log("TaskRegistry:", address(taskRegistry));
        console.log("Platform Wallet:", deployer);

        console.log("\n=== Environment Variables ===");
        console.log("NEXT_PUBLIC_TASK_REGISTRY_ADDRESS=", address(taskRegistry));
        console.log("NEXT_PUBLIC_PAYOUT_SPLITTER_ADDRESS=", address(payoutSplitter));
        console.log("NEXT_PUBLIC_VERIFIER_GATEWAY_ADDRESS=", address(verifierGateway));
        console.log("NEXT_PUBLIC_NATIVE_TOKEN_ADDRESS=", NATIVE_TOKEN_ADDRESS);
        
        console.log("\n=== Token Support ===");
        console.log("Supported tokens can be added using:");
        console.log("taskRegistry.addSupportedToken(tokenAddress)");
        console.log("payoutSplitter.addSupportedToken(tokenAddress)");
    }
}
