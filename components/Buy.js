import React, { useState, useMemo, useEffect } from 'react';
import { Keypair, Transaction } from '@solana/web3.js';
import { findReference, FindReferenceError } from '@solana/pay';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { InfinitySpin } from 'react-loader-spinner';
import IPFSDownload from './IpfsDownload';
import { addOrder, hasPurchased, fetchItem } from '../lib/api';

const STATUS = {
	Initial: 'Initial',
	Submitted: 'Submitted',
	Paid: 'Paid',
};

export default function Buy({ itemID }) {
	const { connection } = useConnection();
	const { publicKey, sendTransaction } = useWallet();

	// Order ID will be a keypair and appear in the tx instructions in the blockchain
	const orderID = useMemo(() => Keypair.generate().publicKey, []);

	const [item, setItem] = useState(null);
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState(STATUS.Initial);

	const order = useMemo(
		() => ({
			buyer: publicKey.toString(),
			orderID: orderID.toString(),
			itemID: itemID,
		}),
		[publicKey, orderID, itemID]
	);

	const processTransaction = async () => {
		setLoading(true);

		const txResponse = await fetch('../api/createTransaction', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(order),
		});
		const txData = await txResponse.json();

		// Create a tx object
		const tx = Transaction.from(Buffer.from(txData.transaction, 'base64'));
		console.log('Tx data is', tx);

		// Attempt to send tx to blockchain
		try {
			const txSig = await sendTransaction(tx, connection);
			console.log(
				`Transaction sent: https://solscan.io/tx/${txSig}?cluster=devnet`
			);

			setStatus(STATUS.Submitted);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const checkPurchased = async () => {
			const purchased = await hasPurchased(publicKey, itemID);

			if (purchased) {
				setStatus(STATUS.Paid);
				const item = await fetchItem(itemID);
				setItem(item);
				console.log(
					'🚀 ~ file: Buy.js ~ line 75 ~ checkPurchased ~ item',
					item
				);
			}
		};
		checkPurchased();
	}, [publicKey, itemID]);

	useEffect(() => {
		if (status === STATUS.Submitted) {
			setLoading(true);
			// Check if transaction fails or is confirmed every 1s
			const interval = setInterval(async () => {
				try {
					const { confirmationStatus } = await findReference(
						connection,
						orderID
					);
					console.log('Finding tx reference', confirmationStatus);
					if (
						confirmationStatus === 'confirmed' ||
						confirmationStatus === 'finalized'
					) {
						clearInterval(interval);
						setStatus(STATUS.Paid);
						addOrder(order);
						setLoading(false);
						alert('Thank you for your purchase');
					}
				} catch (error) {
					console.log('Unknown error', error);
					if (error instanceof FindReferenceError) return null;
				}
			}, 1000);
			return () => {
				clearInterval(interval);
			};
		}

		const getItem = async (itemID) => {
			const item = await fetchItem(itemID);
			setItem(item);
		};

		if (status === STATUS.Paid) {
			getItem(itemID);
		}
	}, [status]);

	if (!publicKey) {
		return (
			<div>
				<p>Please connect your wallet to make a purchase</p>
			</div>
		);
	}

	if (loading) {
		return <InfinitySpin color="gray" />;
	}

	return (
		<div>
			{status === STATUS.Paid ? (
				<IPFSDownload
					filename={item?.filename}
					hash={item?.hash}
					cta="Download emojis"
				/>
			) : (
				<button
					disabled={loading}
					className="buy-button"
					onClick={processTransaction}
				>
					Buy now
				</button>
			)}
		</div>
	);
}
