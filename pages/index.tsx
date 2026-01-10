import { useState, useEffect } from 'react'
import { useConnectWallet, useNotifications } from '@web3-onboard/react'
import { useSetChain } from '@web3-onboard/react'
import Login from './login'
import { abi, address } from '@/blockchain_utils/apit'
import {
  createPublicClient,
  http,
  createWalletClient,
  custom,
  parseEther
} from 'viem'
import { sepolia } from 'viem/chains'
import { useCopyToClipboard } from "@uidotdev/usehooks";

// --------------------
// Types
// --------------------
interface Memo {
  name: string
  message: string
  timestamp: bigint
  from: string
}

export default function Home() {
  // --------------------
  // Wallet / Chain
  // --------------------
  const [{ wallet }] = useConnectWallet()
  const [
    { connectedChain, settingChain },
    setChain
  ] = useSetChain()

  const [, customNotification] = useNotifications()
  const [copiedText, copyToClipboard] = useCopyToClipboard();

  // --------------------
  // State
  // --------------------
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [memos, setMemos] = useState<Memo[]>([])

  // --------------------
  // viem public client
  // --------------------
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http()
  })

  // --------------------
  // Fetch memos
  // --------------------
  const fetchMemos = async () => {
    try {
      const data = await publicClient.readContract({
        address: address as `0x${string}`,
        abi,
        functionName: 'getMemos'
      })
      setMemos(data as Memo[])
    } catch (err) {
      console.error('Error fetching memos:', err)
    }
  }

  // Fetch memos only when on correct chain
  useEffect(() => {
    if (connectedChain?.id === '0xaa36a7') {
      fetchMemos()
    }
  }, [connectedChain])

  // --------------------
  // Guards (ORDER MATTERS)
  // --------------------

  // 1. Wallet not connected
  if (!wallet) {
    return <Login />
  }

  // 2. Chain still resolving
  if (!connectedChain) {
    return <p style={{ padding: '2rem' }}>Detecting network…</p>
  }

  // 3. Wrong chain
  if (connectedChain.id !== '0xaa36a7') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Wrong Network</h1>
        <p>Please switch to Sepolia to continue.</p>

        <button
          onClick={() => setChain({ chainId: '0xaa36a7' })}
          disabled={settingChain}
          style={{
            padding: '10px 16px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: settingChain ? 'not-allowed' : 'pointer'
          }}
        >
          {settingChain ? 'Switching…' : 'Switch to Sepolia'}
        </button>
      </div>
    )
  }

  // --------------------
  // Buy Coffee
  // --------------------
  async function buycoffee() {
    if (!name || !message || !wallet) return

    setLoading(true)

    try {
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(wallet.provider)
      })

      const [account] = await walletClient.getAddresses()

      const { request } = await publicClient.simulateContract({
        account,
        address: address as `0x${string}`,
        abi,
        functionName: 'buyCoffee',
        args: [name, message],
        value: parseEther('0.001')
      })

      const bufferedGas = request.gas
        ? (request.gas * BigInt(130)) / BigInt(100)
        : undefined

      const hash = await walletClient.writeContract({
        ...request,
        gas: bufferedGas
      })

      const { update } = customNotification({
        type: 'pending',
        message: 'Sending transaction...'
      })

      await publicClient.waitForTransactionReceipt({
        hash,
        onReplaced: (replacement) => {
          if (replacement.reason === 'repriced') {
            customNotification({
              type: 'hint',
              message: 'Speed Up acknowledged',
            })
          }
        },
      })

      update({
        eventCode: 'coffeeSuccess',
        type: 'success',
        message: 'Coffee received ☕',
        autoDismiss: 5000
      })

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

  // --------------------
  // App UI
  // --------------------
  return (
    <main
      style={{
        padding: '2rem',
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: 'sans-serif'
      }}
    >
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
          <div
            key={i}
            style={{
              border: '1px solid #ddd',
              padding: '1rem',
              borderRadius: '8px'
            }}
          >
            <p>
              <strong>{memo.name}</strong>: "{memo.message}"
            </p>
            <small style={{ color: '#666' }}>
              From: {memo.from.slice(0, 6)}...
              {memo.from.slice(-4)} |{' '}
              {new Date(
                Number(memo.timestamp) * 1000
              ).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </main>
  )
}
