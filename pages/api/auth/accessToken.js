import connectDB from '../../../utils/connectDB'
import Users from '../../../models/userModel'
import Tokens from '../../../models/tokenModel'
import jwt from 'jsonwebtoken'
import { createAccessToken } from '../../../utils/generateToken'
import { CONTACT_ADMIN_ERR_MSG, ERROR_403 } from '../../../utils/constants'

connectDB()

export default async (req, res) => {
    try {
        const rf_token = req.cookies.refreshtoken;
        if (!rf_token) return res.status(400).json({ err: 'Please sign in!' });

        const result = jwt.verify(rf_token, process.env.NEXT_PUBLIC_REFRESH_TOKEN_SECRET);
        if (!result) return res.status(401).json({ err: ERROR_403 });

        const isBlackListed = await checkIsBlacklistedToken(result.refreshTokenId, res);
        if(isBlackListed) return res.status(401).json({ err: `You are not authorized to access the application right now, ${CONTACT_ADMIN_ERR_MSG}` })

        const user = await Users.findById(result.id);
        if (!user) return res.status(401).json({ err: 'User does not exist.' });

        const access_token = createAccessToken({ id: user._id });
        res.json({
            access_token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                root: user.root,
                activated: user.activated
            }
        })
    } catch (err) {
        console.error('Error occurred while accessToken: ' + err);
        return res.status(500).json({ err: CONTACT_ADMIN_ERR_MSG })
    }
}

const checkIsBlacklistedToken = async (refreshTokenId, res) => {
    const token = await Tokens.findOne({ refreshTokenId, isBlackListed: true});
    if (token) {
        console.error('WARNING: Blacklisted user accessing the system, refreshTokenId: ', refreshTokenId);
        return true;
    }
}
