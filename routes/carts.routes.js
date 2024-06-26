import express from 'express';
import { getUserCart, Addtocart, removeFromcart } from '../controllers/cart_contoller.js';
import { createOrderpreview } from '../controllers/order_contoller.js';
import { verifyUserToken } from '../middleware/jwt.js';

const router = express.Router();

router.get('/', verifyUserToken ,getUserCart);
router.post('/add_to_cart', verifyUserToken ,Addtocart);
router.put('/remove_from_cart', verifyUserToken ,removeFromcart);
router.get('/order_preview', verifyUserToken ,createOrderpreview);

export default router