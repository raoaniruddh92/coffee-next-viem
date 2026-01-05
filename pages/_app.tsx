import type { AppProps } from "next/app";
import { Web3OnboardProvider, init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import { WagmiProvider } from 'wagmi'
import { config } from '../blockchain_utils/config'

const ethereumSepolia = {
  id: 11155111,
  token: 'ETH',
  label: 'Sepolia',
  rpcUrl: 'https://rpc.sepolia.org/'
}
const chains = [ethereumSepolia]
const wallets = [injectedModule()]
const web3Onboard = init({
  wallets,
  chains,
  appMetadata: {
    name: 'Fund me',
    icon: '<svg>App Icon</svg>',
    description: 'A demo of Web3-Onboard.'
  },
  connect: {
    autoConnectLastWallet: true
  }
})

export default function App({ Component, pageProps }: AppProps) {
  return (
        <WagmiProvider config={config}>
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      <Component {...pageProps} />
    </Web3OnboardProvider>
        </WagmiProvider>

  )}
