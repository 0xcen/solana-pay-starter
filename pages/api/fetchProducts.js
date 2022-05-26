import products from './products.json';

export default (req, res) => {
	if (req.method === 'GET') {
		// Create copy of products without hashes and filenames
		const productsNoHashes = products.map((product) => {
			const { hash, filename, ...rest } = product;
			return rest;
		});

		res.status(200).json(productsNoHashes);
	} else {
		res.status(405).send(`Method ${req.method} not allowed`);
	}
};
