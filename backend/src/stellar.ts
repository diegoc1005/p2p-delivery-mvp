import * as StellarSdk from '@stellar/stellar-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Usamos el RPC de Soroban Testnet
const rpcServer = new StellarSdk.SorobanRpc.Server('https://soroban-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

// Esta será la wallet del "Servidor" (Funder), que paga los fees de las transacciones
// para proveer una experiencia Web2.5 "Gasless" al usuario.
const serverSecret = process.env.STELLAR_SECRET_KEY || 'SA......................';
let serverKeypair: StellarSdk.Keypair;

try {
    serverKeypair = StellarSdk.Keypair.fromSecret(serverSecret);
} catch (e) {
    // Fallback in case of no secret (for MVP dev mode only)
    serverKeypair = StellarSdk.Keypair.random();
    console.warn("WARNING: Usando clave aleatoria. Configura STELLAR_SECRET_KEY en .env");
}

export async function createAccount() {
    // Genera un nuevo par de claves para un usuario (Restaurante o Cliente)
    const pair = StellarSdk.Keypair.random();
    return {
        publicKey: pair.publicKey(),
        secret: pair.secret()
    };
}

export async function lockEscrow(orderId: string, restaurantPubKey: string, courierPubKey: string, amount: number) {
    console.log(`[Web3] Iniciando contrato Escrow para la orden ${orderId}...`);
    // En el Día 3, integraremos aquí la construcción de la transacción usando
    // StellarSdk.TransactionBuilder para invocar el contrato inteligente de Rust (.wasm).
    
    // Por ahora, simulamos el retraso de la red blockchain (aprox 3-5 segundos en Stellar)
    return new Promise(resolve => setTimeout(() => resolve(true), 3000));
}

export async function releaseEscrow(orderId: string) {
    console.log(`[Web3] Liberando fondos a Restaurante y Repartidor para orden ${orderId}...`);
    // Aquí invocaremos la función 'release' del Smart Contract.
    return new Promise(resolve => setTimeout(() => resolve(true), 3000));
}
