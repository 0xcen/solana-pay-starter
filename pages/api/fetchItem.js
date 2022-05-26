import products from './products.json';

export default async (req, res) => {
	if (req.method === 'POST') {
		const itemID = req.body;

		if (!itemID) {
			return res.status(400).send('Missing itemID');
		}

		const index = products.findIndex((o) => o.id === itemID);

		if (index < 0) {
			return res.status(404).send('Item not found');
		}

		const { hash, filename } = products[index];
		return res.status(200).send({
			hash,
			filename,
		});
	} else {
		res.status(405).send(`Method ${req.method} not allowed`);
	}
};
