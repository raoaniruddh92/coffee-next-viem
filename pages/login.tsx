import { useConnectWallet } from '@web3-onboard/react'

export default function Login() {
  const [{ wallet, connecting }, connect] = useConnectWallet()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
        fontFamily: 'sans-serif'
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '2.5rem',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}
      >
        <h1 style={{ marginBottom: '0.5rem' }}>
          ☕ Buy Me a Coffee
        </h1>

        <p
          style={{
            marginBottom: '2rem',
            color: '#555',
            fontSize: '1rem',
            lineHeight: 1.5
          }}
        >
          Connect your wallet to leave a message and
          support the creator with a coffee.
        </p>

        <button
          onClick={() => connect()}
          disabled={connecting}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '1rem',
            fontWeight: 600,
            backgroundColor: connecting ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: connecting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {connecting ? 'Connecting…' : 'Connect Wallet'}
        </button>

        <p
          style={{
            marginTop: '1.5rem',
            fontSize: '0.85rem',
            color: '#888'
          }}
        >
          Supports MetaMask
        </p>
      </div>
    </div>
  )
}
