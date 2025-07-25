// backend/config/corsOptions.js
import allowedOrigins from "./allowedOrigins.js";
import CustomError from "../errorHandler/CustomError.js";
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      console.warn(`CORS violation attempt blocked from origin: ${origin}`);
      callback(new CustomError("Not allowed by CORS", 403, "CORS-403"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  optionsSuccessStatus: 200,
};

export const corsSocketOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      console.warn(`Socket.IO CORS blocked from origin: ${origin}`);
      callback(new CustomError("Not allowed by CORS", 403, "CORS-403"));
    }
  },
  credentials: true,
  methods: ["GET", "POST"],
};

export default corsOptions;
