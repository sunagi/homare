# Homare - Web3 Affiliate Platform on ØG Chain

A decentralized affiliate marketing platform built on ØG Chain that enables instant USDC payouts for Web3 task completion with multi-level referral rewards.

## What it does

Homare is a Web3 affiliate platform that operates on ØG Chain, where advertisers (protocols) set up "campaign tasks" (e.g., Swap, Bridge, SNS participation) that users complete to earn instant USDC rewards. The platform features a tree-structured referral network that automatically distributes earnings to direct and indirect referrers.

## Key Features

- **Instant USDC Payouts**: Immediate reward distribution upon task completion
- **Multi-level Referral System**: Automatic revenue sharing across referral tree
- **Sybil Attack Prevention**: AI-powered fraud detection using ØG Compute
- **On-chain & Off-chain Verification**: Supports both blockchain transactions and social media tasks
- **Transparent & Auditable**: All transactions and rewards are verifiable on ØG Chain

## Technologies Used

- **ØG Chain**: Task Registry, Payout Splitter, and verification logic
- **ØG Compute**: AI-powered sybil detection and verification adapters
- **ØG Storage/DA**: Tamper-proof log storage
- **EVM Smart Contracts**: Solidity contracts for task management and payouts
- **Oracle Layer**: On-chain transaction analysis and off-chain API verification
- **Frontend**: Next.js with TypeScript, Tailwind CSS, and Radix UI
- **Web3 Integration**: Wagmi, RainbowKit, and ethers.js

## Smart Contracts

### TaskRegistry.sol
- Manages campaign task creation and completion
- Handles task verification and reward distribution
- Integrates with verification oracle for fraud detection

### PayoutSplitter.sol
- Implements multi-level referral system
- Automatically distributes rewards to referrers
- Supports up to 3 levels of indirect referrals

### VerifierGateway.sol
- Gateway for ØG Compute verification services
- Handles both on-chain and off-chain task verification
- Manages sybil resistance scoring

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- WalletConnect Project ID

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/homare.git
cd homare
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Update the environment variables with your actual values:
   - `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: Your WalletConnect project ID
   - Contract addresses for deployed smart contracts
   - API keys for social media integrations

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Smart Contracts

1. Deploy contracts to ØG Chain:
```bash
# Deploy TaskRegistry
npx hardhat deploy --network ogchain --contract TaskRegistry

# Deploy PayoutSplitter  
npx hardhat deploy --network ogchain --contract PayoutSplitter

# Deploy VerifierGateway
npx hardhat deploy --network ogchain --contract VerifierGateway
```

2. Update contract addresses in environment variables

### Frontend

Deploy to Vercel or your preferred platform:

```bash
pnpm build
pnpm start
```

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   ØG Chain       │    │   ØG Compute    │
│   (Next.js)     │◄──►│   Smart Contracts│◄──►│   AI Models     │
│                 │    │                  │    │                 │
│   - Task UI     │    │   - TaskRegistry │    │   - Sybil Det.  │
│   - Wallet Conn │    │   - PayoutSplit  │    │   - Verification│
│   - Dashboard   │    │   - VerifierGate │    │   - Scoring     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Social APIs   │    │   ØG Storage     │    │   Oracle Layer  │
│                 │    │                  │    │                 │
│   - Twitter     │    │   - Task Logs    │    │   - On-chain    │
│                 │    │   - Proof Data   │    │   - Off-chain   │
│                 │    │   - Audit Trail  │    │   - Social      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Follow us on Twitter

## Roadmap

- [ ] Mobile app development
- [ ] Advanced AI verification models
- [ ] Cross-chain task support
- [ ] NFT-based achievements
- [ ] Governance token integration
- [ ] Advanced analytics dashboard