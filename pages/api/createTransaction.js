import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
	clusterApiUrl,
	Connection,
	PublicKey,
	Transaction,
	SystemProgram,
	LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
	createTransferCheckedInstruction,
	getAssociatedTokenAddress,
	getMint,
} from '@solana/spl-token';

import BigNumber from 'bignumber.js';
import products from './products.json';

const usdcAddress = new PublicKey(
	'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
);
const sellerAddress = 'kf7PbCsDj12jdaCBm6vMu2VNBBYoRMqrq2H6me2j8MW';
const sellerPublicKey = new PublicKey(sellerAddress);

const createTransaction = async (req, res) => {
	try {
		// Extract transaction data fron request body
		const { buyer, orderID, itemID } = req.body;

		// Check everything exists
		if (!buyer) {
			return res.status(400).json({
				message: 'Missing buyer address',
			});
		}

		if (!orderID) {
			return res.status(400).json({
				message: 'Missing order ID',
			});
		}

		const itemPrice = products.find((item) => item.id === itemID).price;

		if (!itemPrice) {
			return res.status(404).jsons({
				message: 'Item not found. please check item ID',
			});
		}

		// Convert price to correct format
		// todo: check what BigNumber is about
		const bigAmount = BigNumber(itemPrice);
		const buyerPublicKey = new PublicKey(buyer);

		const network = WalletAdapterNetwork.Devnet;
		const endpoint = clusterApiUrl(network);
		const connection = new Connection(endpoint);

		const buyerUsdcAddress = await getAssociatedTokenAddress(
			usdcAddress,
			buyerPublicKey
		);
		const shopUsdcAddress = await getAssociatedTokenAddress(
			usdcAddress,
			sellerPublicKey
		);
		const { blockhash } = await connection.getLatestBlockhash('finalized');

		const usdcMint = await getMint(connection, usdcAddress);

		//   init new transaction
		const tx = new Transaction({
			recentBlockhash: blockhash,
			blockhash: blockhash,
			feePayer: buyerPublicKey,
		});

		// specify transaction instructions

		// For SOL
		// const transferInstruction = SystemProgram.transfer({
		// 	fromPubkey: buyerPublicKey,
		// 	lamports: bigAmount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
		// 	toPubkey: sellerPublicKey,
		// });

		// For USDC / other spl-tokens
		const transferInstruction = createTransferCheckedInstruction(
			buyerUsdcAddress,
			usdcAddress,
			shopUsdcAddress,
			buyerPublicKey,
			bigAmount.toNumber() * 10 ** usdcMint.decimals,
			usdcMint.decimals
		);

		// Add order ID into transfer instruction as a Pubkey to retrieve later
		transferInstruction.keys.push({
			// Encode order ID as pubkey to store in transaction keys
			pubkey: new PublicKey(orderID),
			isSigner: false,
			isWritable: false,
		});

		// Put transaction together
		tx.add(transferInstruction);

		// Borsch serialize txs (format the tx into the needed formats)
		const serializeTransaction = tx.serialize({
			requireAllSignatures: false,
		});

		const base64 = serializeTransaction.toString('base64');

		res.status(200).json({
			transaction: base64,
		});
	} catch (error) {
		console.log(error);

		return res.status(500).json({
			error: 'error creating tx',
		});
	}
};

export default function handler(req, res) {
	if (req.method === 'POST') {
		createTransaction(req, res);
	} else {
		res.status(405).end();
	}
}
