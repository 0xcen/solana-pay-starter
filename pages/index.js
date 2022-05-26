import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import CreateProduct from '../components/CreateProduct';
import HeadComponent from '../components/Head';
import Product from '../components/Product';

// Constants
const TWITTER_HANDLE = 'carlos_0x';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
	const { publicKey } = useWallet();
	const isOwner =
		publicKey?.toString() === process.env.NEXT_PUBLIC_OWNER_PUBLIC_KEY;
	const [creating, setCreating] = useState(false);
	const [products, setProducts] = useState([]);

	useEffect(() => {
		if (publicKey) {
			fetch(`/api/fetchProducts`)
				.then((res) => res.json())
				.then((data) => {
					setProducts(data);
				});
		}
	}, [publicKey]);

	const renderNotConnectedContainer = () => (
		<div>
			<h4>Wallet Not Connnected</h4>
		</div>
	);

	const renderItemBuyContainer = () => (
		<div className="products-container">
			{products.map((product) => (
				<Product key={product.id} product={product} />
			))}
		</div>
	);

	return (
		<div className="App">
			<HeadComponent />
			<div className="button-container">
				<WalletMultiButton className="cta-btn connect-wallet-button" />
			</div>
			<div className="container">
				<header className="header-container">
					<p className="header">MoonBots Subscriptions</p>
					<p className="sub-text">
						Chose one of the following bot packages and pay with USDC!
					</p>
				</header>
				{isOwner && (
					<button
						className="create-product-button"
						onClick={() => setCreating(!creating)}
					>
						{creating ? 'Close' : 'Create Product'}
					</button>
				)}
				<main>
					{creating && <CreateProduct />}
					{publicKey ? renderItemBuyContainer() : renderNotConnectedContainer()}
				</main>
				<div className="footer-container">
					<img
						alt="Twitter Logo"
						className="twitter-logo"
						src="twitter-logo.svg"
					/>
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built by @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
};

export default App;
