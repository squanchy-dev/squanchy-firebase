import * as express from 'express'

export const authorize = (appToken: string): express.RequestHandler => (req, res, next) => {
    const authorization = req.headers.authorization as string

    if (!authorization || !authorization.startsWith('Bearer ')) {
        res.status(403).send('Unauthorized')
        return
    }

    const token = authorization.substr('Bearer '.length)

    if (token !== appToken) {
        res.status(403).send('Unauthorized')
        return
    }

    return next()
}
