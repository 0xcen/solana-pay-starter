import products from './products.json';
import { writeFileSync } from 'fs';

export default (req, res) => {
	if (req.method === 'POST') {
		try {
			const { name, price, image_url, description, filename, hash } = req.body;

			// Create new product id
			// Get max product id
			const maxID = products.reduce(
				(max, product) => Math.max(max, product.id),
				0
			);

			products.push({
				id: maxID + 1,
				name,
				price,
				image_url,
				description,
				filename,
				hash,
			});
			writeFileSync(
				'./pages/api/products.json',
				JSON.stringify(products, null, 2)
			);
			res.status(200).send({ status: 'ok' });
		} catch (e) {
			console.log('🚀 ~ file: addProduct.js ~ line 9 ~ e', e);
			return res.status(500).json({ error: 'Error adding product' });
		}
	} else {
		return res.status(405).send(`Method ${req.method} not allowed`);
	}
};
