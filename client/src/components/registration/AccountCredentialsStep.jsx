import { memo } from "react";
import PropTypes from "prop-types";

import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

import MuiTextField from "../MuiTextField";

const AccountCredentialsStep = memo(
  ({ control, togglePassword, showPassword, isLoading }) => {
    return (
      <Grid container spacing={1}>
        {/* owner email */}
        <Grid size={{ xs: 12 }}>
          <MuiTextField
            name="adminEmail"
            control={control}
            rules={{
              required: "Your email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address format",
              },
              maxLength: {
                value: 50,
                message: "Email cannot exceed 50 characters",
              },
            }}
            label="Admin Email"
            placeholder="your-email@example.com"
            autoComplete="email"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" color="primary" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        {/* owner password */}
        <Grid size={{ xs: 12 }}>
          <MuiTextField
            name="password"
            control={control}
            rules={{
              required: "Your password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
            label="Password"
            placeholder="••••••"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            disabled={isLoading}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment
                    position="end"
                    size="small"
                    sx={{ cursor: isLoading ? "default" : "pointer" }}
                    onClick={togglePassword}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
      </Grid>
    );
  }
);

AccountCredentialsStep.propTypes = {
  control: PropTypes.object.isRequired,
  togglePassword: PropTypes.func.isRequired,
  showPassword: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default AccountCredentialsStep;
