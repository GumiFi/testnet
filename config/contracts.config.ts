export const NETWORK = {
  name: "GIWA Sepolia Testnet",
  chainId: 91342,
  chainIdHex: "0x164ce",
  rpcUrl: "https://sepolia-rpc.giwa.io",
  explorerUrl: "https://sepolia-explorer.giwa.io",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
} as const;

export const CONTRACT_ADDRESSES = {
  gumiForwarder: "0x7Ba4f4836e0146c6fbE18f68349777c0a7756439",
  customMultisig: "0x171042Ea4c81fCb64a3E4d7229DDcD11008Fbdd5",
  gumiToken: "0xbB5915f5f067EB759Ecbd50Cd402fd7253014155",
  feeConfigRegistry: "0x3a3c9dfc2aF3F2b459d6512B8F31A5d7BDBB1ab3",
  gumiTreasury: "0xF0AF8f2b9Ec7b5Cf24Ca640e07d33fE7e07f73b9",
  gumiRouter: "0x37af0d21537B89ad0EAe9D63bd9021A1dE5A82B1",
  gumiGaslessRouter: "0x1ff0A939ae12F1cb01208A2c6E709fE9d2d68D96",
  gumiFactory: "0xb058EB5ED9ea25E597cFbaa7f792b20340EbD1C9",
  priceOracle: "0xb127C59935ba65eD226736e65A1022661e09CcAf",
  liquidityLocker: "0x0Ab8EE0C1dD8F59620864672e84146b4418a9EE7",
  liquidityBoostVault: "0xA4a4b6528A24D70b544eE902e7073afe661b3aEC",
  buybackSwapper: "0x2E953a6750Cd0b75b96b638CaBcb0fdb975F870e",
  buybackRelayer: "0x4bC5513B2e5d8adf772cc764C553e293bC0f7C1a",
  burnVault: "0x443ea1b1F62EdBF05D1EC942Aa4597594c594A21",
  launchpadRegistry: "0x6aa2CE1b5baE34d04502C68c411bE45092c8aF83",
  launchpadFactory: "0x1a501880B21E5E2c88b2886aD4e2be7BB1677Ceb",
  launchpadCoinImpl: "0x13310d0C16f744484CAc0374dcAa9B5057f526A5",
  bondingCurveEngine: "0xE5eB1efaE276a02c1E07044BF6832e3c6e610f42",
  graduationManager: "0x226d54d406AABDe8C39AE0C8D7EbDD1c20Fb18b0",
  vestingVault: "0x308BBD7BAF7F4987eD799632a488586F985451c3",
  airdropClaim: "0xF9e13FA739028653386C4F8209A062FEa128dC9D",
  simpleTokenFactory: "0x23df23ECE20828afaB5774e679b2E9C1eBEbe99a",
  simpleERC20Impl: "0xc1Fd57Be485FECc606f1bff9A7F56ec775633598",
  advancedTokenFactory: "0xA9Dd89d360C5FfBc17830262A559275908a4E835",
  advancedERC20Standard: "0xd7f62060849E85f61da40D27EddB1c7443F1Cd43",
  advancedERC20AntiWhale: "0xb997FD75859aEc57a7E30345eA9730b1fb4EAFd9",
  advancedERC20Reflection: "0xAf51D738322b96B51bEb3819AC96A1e3F30223Fd",
  advancedERC20Deflationary: "0x5586fC06F2971773E6F95D2Ba9Adfe44FF071458",
  advancedERC20LiquidityGenerator: "0xc10570517707a212ae507E8a4c73708447d4e222",
  nftFactory: "0x12E96B472ffd9F4d03557244630FbbACdd5Ccb63",
  gumiNFTImpl: "0xcDb10359c77Ed4Bb14cB142eB416E7309046690C",
  nftMarketplace: "0x6AB8cFa36365CEbF10073bD1C38E674B5a82E43F",
  nftMarketplaceAuction: "0x655898E28AcdF9DD986e3a6e16cCc9716144Dfca",
  gumiStaking: "0xFf1FC08fBcd790759A78112765799560302722Ea",
  gumiCustomNFT: "0x09Df2e6275E31D4189FFD4F32dd7369777D4D681",
} as const;

export type ContractName = keyof typeof CONTRACT_ADDRESSES;

export function getContractAddress(name: ContractName): string {
  return CONTRACT_ADDRESSES[name];
}

export function getExplorerAddressUrl(address: string): string {
  return `${NETWORK.explorerUrl}/address/${address}`;
}
