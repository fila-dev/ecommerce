const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const requireAuth = async (req, res, next) => {
  try {
    // verify user is authenticated
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({
        error: "Authorization token required",
      });
    }

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Invalid token format",
      });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Token not found in authorization header",
      });
    }

    try {
      const { _id } = jwt.verify(token, process.env.SECRET);

      // Find user and verify they still exist
      const user = await User.findOne({ _id }).select("_id");
      if (!user) {
        return res.status(401).json({
          error: "User not found",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.log("JWT Verification Error:", error);
      res.status(401).json({ error: "Request is not authorized" });
    }
  } catch (error) {
    console.log("Auth Middleware Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = requireAuth;
