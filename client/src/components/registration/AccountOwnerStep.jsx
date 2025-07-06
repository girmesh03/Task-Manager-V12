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
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiTextField
          name="adminFirstName"
          control={control}
          rules={{
            required: "First name is required",
          }}
          formLabel="Admin First Name"
          placeholder="Enter first name"
          formControlProps={{ margin: "dense" }}
          formLabelProps={{ required: true }}
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

      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiTextField
          name="adminLastName"
          control={control}
          rules={{
            required: "Last name is required",
          }}
          formLabel="Admin Last Name"
          placeholder="Enter last name"
          formControlProps={{ margin: "dense" }}
          formLabelProps={{ required: true }}
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

      <Grid size={{ xs: 12 }}>
        <MuiTextField
          name="adminPosition"
          control={control}
          rules={{
            required: "Position is required",
          }}
          formLabel="Admin Position"
          placeholder="e.g., CEO, Manager, Director"
          formControlProps={{ margin: "dense" }}
          formLabelProps={{ required: true }}
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

      <Grid size={{ xs: 12 }}>
        <MuiTextField
          name="departmentName"
          control={control}
          rules={{
            required: "Department name is required",
          }}
          formLabel="Department Name"
          placeholder="e.g., Administration, Management, IT"
          formControlProps={{ margin: "dense" }}
          formLabelProps={{ required: true }}
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