import mongoose from "mongoose";
import Product from "../models/product_model.js";
import Profile from "../models/profile_model.js";
import Store from "../models/store_model.js";
import User from "../models/user_model.js";


export const approveOrdeclineProduct = async (req,res) => {

    try{

        const productId = req.params.id
        const action = req.body.action

        const populate_options = [
            {
                path: 'user',
                select: 'first_name last_name _id email profile_img phone_number'
            },
            {
                path: 'store',
                select: '',
            },
            {
                path: 'subCategory',
                select: '',
            },
            {
                path: 'category',
                select: '',
            },
        ];

        if ( !productId || !action ) {
            return res.status(400).json({
                message:"product_id and action is required"
            })
        }

        if ( action !== 'approve' && action !== 'decline'  ) {
            return res.status(400).json({
                message:"action must either me approve or decline"
            })
        }

        const getProduct = await Product.findById(productId).populate(populate_options);

        if ( !getProduct ) {
            return res.status(403).json({
                message:"Product with this id dose not exist"
            })
        }

        if ( getProduct && action === 'approve' ) {
            return res.status(403).json({
                message:"Product has already been approved"
            })
        }

        getProduct.isVerified = action === 'approve' ? true : false
        
        // Send email to the user or merchant that their product has been approved
        // Send notification as well

        await getProduct.save()

        return res.status(200).json({
            message:"Success",
            data: getProduct
        })

    }
    catch(error){
        console.log(error)
        return res.status(403).json({
            error,
            message: 'Something went wrong'
        });
    }

}

export const getAllusers = async (req,res) => {

        const pageNumber = parseInt(req.query.pageNumber) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const first_name = req.query.first_name;
        const last_name = req.query.last_name;
        const email = req.query.email;
        const role = req.query.role;
        const is_Verified = req.query.is_Verified;
    
        try{
    
            let query = {}
    
            if ( role ) {
                query.role = role
            }

            if ( is_Verified ) {
                query.isVerified = is_Verified === 'true' ? true : false
            }

            if ( first_name ) {
                query.first_name = { $regex: first_name, $options: 'i' }    
            }

            if ( last_name ) {
                query.last_name = { $regex: last_name, $options: 'i' }    
            }

            if ( email ) {
                query.email = { $regex: email, $options: 'i' }    
            }

    
            const Orgquery = { 
                $and: [
                    query
                ]
            };
            
    
            const aggregationResult = await User.aggregate([
                {$match:query},
                {
                    $facet: {
                        paginatedData: [
                            { $skip: (pageNumber - 1) * pageSize },
                            { $limit: pageSize }
                        ],
                        totalCount: [
                            { $count: "total" }
                        ]
                    }
                }
    
            ]);
    
            
    
            const paginatedData = aggregationResult[0]?.paginatedData;
            const totalCount = aggregationResult[0]?.totalCount[0]?.total;
            const totalPages = Math.ceil(totalCount / pageSize);
            const currentPage = pageNumber > totalPages ? totalPages : pageNumber;
    
            return res.status(200).json({
                data: paginatedData,
                currentPage,
                totalPages,
                totalCount
            });

    }
    catch(error){
        console.log(error)
        return res.status(403).json({
            error,
            message: 'Something went wrong'
        });
    }

}

export const getUserdetails = async (req,res) => {

    try{

        const userId = req.params.id;

        if ( !userId ) {
            return res.status(400).json({
                message: "user id is required"
            })
        }

        const populate_options = [
            {
                path: 'user',
                select: 'first_name last_name _id email profile_img phone_number role isVerified createdAt'
            },
        ]

        const getUser = await Profile.findOne({ user: userId }).populate(populate_options)

        if ( !getUser ) {
            return res.status(403).json({
                message:"User with this Id dose not exist"
            })
        }

        return res.status(200).json({
            data: getUser,
            message:"User details gotten successfully"
        })

    }
    catch(error){
        console.log(error)
        return res.status(403).json({
            error,
            message: 'Something went wrong'
        });
    }

}

