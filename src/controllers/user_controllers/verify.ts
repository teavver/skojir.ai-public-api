import { Request, Response } from "express";
import { logger, LogType } from "../../utils/logger.js";
import { ResponseMessage } from "../../types/responses/ResponseMessage.js";
import { verifyUser as verifyService } from "../../services/user_services/verifyUser.js";
import { validateRequestBody } from "../../utils/verifyRequestBody.js";
import { IUserVerification } from "../../types/interfaces/IUserVerification.js";

const MODULE = "controllers :: user_controllers :: verify"

export async function verifyUser(req: Request, res: Response<ResponseMessage>) {

    const validBody = validateRequestBody(req.body)
    if (!validBody) {
        return res.status(400).json({
            state: "error",
            message: `Request body is empty or incomplete.`
        })
    }
    
    const vRes = await verifyService(req.body)
    if (vRes.err) {
        return res.status(vRes.statusCode).json({
            state: "unauthorized",
            message: vRes.errMsg
        })
    }

    const vData: IUserVerification = vRes.data
    logger(MODULE, `User ${vData.email} verified their account`, LogType.SUCCESS)
    return res.status(vRes.statusCode).json({
        state: "success",
        message: `Account successfully verified.`
    })

}