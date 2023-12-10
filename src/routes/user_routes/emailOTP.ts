import express from "express"
import { emailOTP } from "../../controllers/user_controllers/emailOTP.js"
import { verifyToken } from "../../middlewares/auth/verifyToken.js"

const router = express.Router()
router.post("/", verifyToken, emailOTP)
export default router