export const getAllstores = async (req,res) => {

    const pageNumber = parseInt(req.query.pageNumber) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const store_name = req.query.store_name;
    const store_category = req.query.store_category;
    const customer_care_number = req.query.customer_care_number;
    const address = req.query.address;
    const user = req.query.user;
    const area = req.query.area;
    const state = req.query.state;
    const has_rider = req.query.has_rider;
    const isCAC_verified = req.query.isCAC_verified;
    const CAC_number = req.query.CAC_number;
    const is_Opened = req.query.is_Opened;
    const is_Available = req.query.is_Available;
    const is_Verified = req.query.is_Verified;

    try{

        let query = {}

        if ( is_Verified ) {
            query.isVerified = is_Verified === 'true' ? true : false
        }

        if ( store_name ) {
            query.store_name = { $regex: store_name, $options: 'i' }    
        }

        if ( user ) {
            query.user = new mongoose.Types.ObjectId(`${user}`)    
        }

        if ( store_category ) {
            query.store_category = new mongoose.Types.ObjectId(`${store_category}`)    
        }

        if ( customer_care_number ) {
            query.customer_care_number = { $regex: customer_care_number, $options: 'i' }    
        }

        if ( address ) {
            query.address = { $regex: address, $options: 'i' }    
        }

        if ( area ) {
            query.area = { $regex: area, $options: 'i' }    
        }

        if ( state ) {
            query.state = { $regex: state, $options: 'i' }    
        }

        if ( CAC_number ) {
            query.state = { $regex: CAC_number, $options: 'i' }    
        }

        if ( has_rider ) {
            query.has_rider = has_rider === 'true' ? true : false    
        }

        if ( isCAC_verified ) {
            query.isCAC_verified = isCAC_verified === 'true' ? true : false    
        }

        if ( is_Opened ) {
            query.is_Opened = is_Opened === 'true' ? true : false    
        }

        if ( is_Available ) {
            query.is_Available = is_Available === 'true' ? true : false;    
        }


        const populate_options = [
            { from: 'users', localField: 'user', foreignField: '_id', as: 'user' },
            { from: 'categories', localField: 'store_category', foreignField: '_id', as: 'store_category' },
        ];

        const lookupStages = populate_options.map(option => ({
            $lookup: {
                from: option.from,
                localField: option.localField,
                foreignField: option.foreignField,
                as: option.as
            }
        }));
        

        const aggregationResult = await Store.aggregate([
            {$match:query},
            {
                $facet: {
                    paginatedData: [
                        { $skip: (pageNumber - 1) * pageSize },
                        { $limit: pageSize },
                        ...lookupStages
                    ],
                    totalCount: [
                        { $count: "total" }
                    ]
                }
            }

        ]);

        

        const paginatedData = aggregationResult[0]?.paginatedData;
        const totalCount = aggregationResult[0]?.totalCount[0]?.total;
        const totalPages = Math.ceil(totalCount / pageSize);
        const currentPage = pageNumber > totalPages ? totalPages : pageNumber;

        return res.status(200).json({
            data: paginatedData,
            currentPage,
            totalPages,
            totalCount
        });

    }
    catch(error){
        console.log(error)
        return res.status(403).json({
            error,
            message: 'Something went wrong'
        });
    }

}

export const getStorebyId = async (req,res) => {

    try{

        const store_id = req.params.id;

        if ( !store_id ) {
            return res.status(400).json({
                message:"store_id is required"
            })
        }

        const getStore = await Store.findById(store_id);

        if ( !getStore ) {
            return res.status(403).json({
                message:"Store with this id dose not exist"
            })
        }

        const getProducts = await Product.find({ user: getStore.user });

        return res.status(200).json({
            message:"success",
            data:{
                store: getStore,
                products: getProducts
            }
        })

    }
    catch(error){
        console.log(error)
        return res.status(403).json({
            error,
            message: 'Something went wrong'
        });
    }

}

export const approveOrdeclineStore = async (req,res) => {

    try{

        const storeId = req.params.id;
        const action = req.body.action;

        if ( !storeId || !action ) {
            return res.status(400).json({
                message:'Store id and action is required'
            })
        }

        const populate_options = [
            {
                path: 'user',
                select: 'first_name last_name _id email profile_img phone_number'
            },
            {
                path:'store_category',
                select:''
            }
        ]

        const getStore = await Store.findById(storeId).populate(populate_options)

    }
    catch(error){
        console.log(error)
        return res.status(403).json({
            error,
            message: 'Something went wrong'
        });
    }

}