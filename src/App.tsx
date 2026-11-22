import { useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import idl from './config/idl.json';
import programa from './config/programa.json';
import '@solana/wallet-adapter-react-ui/styles.css';

const ReservasApp = () => {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [horario, setHorario] = useState("");
  const [idUsuario, setIdUsuario] = useState(1);
  const [loading, setLoading] = useState(false);

  // Estado para el nombre de la cancha (aunque en tu programa la PDA se genera con el owner,
  // podemos mostrarlo en la interfaz para dar contexto)
  const [nombreCancha, setNombreCancha] = useState("Cancha Central");

  const handleReserva = async () => {
    if (!connected || !publicKey) return alert("Conecta tu wallet primero");
    if (!horario) return alert("Escribe un horario");
    
    setLoading(true);
    try {
      const provider = new anchor.AnchorProvider(connection, { publicKey, signTransaction: signTransaction as any } as any, { commitment: 'confirmed' });
const program = new anchor.Program(idl as any, new PublicKey(programa.programId), provider);

      const [pdaCancha] = PublicKey.findProgramAddressSync(
        [Buffer.from("cancha"), publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .hacerReserva(idUsuario, horario, 50)
        .accounts({ owner: publicKey, cancha: pdaCancha })
        .rpc();

      alert(`¡Reserva exitosa en ${nombreCancha}! TxHash: ${tx}`);
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      {/* Barra superior con el logo y la wallet */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", backgroundColor: "white", padding: "15px 30px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "24px", fontWeight: "bold", color: "#14F195" }}>W</span>
          <h2 style={{ margin: 0, color: "#333" }}>WayLearn Reservas</h2>
        </div>
        <WalletMultiButton />
      </div>
      
      {/* Contenido principal */}
      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "white", padding: "40px", borderRadius: "15px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
        <h1 style={{ textAlign: "center", color: "#1a1a1a", marginBottom: "10px" }}>Sistema de Reservas</h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>Proyecto Final - Solana Engineering Track</p>
        
        <div style={{ marginBottom: "25px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#444" }}>Nombre de la Cancha:</label>
          <input 
            type="text" 
            value={nombreCancha} 
            onChange={(e) => setNombreCancha(e.target.value)} 
            style={{ padding: "12px", width: "100%", border: "1px solid #ddd", borderRadius: "8px", fontSize: "16px" }} 
            placeholder="Ej. Cancha Central"
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#444" }}>ID de Usuario:</label>
          <input 
            type="number" 
            value={idUsuario} 
            onChange={(e) => setIdUsuario(Number(e.target.value))} 
            style={{ padding: "12px", width: "100%", border: "1px solid #ddd", borderRadius: "8px", fontSize: "16px" }} 
          />
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#444" }}>Horario de la Reserva:</label>
          <input 
            type="text" 
            placeholder="Ej. 2026-11-25 15:00" 
            value={horario} 
            onChange={(e) => setHorario(e.target.value)} 
            style={{ padding: "12px", width: "100%", border: "1px solid #ddd", borderRadius: "8px", fontSize: "16px" }} 
          />
        </div>

        <button 
          onClick={handleReserva} 
          disabled={loading} 
          style={{ 
            width: "100%", 
            padding: "15px", 
            backgroundColor: loading ? "#ccc" : "#14F195", 
            color: "#000", 
            border: "none", 
            borderRadius: "8px", 
            fontWeight: "bold", 
            fontSize: "18px", 
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.3s"
          }}
        >
          {loading ? "Procesando transacción..." : "Reservar Cancha"}
        </button>

        {connected && (
          <div style={{ marginTop: "25px", textAlign: "center", padding: "15px", backgroundColor: "#e8f5e9", borderRadius: "8px", border: "1px solid #c8e6c9" }}>
            <p style={{ margin: 0, color: "#2e7d32", fontWeight: "bold" }}>
              ✅ Wallet conectada: {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ReservasApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}