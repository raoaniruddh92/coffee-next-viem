import { useConnectWallet } from '@web3-onboard/react'


export default function Login() {

  const [
  {
    wallet, // the wallet that has been connected or null if not yet connected
    connecting // boolean indicating if connection is in progress
  },
  connect, // function to call to initiate user to connect wallet
  disconnect, // function to call with wallet<DisconnectOptions> to disconnect wallet
  updateBalances, // function to be called with an optional array of wallet addresses connected through Onboard to update balance or empty/no params to update all connected wallets
  setWalletModules, // function to be called with an array of wallet modules to conditionally allow connection of wallet types i.e. setWalletModules([ledger, trezor, injected])
  setPrimaryWallet // function that can set the primary wallet and/or primary account within that wallet. The wallet that is set needs to be passed in for the first parameter and if you would like to set the primary account, the address of that account also needs to be passed in
] = useConnectWallet()

  if (!wallet){
    return (
        <div>
          <h1>Connect Your wallet for the best experience</h1>
          <button onClick={()=>connect()}></button>
        </div>
    )
  }
  return (
    <>
        <div>
          <h1>Connect Your wallet for the best experience</h1>
          <button onClick={()=>connect()}></button>
        </div>
    </>
  );
}
