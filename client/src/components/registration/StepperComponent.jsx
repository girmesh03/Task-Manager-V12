import { memo } from "react";
import PropTypes from "prop-types";

import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const steps = [
  "Basic Information",
  "Company Details", 
  "Account Owner Details"
];

const StepperComponent = memo(({ activeStep }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <Stepper 
        activeStep={activeStep} 
        orientation={isMobile ? "vertical" : "horizontal"}
        sx={{
          ...(isMobile && {
            "& .MuiStepConnector-root": {
              marginLeft: "12px",
            },
          }),
        }}
      >
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              sx={{
                "& .MuiStepLabel-label": {
                  fontSize: isMobile ? "0.875rem" : "1rem",
                  fontWeight: activeStep === index ? 600 : 400,
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
});

StepperComponent.propTypes = {
  activeStep: PropTypes.number.isRequired,
};

export default StepperComponent;