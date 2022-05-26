import orders from './orders.json';
import { writeFile } from 'fs/promises';

const get = (req, res) => {
	const { buyer } = req.query;

	const buyOrders = orders.filter((order) => order.buyer === buyer);
	if (buyOrders.length === 0) {
		res.status(204).send();
	} else {
		res.status(200).json(buyOrders);
	}
};

const post = async (req, res) => {
	console.log('Recieved add order request', req.body);

	try {
		const newOrder = req.body;
		// if buyer exists and order hasn't purchased the same item
		if (
			!orders.find(
				(order) =>
					order.buyer === newOrder.buyer.toString() &&
					order.itemID === newOrder.itemID
			)
		) {
			orders.push(newOrder);
			await writeFile(
				'./pages/api/orders.json',
				JSON.stringify(orders, null, 2)
			);
			res.status(200).json(orders);
		} else {
			res.status(400).send('Order already exists');
		}
	} catch (error) {
		res.status(400).send(error);
	}
};

export default async (req, res) => {
	switch (req.method) {
		case 'GET':
			get(req, res);
			break;
		case 'POST':
			post(req, res);
			break;
		default:
			res.status(405).send(`Method ${req.method} not allowed`);
	}
};
