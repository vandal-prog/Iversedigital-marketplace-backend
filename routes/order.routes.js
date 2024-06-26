import express from 'express';
import { getUserorders, createOrder, trackOrder, getMerchantOrders, getAllOrders } from '../controllers/order_contoller.js';
import { verifyUserToken } from '../middleware/jwt.js';

const router = express.Router();

router.get('/create', verifyUserToken ,createOrder);
router.get('/my_orders', verifyUserToken ,getUserorders);
router.get('/merchant_orders', verifyUserToken ,getMerchantOrders);
router.get('/track_order' ,trackOrder);
router.get('/all_orders', getAllOrders)

export default router