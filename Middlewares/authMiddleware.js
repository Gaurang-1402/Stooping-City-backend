import expressJwt from "express-jwt"

// now we have the json web token
// we don't want to manually verify the token
// so we use express json web token

// boilerplate for express-jwt
// JWT-SECRET
export const authMiddleware = expressJwt({
  secret: "R940FJRBTNT0G9343-VMVIjvrjt",
  algorithms: ["HS256"],
})
