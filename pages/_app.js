import React, { useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
	ConnectionProvider,
	WalletProvider,
} from '@solana/wallet-adapter-react';
import {
	GlowWalletAdapter,
	PhantomWalletAdapter,
	SlopeWalletAdapter,
	SolflareWalletAdapter,
	TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';
import '../styles/globals.css';
import '../styles/App.css';

const App = ({ Component, pageProps }) => {
	// get network enum
	const network = WalletAdapterNetwork.Devnet;

	// get rpc enpoint
	const endpoint = useMemo(() => clusterApiUrl(network, [network]));

	const wallets = useMemo(
		() => [new PhantomWalletAdapter(), new GlowWalletAdapter()],
		[network]
	);

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets}>
				<WalletModalProvider>
					<Component {...pageProps} />
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	);
};

export default App;
