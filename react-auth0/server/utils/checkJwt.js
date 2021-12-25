import jwt from 'express-jwt'
import jwksRsa from 'jwks-rsa'
import dotenv from 'dotenv'

dotenv.config()

const domain = process.env.AUTH0_DOMAIN
const audience = process.env.AUTH0_AUDIENCE

export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    jwksUri: `https://${domain}/.well-known/jwks.json`
  }),
  audience,
  issuer: `https://${domain}/`,
  algorithms: ['RS256']
})
