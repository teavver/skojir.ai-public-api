import mongoose, { Schema } from "mongoose"
import { refreshTokenSchema } from "./RefreshToken.js"

const collectionName = (process.env.ENV === "DEV") ? process.env.DB_COLLECTION_DEV : process.env.DB_COLLECTION_PROD

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
        required: true
    },
    verificationCode: {
        type: String
    },
    verificationCodeExpires: {
        type: Date
    },
    membershipDetails: {
        type: Schema.Types.ObjectId,
        ref: 'Membership',
    },
    refreshTokens: [refreshTokenSchema]
})

export const User = mongoose.model('User', userSchema, collectionName)