import Cart from '../models/cart_model.js';
import merchantOrders from '../models/merchant_order_model.js';
import Notification from '../models/notification_model.js';
import Order from '../models/order_model.js';
import Product from '../models/product_model.js';
import Store from '../models/store_model.js';
import userAddress from '../models/user_address_model.js';


function generateOrdercode() {
    return(
        Math.random().toString(36).slice(2));
}

// Before Payment
export const createOrderpreview = async (req, res) => {

    try {

        // await Order.deleteMany({ order_status: 'Pending' });

        // return res.status(200).json({
        //     message:"Order was deleted successfully"
        // })

        const getUsercartDetails = await Cart.findOne({ user: req.user._id });
        const getuserAddress = await userAddress.findOne({ user: req.user._id })

        if (!getUsercartDetails) {
            return res.status(400).json({
                message: 'User dose not have an existing cart'
            })
        }

        if (!getuserAddress) {
            return res.status(400).json({
                message: 'User has to set their delivery details'
            })
        }

        if (getuserAddress.state === '' || getuserAddress.area === '' || getuserAddress.address === '') {
            return res.status(400).json({
                message: 'User has to set their delivery details'
            })
        }

        if (getUsercartDetails.products.length < 1) {
            return res.status(403).json({
                message: 'user cart is empty'
            })
        }

        let unQualifiedProducts = []

        let order_product = []

        for (let k = 0; k < getUsercartDetails.products.length; k++) {
            const currentProduct = getUsercartDetails.products[k];

            const chekproduct = await Product.findById(currentProduct.product_id)

            if (!chekproduct) continue

            if (!chekproduct.isAvailable) {
                unQualifiedProducts.push({ product: chekproduct, quantity: currentProduct.quantity, status: 'Unavailable', message: 'This product is no longer available' })
                continue
            }

            if (chekproduct.quantity_available < currentProduct.quantity) {
                unQualifiedProducts.push({ product: chekproduct, quantity: currentProduct.quantity, status: 'Out of stock', message: 'This product is currently out of stock' })
                continue
            }

            const getProductStore = await Store.findOne({ user: chekproduct.user })

            order_product.push({
                product: currentProduct,
                store_details: {
                    state: getProductStore ? getProductStore.state : null,
                    area: getProductStore ? getProductStore.area : null,
                    address: getProductStore ? getProductStore.address : null,
                    is_Opened: getProductStore ? getProductStore.is_Opened : false
                }
            })

        }

        let Total = 0

        for (let k = 0; k < order_product.length; k++) {

            const prod = order_product[k];

            let price = prod.product.quantity * parseInt(prod.product.product_price, 10);

            Total = Total + price
        }

        if ( unQualifiedProducts.length > 0 ) {
            return res.status(403).json({
                data: unQualifiedProducts,
                message:"Some product are no longer available, please remove them"
            })
        }


        return res.status(200).json({
            user: req.user._id,
            products: order_product,
            product_total: Total,
            service_charge: 10,
            delivery_fee: 400,
            user_delivery_address: getuserAddress,
            order_status: 'Created',
            delivery_details: {},
            delivery_date: '2024-05-26T21:39:41.481Z',
            unQualifiedProducts
        })

    }
    catch (error) {
        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}
// After payment

export const createOrder = async (req, res) => {

    try {

        // await Order.collection.drop()

        const getUsercartDetails = await Cart.findOne({ user: req.user._id });
        const getuserAddress = await userAddress.findOne({ user: req.user._id })

        if (!getUsercartDetails) {
            return res.status(400).json({
                message: 'User dose not have an existing cart'
            })
        }

        if (!getuserAddress) {
            return res.status(400).json({
                message: 'User has to set their delivery details'
            })
        }

        if (getuserAddress.state === '' || getuserAddress.area === '' || getuserAddress.address === '') {
            return res.status(400).json({
                message: 'User has to set their delivery details'
            })
        }

        if (getUsercartDetails.products.length < 1) {
            return res.status(403).json({
                message: 'user cart is empty'
            })
        }

        let unQualifiedProducts = []

        let order_product = []

        const generated_order_code = generateOrdercode()

        for (let k = 0; k < getUsercartDetails.products.length; k++) {
            const currentProduct = getUsercartDetails.products[k];

            const chekproduct = await Product.findById(currentProduct.product_id)

            if (!chekproduct) continue

            if (!chekproduct.isAvailable) {
                unQualifiedProducts.push({ product: chekproduct, quantity: currentProduct.quantity, status: 'Unavailable', message: 'This product is no longer available' })
                continue
            }

            if (chekproduct.quantity_available < currentProduct.quantity) {
                unQualifiedProducts.push({ product: chekproduct, quantity: currentProduct.quantity, status: 'Out of stock', message: 'This product is currently out of stock' })
                continue
            }

            const populate_options = {
                path: 'user',
                select: 'first_name last_name _id email profile_img phone_number'
            };

            const getProductStore = await Store.findOne({ user: chekproduct.user }).populate(populate_options)

            // return res.status(200).json({
            //     data: getProductStore.user
            // })

            chekproduct.quantity_available = chekproduct.quantity_available - currentProduct.quantity
            chekproduct.store = getProductStore.id  

            await chekproduct.save()

            order_product.push({
                id: k,
                product: currentProduct,
                store_details: {
                    store_name: getProductStore ? getProductStore.store_name : null,
                    state: getProductStore ? getProductStore.state : null,
                    area: getProductStore ? getProductStore.area : null,
                    address: getProductStore ? getProductStore.address : null,
                    is_Opened: getProductStore ? getProductStore.is_Opened : false,
                    store_owner_details: getProductStore ? {
                        id: getProductStore.user._id,
                        first_name: getProductStore.user.first_name,
                        last_name: getProductStore.user.last_name,
                        email: getProductStore.user.email,
                        phone_number: getProductStore.user.phone_number
                    } : null
                },
                product_status: 'Pending'
            })

            const newStoreOrder = new merchantOrders({
                user: chekproduct.user,
                store: getProductStore.id,
                order_code: generated_order_code,
                customer: {
                    first_name: req.user.first_name,
                    last_name: req.user.last_name,
                    email: req.user.email,
                    profile_img: req.user.profile_img ? req.user.profile_img : ''
                },
                order_status:'Pending',
                product: currentProduct,
                quantity: currentProduct.quantity
            })

            await newStoreOrder.save()

            const createNotificationMerchant = new Notification({
                user: chekproduct.user,
                description: `A customer just placed an order for your product`,
                data: {
                    product: currentProduct,
                    user_delivery_address: getuserAddress  
                },
                status: 'Unread',
                Notification_type: 'Sales'
            })
    
            await createNotificationMerchant.save()

        }

        let Total = 0

        for (let k = 0; k < order_product.length; k++) {

            const prod = order_product[k];

            let price = prod.product.quantity * parseInt(prod.product.product_price, 10);

            Total = Total + price
        }

        let delivery_fee = 400
        let service_charge = 10

        const createOrder = new Order({
            user: req.user._id,
            products: order_product,
            product_total: Total,
            service_charge,
            delivery_fee,
            user_delivery_address: {
                ...getuserAddress._doc,
                first_name:  req.user.first_name,
                last_name:  req.user.last_name,
                email: req.user.email,
                phone_number: req.user.phone_number
            },
            order_status: 'Created',
            delivery_details: {},
            order_code: generated_order_code,          
            delivery_date: '2024-05-26T21:39:41.481Z'
        })

        const orderCreated = await createOrder.save();

        const createNotificationUser = new Notification({
            user: req.user._id,
            description: `Your order ${generated_order_code} was placed successfully.`,
            data: {
                order: orderCreated._doc
            },
            status: 'Unread',
            Notification_type: 'Order'
        })

        await createNotificationUser.save()

        if ( unQualifiedProducts.length > 0 ) {
            return res.status(403).json({
                message:"Some product are no longer availabe, please remove them",
                data: unQualifiedProducts
            })
        }

        const createPaymenLink = await fetch(
            `${process.env.PAYMENT_URL}/charges/initialize`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.PAYMENT_SECRET_KEY}`
              },
              body: JSON.stringify({
                amount: Total + delivery_fee + service_charge ,
                redirect_url: "https://korapay.com",
                currency: "NGN",
                reference: orderCreated.id,
                narration: `Payment for order - ${generated_order_code}`,
                channels: [
                    "card",
                    "bank_transfer"
                ],
                default_channel: "card",
                customer: {
                    name: `${ req.user.first_name } ${req.user.last_name}`,
                    email: req.user.email
                },
                notification_url: "https://iversedigital-marketplace-backend.onrender.com/api/webhook/order_payment",
                metadata:{
                    order_id: orderCreated.id,
                    user: req.user._id
                }
              })
            }
          );

          if ( createPaymenLink.status !== 200 && createPaymenLink.status !== 202 ) {
            return res.status(200).json({
                message:"Unable to generate payment link"
            })
          }

          const createPaymenLinkResponse = await createPaymenLink.json();

        return res.status(200).json({
            message: 'Your order was placed successfully.',
            data: {
                orderCreated,
                unQualifiedProducts,
                payment_link: createPaymenLinkResponse.data.checkout_url
            }
        })

    }
    catch (error) {
        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}



export const getUserorders = async (req,res) => {

    try{

        const getOrders = await Order.find({ user: req.user._id })

        return res.status(200).json({
            message:'Your orders were gotten successfully',
            data: getOrders
        })

    }

    catch(error){
        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}

export const getMerchantOrders = async (req,res) => {

    try{

        const getMerchOrders = await merchantOrders.find({ user: req.user._id });

        return res.status(200).json({
            message:'Your orders were gotten successfully',
            data: getMerchOrders
        })

    }

    catch(error){
        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}

export const trackOrder = async (req,res) => {

    try{

        const tracking_number = req.body.tracking_number

        if ( !tracking_number ) {
            return res.status(400).json({
                message:'tracking_number is required'
            })
        }

        const getOrderbyTrackingNumber = await Order.findOne({ order_code: tracking_number })

        if ( !getOrderbyTrackingNumber ) {
            return res.status(403).json({
                message:'Order with tracking number dose not exist'
            })
        }

        return res.status(200).json({
            message:'Your order details were gotten successfully',
            data: getOrderbyTrackingNumber
        })

    }
    catch(error){
        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}

export const getAllOrders = async (req,res) => {

    try{

        const getAllOrder = await Order.find();

        return res.status(200).json({
            message:"All order was gotten successfuly",
            data: getAllOrder
        })

    }
    catch(error){
        console.log(error)
        return res.status(403).json({
            has_error: true,
            error,
            message: 'Something went wrong'
        });
    }

}