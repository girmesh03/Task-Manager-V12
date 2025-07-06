import { memo } from "react";
import PropTypes from "prop-types";

import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";

import LocationOnIcon from "@mui/icons-material/LocationOn";

import MuiTextField from "../MuiTextField";

const CompanyDetailsStep = memo(({ control }) => {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <MuiTextField
          name="address"
          control={control}
          rules={{
            required: "Company address is required",
            minLength: {
              value: 10,
              message: "Address must be at least 10 characters long",
            },
            maxLength: {
              value: 100,
              message: "Address cannot exceed 100 characters",
            },
          }}
          formLabel="Company Address"
          placeholder="Enter your complete company address"
          multiline
          rows={3}
          formControlProps={{ margin: "dense" }}
          formLabelProps={{ required: true }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                  <LocationOnIcon fontSize="small" color="primary" />
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