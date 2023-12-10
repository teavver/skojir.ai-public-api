import { User } from "../../models/User.js";
import { ServiceResponse } from "../../types/responses/ServiceResponse.js";
import { logger, LogType } from "../../utils/logger.js";
import IUserBase from "../../types/interfaces/IUserBase.js";
import { validateEmailOTP } from "../../middlewares/validators/user_services/emailOTP.js";
import { sendVerificationCodeEmail } from "./sendVerificationCodeEmail.js";
import { generateVerificationCode } from "../../utils/crypto/genVerificationCode.js";
import { generateExpiryDate } from "../../utils/genExpiryDate.js";

const MODULE = "services :: user_services :: emailOTP"

export async function emailOTP(reqBody:any): Promise<ServiceResponse<IUserBase>> {
 
    const vRes = await validateEmailOTP(reqBody)
    if (!vRes.isValid) {
        logger(MODULE, `emailOTP req rejected: Failed to validate input. Err: ${vRes.error}`, LogType.WARN)
        return {
            err: true,
            errMsg: vRes.error,
            statusCode: 400
        }
    }

    const vData = vRes.data as IUserBase
    const user = await User.findOne({ email: vData.email })
    if (!user) {
        logger(MODULE, `Failed to send email change OTP - user does not exist`, LogType.WARN)
        return {
            err: true,
            errMsg: `Sorry, we couldn't find your account.`,
            statusCode: 404
        }
    }

    if (!user.isEmailVerified) {
        logger(MODULE, `Failed to send email change OTP - account is not verified`, LogType.WARN)
        return {
            err: true,
            errMsg: `Your account must be verified to perform this action.`,
            statusCode: 404
        }
    }

    const emailOTP = generateVerificationCode()
    const emailOTPExpiry = generateExpiryDate()
    const emailChangeMsg = "Use this code to change your account's email address. This code will expire in 10 minutes."

    try {
        await User.updateOne({ email: user.email }, {
            $set: {
                verificationCode: emailOTP,
                verificationCodeExpires: emailOTPExpiry
            }
        })

        const emailRes = await sendVerificationCodeEmail(vData.email, emailOTP, emailChangeMsg)
        if (emailRes.err) {
            return {
                err: true,
                errMsg: emailRes.errMsg,
                statusCode: emailRes.statusCode
            }
        }

        logger(MODULE, `Email OTP code sent to ${user.email}, code: ${emailOTP}`)

    } catch (err) {
        const errMsg = (err as Error).message
        logger(MODULE, `Send email change OTP failed. Err: ${errMsg}`, LogType.WARN)
        return {
            err: true,
            errMsg: errMsg,
            statusCode: 500
        }
    }

    return {
        err: false,
        data: vData,
        statusCode: 200
    }
}