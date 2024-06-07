import bcrypt from 'bcrypt';
import User from "../models/user_model.js";
import Profile from '../models/profile_model.js';
import jwt from 'jsonwebtoken';

export const createUser = async (req,res) => {

    try{

        const email = req.body.email;
        const password_in = req.body.password;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const phone_number = req.body.phone_number;

        if ( !email || !password_in || !first_name || !last_name || !phone_number ) {
            return res.status(400).json({
                has_error: true,
                error:'email, password, first_name, last_name and phone_number are required',
                message: 'Please fill all fields'
            })
        }

        const CheckUser = await User.findOne({ email: email })

        const CheckUserNum = await User.findOne({ phone_number: phone_number })

        if ( CheckUser ) {
            return res.status(403).json({
                has_error: true,
                error:'User with this email already exist',
                message: 'User with this email already exist'
              });
        }

        if ( CheckUserNum ) {
            return res.status(403).json({
                has_error: true,
                error:'User with this phone number already exist',
                message: 'User with this phone number already exist'
              });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed_password = bcrypt.hashSync(password_in, salt);

        const newUser = new User({
            email,
            password: hashed_password,
            first_name: first_name,
            last_name: last_name,
            role: 'user',
            isVerified: false,
            phone_number
        })

        const createdUser = await newUser.save();

        const newProfile = new Profile({
            user: createdUser.id
        })

        const createdProfile = await newProfile.save()

        const generateToken = jwt.sign({ id: createdUser.id }, process.env.JWT_KEY, { expiresIn: '1d' })

        const refreshToken = jwt.sign({ id: createdUser.id }, process.env.JWT_KEY, { expiresIn: '7d' })

        const { password, ...info } = createdUser._doc;

        return res.status(202).json({
            message:'User account was created successfully',
            has_error:false,
            data:{
                user: info,
                profile:createdProfile,
                token: generateToken,
                refreshToken
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

export const userLogin = async (req,res) => {

    try{

        const email = req.body.email;
        const user_password = req.body.password;

        if ( !email || !user_password ) {
            return res.status(400).json({
                has_error: true,
                error:'email and password are required',
                message: 'Please fill all fields'
            })
        }

        const getUser = await User.findOne({ email: email });

        if ( !getUser ) {
            return res.status(403).json({
                has_error: true,
                error:'User with this email dose not exist',
                message: 'User with this email dose not exist'
            })
        }

        const checkPassword = bcrypt.compareSync(user_password, getUser.password);

        if(!checkPassword){
            return res.status(403).json({
                has_error: true,
                error:'Password or email is incorrect',
                message: 'Password or email is incorrect'
            })
        }

        const getUserProfile = await Profile.findOne({ user: getUser.id });

        const generateToken = jwt.sign({ id: getUser.id }, process.env.JWT_KEY, { expiresIn: '1d' })

        const refreshToken = jwt.sign({ id: getUser.id }, process.env.JWT_KEY, { expiresIn: '7d' })

        const { password, ...info } = getUser._doc

        return res.status(200).json({
            message: 'Login was successful',
            data:{
                user: info,
                profile:getUserProfile,
                token: generateToken,
                refreshToken
            }
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

export const refreshToken = async (req,res) => {

    try{

        const refreshToken = req.body.refreshToken

        if ( !refreshToken ) {
            return res.status(400).json({
                has_error: true,
                error:'refreshToken is required',
                message: 'Please fill all fields'
            })  
        }

        jwt.verify(refreshToken, process.env.JWT_KEY, async (err, payload) => {
            if (err) return next(createError(403, 'Token is not valid!'));
            
            const generateToken = jwt.sign({ id: payload.id }, process.env.JWT_KEY, { expiresIn: '1d' })

            return res.status(200).json({
                accessToken: generateToken
            })

        });

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

// Admin routes

export const createAdmin = async (req,res) => {

    try{

        const email = req.body.email;
        const password_in = req.body.password;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const phone_number = req.body.phone_number;

        if ( !email || !password_in || !first_name || !last_name || !phone_number ) {
            return res.status(400).json({
                has_error: true,
                error:'email, password, first_name, last_name and phone_number are required',
                message: 'Please fill all fields'
            })
        }

        const CheckAdmin = await User.findOne({ email: email })
        const CheckAdminNum = await User.findOne({ phone_number: phone_number })

        if ( CheckAdmin ) {
            return res.status(403).json({
                has_error: true,
                error:'Admin with this email already exist',
                message: 'Admin with this email already exist'
              });
        }

        if ( CheckAdminNum ) {
            return res.status(403).json({
                has_error: true,
                error:'Admin with this phone number already exist',
                message: 'Admin with this phone number already exist'
              });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed_password = bcrypt.hashSync(password_in, salt);

        const newAdmin = new User({
            email,
            password: hashed_password,
            first_name,
            last_name,
            role: 'admin',
            isVerified: false,
            phone_number
        })

        const createdAdmin = await newAdmin.save();

        const newProfile = new Profile({
            user: createdAdmin.id
        })

        const createdProfile = await newProfile.save()

        const generateToken = jwt.sign({ id: createdAdmin.id }, process.env.JWT_KEY, { expiresIn: '1d' })

        const refreshToken = jwt.sign({ id: createdAdmin.id }, process.env.JWT_KEY, { expiresIn: '7d' })

        const { password, ...info } = createdAdmin._doc;

        return res.status(202).json({
            message:'User account was created successfully',
            has_error:false,
            data:{
                user: info,
                profile:createdProfile,
                token: generateToken,
                refreshToken
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

export const loginAdmin = async (req,res) => {

    try{

        const email = req.body.email;
        const user_password = req.body.password;

        if ( !email || !user_password ) {
            return res.status(400).json({
                has_error: true,
                error:'email and password are required',
                message: 'Please fill all fields'
            })
        }

        const getUser = await User.findOne({ email: email });

        if ( !getUser ) {
            return res.status(403).json({
                has_error: true,
                error:'User with this email dose not exist',
                message: 'User with this email dose not exist'
            })
        }

        if ( getUser.role !== 'admin' ) {
            return res.status(403).json({
                has_error: true,
                error:'User is not an admin',
                message: 'User is not an admin'
            })
        }

        const checkPassword = bcrypt.compareSync(user_password, getUser.password);

        if(!checkPassword){
            return res.status(403).json({
                has_error: true,
                error:'Password or email is incorrect',
                message: 'Password or email is incorrect'
            })
        }

        const getUserProfile = await Profile.findOne({ user: getUser.id });

        const generateToken = jwt.sign({ id: getUser.id }, process.env.JWT_KEY, { expiresIn: '1d' })

        const refreshToken = jwt.sign({ id: getUser.id }, process.env.JWT_KEY, { expiresIn: '7d' })


        const { password, ...info } = getUser._doc

        return res.status(200).json({
            message: 'Login was successful',
            data:{
                user: info,
                profile:getUserProfile,
                token: generateToken,
                refreshToken
            }
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

// Rider routes

export const createRider = async (req,res) => {

    try{

        const email = req.body.email;
        const password_in = req.body.password;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const phone_number = req.body.phone_number;

        if ( !email || !password_in || !first_name || !last_name || !phone_number ) {
            return res.status(400).json({
                has_error: true,
                error:'email, password, first_name, last_name and phone_number are required',
                message: 'Please fill all fields'
            })
        }

        const CheckRider = await User.findOne({ email: email })
        const CheckRiderNum = await User.findOne({ phone_number: phone_number })

        if ( CheckRider ) {
            return res.status(403).json({
                has_error: true,
                error:'User with this email already exist',
                message: 'User with this email already exist'
              });
        }

        if ( CheckRiderNum ) {
            return res.status(403).json({
                has_error: true,
                error:'User with this phone number already exist',
                message: 'User with this phone number already exist'
              });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed_password = bcrypt.hashSync(password_in, salt);

        const newRider = new User({
            email,
            password: hashed_password,
            first_name,
            last_name,
            role: 'rider',
            isVerified: true,
            phone_number
        })

        const createdRider = await newRider.save();

        const newProfile = new Profile({
            user: createdRider.id
        })

        const createdProfile = await newProfile.save()

        const generateToken = jwt.sign({ id: createdRider.id }, process.env.JWT_KEY, { expiresIn: '1d' })

        const refreshToken = jwt.sign({ id: createdRider.id }, process.env.JWT_KEY, { expiresIn: '7d' })

        const { password, ...info } = createdRider._doc;

        return res.status(202).json({
            message:'Rider account was created successfully',
            has_error:false,
            data:{
                user: info,
                profile:createdProfile,
                token: generateToken,
                refreshToken
            }
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

export const loginRider = async (req,res) => {

    try{

        const email = req.body.email;
        const user_password = req.body.password;

        if ( !email || !user_password ) {
            return res.status(400).json({
                has_error: true,
                error:'email and password are required',
                message: 'Please fill all fields'
            })
        }

        const getUser = await User.findOne({ email: email });

        if ( !getUser ) {
            return res.status(403).json({
                has_error: true,
                error:'User with this email dose not exist',
                message: 'User with this email dose not exist'
            })
        }

        if ( getUser.role !== 'rider' ) {
            return res.status(403).json({
                has_error: true,
                error:'User is not a rider',
                message: 'User is not a rider'
            })
        }

        const checkPassword = bcrypt.compareSync(user_password, getUser.password);

        if(!checkPassword){
            return res.status(403).json({
                has_error: true,
                error:'Password or email is incorrect',
                message: 'Password or email is incorrect'
            })
        }

        const getUserProfile = await Profile.findOne({ user: getUser.id });

        const generateToken = jwt.sign({ id: getUser.id }, process.env.JWT_KEY, { expiresIn: '1d' })

        const refreshToken = jwt.sign({ id: getUser.id }, process.env.JWT_KEY, { expiresIn: '7d' })


        const { password, ...info } = getUser._doc

        return res.status(200).json({
            message: 'Login was successful',
            data:{
                user: info,
                profile:getUserProfile,
                token: generateToken,
                refreshToken
            }
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
