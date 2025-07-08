import { memo } from "react";
import PropTypes from "prop-types";

import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";

import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";

import MuiTextField from "../MuiTextField";

const AccountOwnerStep = memo(({ control }) => {
  return (
    <Grid container spacing={1}>
      {/* owner first name */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiTextField
          name="adminFirstName"
          control={control}
          rules={{
            required: "First name is required",
            minLength: {
              value: 2,
              message: "First name must be at least 2 characters long",
            },
            maxLength: {
              value: 15,
              message: "First name cannot exceed 15 characters",
            },
          }}
          label="Your First Name"
          placeholder="Enter first name"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      {/* owner last name */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiTextField
          name="adminLastName"
          control={control}
          rules={{
            required: "Last name is required",
            minLength: {
              value: 2,
              message: "Last name must be at least 2 characters long",
            },
            maxLength: {
              value: 15,
              message: "Last name cannot exceed 15 characters",
            },
          }}
          label="Your Last Name"
          placeholder="Enter last name"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      {/* owner position */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiTextField
          name="adminPosition"
          control={control}
          rules={{
            required: "Position is required",
            minLength: {
              value: 2,
              message: "Position must be at least 2 characters long",
            },
            maxLength: {
              value: 30,
              message: "Position cannot exceed 30 characters",
            },
          }}
          label="Your Position"
          placeholder="e.g., CEO, Manager, Director"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <WorkIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      {/* department name */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiTextField
          name="departmentName"
          control={control}
          rules={{
            required: "Department name is required",
            minLength: {
              value: 2,
              message: "Department name must be at least 2 characters long",
            },
            maxLength: {
              value: 50,
              message: "Department name cannot exceed 50 characters",
            },
          }}
          label="Department Name"
          placeholder="e.g., Administration, Management, IT"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessCenterIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
    </Grid>
  );
});

AccountOwnerStep.propTypes = {
  control: PropTypes.object.isRequired,
};

export default AccountOwnerStep;
