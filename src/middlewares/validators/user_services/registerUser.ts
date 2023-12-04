import { logger, LogType } from "../../../utils/logger.js";
import IUserCredentials from "../../../types/interfaces/IUserCredentials.js";
import { ValidatorResponse } from "../../../types/responses/ValidatorResponse.js";
import { userCredentialsSchema } from "../schemas/userCredentialsSchema.js";

const MODULE = "middlewares :: validators :: user_services :: createUser"

export const validateRegisterUserRequest = async (req: IUserCredentials): Promise<ValidatorResponse> => {

    try {

        // validate with schema
        const data: IUserCredentials = await userCredentialsSchema.validateAsync(req)

        return {
            isValid: true,
            data: data
        }

    } catch (err) {
        logger(MODULE, `Could not validate createUser req data: ${err}`, LogType.ERR)
        return {
            isValid: false,
            error: `Invalid request data`,
            statusCode: 400
        }
    }
}