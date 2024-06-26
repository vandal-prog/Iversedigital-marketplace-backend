import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        unique: false,
        required: false
    },
    products:{
        type:Array,
        required:true
    },
    product_total:{
        type: Number,
        required:false,
    },
    service_charge:{
        type: Number,
        required:false,
    },
    delivery_fee:{
        type: Number,
        required:false,
    },
    user_delivery_address:{
        type: Object,
        required:false,
    },
    order_status:{
        type: String,
        required:false,
        enum:[ 'Pending', 'Created', 'Delivered', 'In-transit', 'Order-accepted']
    },
    rider_details:{
        type: Object,
        required:false,
    },
    delivery_date:{
        type: String,
        required:false,
    },
    order_code: {
        type: String,
        required: false
    },
    delivery_code:{
        type: String,
        required: false
    } 

},{
    timestamps: true
})

const Order = mongoose.model('Order', OrderSchema);

export default Order;
