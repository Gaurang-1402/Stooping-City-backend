import expressJwt from "express-jwt"

// now we have the json web token
// we don't want to manually verify the token
// so we use express json web token

// boilerplate for express-jwt
export const authMiddleware = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
})
