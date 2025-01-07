const jwt = require("jsonwebtoken");
const { CustomError } = require("./error");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new CustomError("You are not authenticated!", 401);
  }

  const token = authHeader.split(" ")[1]; // Extract the token after "Bearer"

  jwt.verify(token, "Shibam@9064176535", (err, data) => {
    if (err) {
      throw new CustomError("Token is not valid!", 403);
    }
    req.userId = data._id; // Assign the user ID to the request object
    next();
  });
};

module.exports = verifyToken;
