const jwt = require('jsonwebtoken');

const env = require('../config/env');

const ApiError = require('../utils/ApiError');

const authMiddleware = (
    req,
    res,
    next
) => {

    const authHeader =
        req.headers.authorization;

    if (
        !authHeader ||
        !authHeader.startsWith(
            'Bearer '
        )
    ) {

        return next(
            new ApiError(
                401,
                'Unauthorized'
            )
        );

    }

    const token =
        authHeader.split(
            ' '
        )[1];

    try {

        const decoded =
            jwt.verify(
                token,
                env.accessTokenSecret
            );

        req.user =
            decoded;

        next();

    }

    catch {

        return next(
            new ApiError(
                401,
                'Invalid token'
            )
        );

    }

};

module.exports =
authMiddleware;