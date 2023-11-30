import { UserCredentialsRequest } from "../../types/requests/client/UserCredentialsRequest.js";
import { ServiceResponse } from "../../types/responses/ServiceResponse.js";
import { logger, LogType } from "../../utils/logger.js";
import { User } from "../../models/User.js";
import { validateRegisterUserRequest } from "../../middlewares/validators/user_services/registerUser.js";
import { generateExpiryDate } from "../../utils/genExpiryDate.js";
import { generateSalt } from "../../utils/crypto/salt.js";
import { deriveKey } from "../../utils/crypto/pbkdf2.js";

const MODULE = "services :: user_services :: createUser"

/**
 * Validates userCredentials with the schema, checks for duplicates
 * Once verified, creates a new user in the database
 */ 
export async function createUser(userCredentials: UserCredentialsRequest, verificationCode: string): Promise<ServiceResponse> {

    const vRes = await validateRegisterUserRequest(userCredentials)

    if (!vRes.isValid) {
        logger(MODULE, `createUser req rejected.`, LogType.WARN)
        return {
            err: true,
            errMsg: vRes.error,
        }
    }

    const salt = generateSalt()
    const saltedPwd = salt + userCredentials.password
    const hashedPwd = deriveKey({ password: saltedPwd, salt: salt })
    
    const newUser = new User({
        email: userCredentials.email,
        password: hashedPwd,
        salt: salt,
        verificationCode: verificationCode,
        verificationCodeExpires: generateExpiryDate()
    })

    try {
        await newUser.save()
    } catch (err) {
        const dbErr = (err as Error).message
        logger(MODULE, dbErr, LogType.WARN)
        return {
            err: true,
            errMsg: `Internal database error.`
        }
    }

    return {
        err: false,
        data: "User created"
    }
}