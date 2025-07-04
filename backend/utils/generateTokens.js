import jwt from "jsonwebtoken";

// Token expiration times
const ACCESS_TOKEN_EXPIRY = "1d";
const REFRESH_TOKEN_EXPIRY = "7d";
const ACCESS_TOKEN_MAX_AGE = 1 * 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const generateAccessToken = (res, user) => {
  const accessToken = jwt.sign(
    {
      _id: user._id,
      role: user.role,
      department: user.department?._id,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
};

export const generateRefreshToken = async (res, user) => {
  const refreshToken = jwt.sign(
    {
      _id: user._id,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
};
