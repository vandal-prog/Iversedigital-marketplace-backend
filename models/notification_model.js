import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    description: {
        type: String,
        required: false,
        unique: false
    },
    status: {
        type: String,
        required:false,
        unique: false,
        enum: [ 'Read', 'Unread' ]
    },
    Notification_type:{
        type: String,
        required:false,
        unique: false,
        enum: [ 'Order', 'Sales', 'Notice', 'Delivery' ]
    } ,
    data: {
        type: Object,
        required:false,
        unique: false
    }
},{
    timestamps: true
})

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
