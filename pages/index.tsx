import { useState, useEffect } from 'react'
import { useConnectWallet, useNotifications } from '@web3-onboard/react'
import Login from './login'
import { abi, address } from '@/blockchain_utils/apit' 
import { createPublicClient, http, createWalletClient, custom, parseEther } from 'viem'
import { sepolia } from 'viem/chains'

// Define the Memo type based on your Solidity struct
interface Memo {
  name: string;
  message: string;
  timestamp: bigint;
  from: string;
}

export default function Home() {
  const [{ wallet }] = useConnectWallet()
  const [, customNotification] = useNotifications()

  // State
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [memos, setMemos] = useState<Memo[]>([])

  // Initialize Public Client
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http()
  })

  // --- Function to fetch Memos ---
  const fetchMemos = async () => {
    try {
      const data = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: abi,
        functionName: 'getMemos',
      })
      setMemos(data as Memo[])
    } catch (err) {
      console.error("Error fetching memos:", err)
    }
  }

  // Fetch memos on mount and when wallet connects
  useEffect(() => {
    fetchMemos()
  }, [])

  async function buycoffee() {
    if (!name || !message || !wallet) return
    setLoading(true)

    try {
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(wallet.provider)
      })

      const [account] = await walletClient.getAddresses()

      // 1. Simulate the transaction to get the base gas estimate
      const { request } = await publicClient.simulateContract({
        account,
        address: address as `0x${string}`,
        abi,
        functionName: 'buyCoffee',
        args: [name, message],
        value: parseEther('0.001') 
      })

      /**
       * 2. Apply 30% Gas Buffer
       * We take the estimated gas and multiply by 1.3.
       * Using BigInt math: (gas * 130n) / 100n
       */
      const bufferedGas = request.gas ? (request.gas * 130n) / 100n : undefined;

      // 3. Send transaction with the modified gas limit
      const hash = await walletClient.writeContract({
        ...request,
        gas: bufferedGas
      })
      
      const { update } = customNotification({
        type: 'pending',
        message: 'Sending transaction with 30% gas buffer...',
      })

      // 4. Wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash })

      update({
        eventCode: 'coffeeSuccess',
        type: 'success',
        message: 'Coffee received! ☕',
        autoDismiss: 5000
      })

      // 5. Refresh the list and clear inputs
      setName('')
      setMessage('')
      await fetchMemos() 

    } catch (error: any) {
      console.error(error)
      customNotification({
        type: 'error',
        message: error.shortMessage || 'Transaction failed',
        autoDismiss: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  if (!wallet) return <Login />

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Buy me a COFFEE ☕</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          style={{ padding: '8px' }}
        />
        <input
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          style={{ padding: '8px' }}
        />
        <button 
          onClick={buycoffee} 
          disabled={loading}
          style={{ 
            padding: '10px', 
            backgroundColor: loading ? '#ccc' : '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : 'Send 0.001 ETH'}
        </button>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <h2>Recent Memos</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {memos.length === 0 && <p>No memos yet...</p>}
        {[...memos].reverse().map((memo, i) => (
          <div key={i} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
            <p><strong>{memo.name}</strong>: "{memo.message}"</p>
            <small style={{ color: '#666' }}>
              From: {memo.from.slice(0, 6)}...{memo.from.slice(-4)} | {new Date(Number(memo.timestamp) * 1000).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </main>
  )
}