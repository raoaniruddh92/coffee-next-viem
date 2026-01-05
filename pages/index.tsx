import { useConnectWallet } from '@web3-onboard/react'
import Login from './login';
import { abi,bytecode } from '@/blockchain_utils/apit';
export default function Home() {

  const [
  {
    wallet, // the wallet that has been connected or null if not yet connected
  }
] = useConnectWallet()


  if (!wallet){
    return (
        <Login />
    )
  }
  return (
    <>
    <div>
    <h1>Buy me a COFFEE</h1>
    </div>
    </>
  );
}
