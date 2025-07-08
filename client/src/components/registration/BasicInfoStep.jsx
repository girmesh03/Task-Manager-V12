import { memo } from "react";
import PropTypes from "prop-types";

import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";

import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";

import MuiTextField from "../MuiTextField";

const companySizes = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "500+", label: "500+ employees" },
];

const industries = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
];

const BasicInfoStep = memo(({ control, watch }) => {
  const password = watch("password");

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <MuiTextField
          name="companyName"
          control={control}
          rules={{
            required: "Company name is required",
            minLength: {
              value: 2,
              message: "Company name must be at least 2 characters long",
            },
            maxLength: {
              value: 50,
              message: "Company name cannot exceed 50 characters",
            },
          }}
          formLabel="Company Name"
          placeholder="Enter your company name"
          formControlProps={{ margin: "dense" }}
          formLabelProps={{ required: true }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <MuiTextField
          name="businessEmail"
          control={control}
          rules={{
            required: "Business email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address format",
            },
          }}
          formLabel="Business Email"
          placeholder="company@example.com"
          type="email"
          formControlProps={{ margin: "dense" }}
          formLabelProps={{ required: true }}
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

      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiTextField
          name="password"
          control={control}
          rules={{
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters long",
            },
          }}
          formLabel="Password"
          placeholder="••••••"
          type="password"
          formControlProps={{ margin: "dense" }}
          formLabelProps={{ required: true }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiTextField
          name="confirmPassword"
          control={control}
          rules={{
            required: "Please confirm your password",
            validate: (value) =>
              value === password || "Passwords do not match",
          }}
          formLabel="Confirm Password"
          placeholder="••••••"
          type="password"
          formControlProps={{ margin: "dense" }}
          formLabelProps={{ required: true }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <MuiTextField
          name="phone"
          control={control}
          rules={{
            required: "Phone number is required",
            pattern: {
              value: /^(09\d{8}|\+2519\d{8})$/,
              message: "Invalid phone number. Must be 09xxxxxxxx or +2519xxxxxxxx format",
            },
          }}
          formLabel="Phone Number"
          placeholder="09xxxxxxxx or +2519xxxxxxxx"
          formControlProps={{ margin: "dense" }}
          formLabelProps={{ required: true }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiTextField
          name="companySize"
          control={control}
          rules={{
            required: "Company size is required",
          }}
          formLabel="Company Size"
          select
          formControlProps={{ margin: "dense" }}
          formLabelProps={{ required: true }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PeopleIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            },
          }}
        >
          {companySizes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </MuiTextField>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiTextField
          name="industry"
          control={control}
          rules={{
            required: "Industry is required",
          }}
          formLabel="Industry"
          select
          formControlProps={{ margin: "dense" }}
          formLabelProps={{ required: true }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <CategoryIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            },
          }}
        >
          {industries.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </MuiTextField>
      </Grid>
    </Grid>
  );
});

BasicInfoStep.propTypes = {
  control: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
};

export default BasicInfoStep;