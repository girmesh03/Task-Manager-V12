import { memo } from "react";
import PropTypes from "prop-types";

import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";

import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import MuiTextField from "../MuiTextField";
import MuiSelectField from "../MuiSelectField";

import { companySizes, industries } from "../../utils/constants";

const CompanyDetailsStep = memo(({ control }) => {
  return (
    <Grid container spacing={1}>
      {/* company name */}
      <Grid size={{ xs: 12, sm: 6 }}>
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
          label="Company Name"
          placeholder="Enter your company name"
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

      {/* company address */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiTextField
          name="address"
          control={control}
          rules={{
            required: "Company address is required",
            minLength: {
              value: 10,
              message: "Company address must be at least 10 characters long",
            },
            maxLength: {
              value: 100,
              message: "Company address cannot exceed 100 characters",
            },
          }}
          label="Company Address"
          placeholder="Enter your company address"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      {/* company size */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiSelectField
          name="companySize"
          control={control}
          rules={{ required: "Company size is required" }}
          label="Company Size"
          options={companySizes}
          startAdornment={
            <InputAdornment position="start">
              <PeopleIcon fontSize="small" color="primary" />
            </InputAdornment>
          }
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 48 * 4.5 + 8,
              },
            },
          }}
        />
      </Grid>

      {/* industry */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiSelectField
          name="industry"
          control={control}
          rules={{ required: "Company industry type is required" }}
          label="Industry Type"
          options={industries}
          startAdornment={
            <InputAdornment position="start">
              <CategoryIcon fontSize="small" color="primary" />
            </InputAdornment>
          }
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 48 * 4.5 + 8,
              },
            },
          }}
        />
      </Grid>

      {/* company email */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiTextField
          name="companyEmail"
          control={control}
          rules={{
            required: "Company email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address format",
            },
            maxLength: {
              value: 50,
              message: "Email cannot exceed 50 characters",
            },
          }}
          label="Company Email"
          placeholder="company@example.com"
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

      {/* company phone number */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiTextField
          name="phone"
          control={control}
          rules={{
            required: "Company phone number is required",
            pattern: {
              value: /^(09\d{8}|\+2519\d{8})$/,
              message:
                "Invalid phone number. Must be 09xxxxxxxx or +2519xxxxxxxx format",
            },
          }}
          label="Company Phone Number"
          placeholder="09xxxxxxxx or +2519xxxxxxxx"
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
    </Grid>
  );
});

CompanyDetailsStep.propTypes = {
  control: PropTypes.object.isRequired,
};

export default CompanyDetailsStep;