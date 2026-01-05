import { useConnectWallet } from '@web3-onboard/react'


export default function Login() {

  const [
  {
    wallet
  },
  connect, // function to call to initiate user to connect wallet

] = useConnectWallet()

  return (
    <>
        <div>
          <h1>Connect Your wallet for the best experience</h1>
          <button onClick={()=>connect()}></button>
        </div>
    </>
  );
}
