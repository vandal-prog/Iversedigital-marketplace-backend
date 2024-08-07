import express from "express";
import {
  getUserdetails,
  editUserdetails,
  resetUserpassword,
  becomeMarchant,
  toggleStoreOpen_Close,
  getUserstore,
  edituserStore,
  StoreProducts,
  getUseraddress,
  updateUseraddress,
  getUsernotification,
  readUsernotification,
  getAlldeliveryRoutes
} from "../controllers/user_contoller.js"; 
import { verifyUserToken } from "../middleware/jwt.js";

const router = express.Router();

router.get("/", verifyUserToken, getUserdetails);
router.put("/update", verifyUserToken, editUserdetails);
router.post("/become_marchant", verifyUserToken, becomeMarchant);
router.put("/reset_password", verifyUserToken, resetUserpassword);
router.put("/toggle_store", verifyUserToken, toggleStoreOpen_Close);
router.get("/user_store", verifyUserToken, getUserstore);
router.put("/edit_user_store", verifyUserToken, edituserStore);
router.get('/user_store/products', verifyUserToken, StoreProducts )
router.get('/address', verifyUserToken, getUseraddress )
router.put('/address/edit', verifyUserToken, updateUseraddress )
router.get('/notification', verifyUserToken, getUsernotification )
router.put('/read_notification', verifyUserToken, readUsernotification )
router.get('/get_locations', getAlldeliveryRoutes )


export default router;
