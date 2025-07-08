import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { makeRequest } from "../api/apiRequest";

import StepperComponent from "../components/registration/StepperComponent";
import CompanyDetailsStep from "../components/registration/CompanyDetailsStep";
import AccountOwnerStep from "../components/registration/AccountOwnerStep";
import AccountCredentialsStep from "../components/registration/AccountCredentialsStep";

const steps = ["Company Details", "Account Owner", "Credentials", "Review"];

// DetailItem component for consistent styling
function DetailItem({ label, value }) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Typography variant="body2" fontWeight={600} minWidth={120}>
        {label}:
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ wordBreak: "break-word" }}
      >
        {value || (
          <span style={{ color: "text.disabled", fontStyle: "italic" }}>
            Not provided
          </span>
        )}
      </Typography>
    </Stack>
  );
}

const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword((prev) => !prev);

  const {
    handleSubmit,
    control,
    trigger,
    getValues,
    formState: { isSubmitting, isValid },
  } = useForm({
    defaultValues: {
      // company info
      companyName: "",
      companyEmail: "",
      phone: "",
      address: "",
      companySize: "",
      industry: "",
      // admin account
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      password: "",
      adminPosition: "",
      departmentName: "",
    },
    mode: "onChange",
  });

  const stepFields = [
    [
      "companyName",
      "address",
      "phone",
      "companyEmail",
      "companySize",
      "industry",
    ],
    ["adminFirstName", "adminLastName", "adminPosition", "departmentName"],
    ["adminEmail", "password"],
    [], // Review step has no fields to validate
  ];

  const handleNext = async () => {
    const fieldsToValidate = stepFields[activeStep];
    if (fieldsToValidate.length > 0) {
      const isStepValid = await trigger(fieldsToValidate);
      if (!isStepValid) return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = async () => {
    const formData = getValues();
    try {
      const companyData = {
        name: formData.companyName,
        address: formData.address,
        phone: formData.phone,
        email: formData.companyEmail,
        size: formData.companySize,
        industry: formData.industry,
      };

      const userData = {
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.password,
        adminPosition: formData.adminPosition,
        departmentName: formData.departmentName,
      };

      const response = await makeRequest.post("/auth/register", {
        companyData,
        userData,
      });

      toast.success(
        response.data.message ||
          "Registration successful! Please login to continue."
      );
      navigate("/login", { replace: true });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  const renderStepContent = () => {
    const formData = getValues();

    switch (activeStep) {
      case 0:
        return <CompanyDetailsStep control={control} />;
      case 1:
        return <AccountOwnerStep control={control} />;
      case 2:
        return (
          <AccountCredentialsStep
            control={control}
            showPassword={showPassword}
            togglePassword={togglePassword}
            isLoading={isSubmitting}
          />
        );
      case 3:
        return (
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Typography
              variant="h5"
              fontWeight={600}
              textAlign="center"
              color="primary"
            >
              Review Your Information
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
              }}
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={2}>
                    <Divider
                      textAlign="center"
                      sx={{
                        "&::before, &::after": {
                          borderColor: "primary.main",
                        },
                        "& .MuiDivider-wrapper": {
                          px: 1.5,
                          color: "primary.main",
                          fontWeight: 600,
                          fontSize: "1.1rem",
                        },
                      }}
                    >
                      Company Details
                    </Divider>

                    <Stack spacing={1.5}>
                      <DetailItem
                        label="Company Name"
                        value={formData.companyName}
                      />
                      <DetailItem label="Address" value={formData.address} />
                      <DetailItem label="Phone" value={formData.phone} />
                      <DetailItem label="Email" value={formData.companyEmail} />
                      <DetailItem label="Size" value={formData.companySize} />
                      <DetailItem label="Industry" value={formData.industry} />
                    </Stack>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={2}>
                    <Divider
                      textAlign="center"
                      sx={{
                        "&::before, &::after": {
                          borderColor: "primary.main",
                        },
                        "& .MuiDivider-wrapper": {
                          px: 1.5,
                          color: "primary.main",
                          fontWeight: 600,
                          fontSize: "1.1rem",
                        },
                      }}
                    >
                      Account Owner
                    </Divider>

                    <Stack spacing={1.5}>
                      <DetailItem
                        label="Full Name"
                        value={`${formData.adminFirstName} ${formData.adminLastName}`}
                      />
                      <DetailItem
                        label="Position"
                        value={formData.adminPosition}
                      />
                      <DetailItem
                        label="Department"
                        value={formData.departmentName}
                      />

                      <Divider
                        textAlign="center"
                        sx={{
                          mt: 1,
                          "& .MuiDivider-wrapper": {
                            px: 1.5,
                            color: "text.secondary",
                            fontWeight: 500,
                          },
                        }}
                      >
                        Credentials
                      </Divider>

                      <DetailItem label="Email" value={formData.adminEmail} />
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}
            >
              Review all information before creating your account
            </Typography>
          </Stack>
        );
      default:
        return null;
    }
  };

  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

  return (
    <Stack
      direction="column"
      sx={{
        px: { xs: 1, sm: 2 },
        py: { xs: 2, sm: 4 },
      }}
    >
      <Card
        variant="outlined"
        sx={{
          maxWidth: { xs: "100%", sm: 600, md: 700 },
          width: "100%",
          m: "auto",
          px: { xs: 1, sm: 3 },
          py: { xs: 3, sm: 4 },
        }}
      >
        <Stack direction="column" spacing={2}>
          {!isLastStep && (
            <>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                textAlign="center"
                fontWeight={700}
              >
                Create Your Account
              </Typography>

              <StepperComponent activeStep={activeStep} steps={steps} />
            </>
          )}

          {/* Move form to only wrap the review step */}
          {isLastStep ? (
            <CardContent
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              autoComplete="off"
              sx={{ p: 0 }}
            >
              {renderStepContent()}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column-reverse", sm: "row-reverse" },
                  gap: 2,
                  mt: 2,
                  justifyContent: "space-between",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={isFirstStep || isSubmitting}
                  startIcon={<ArrowBackIcon />}
                  sx={{ order: { xs: 2, sm: 1 } }}
                  size="small"
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={isSubmitting || !isValid}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} sx={{ color: "white" }} />
                    ) : null
                  }
                  sx={{ minWidth: 120 }}
                  size="small"
                >
                  {isSubmitting ? "Creating..." : "Create Account"}
                </Button>
              </Box>
            </CardContent>
          ) : (
            <CardContent sx={{ p: 0 }}>
              {renderStepContent()}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column-reverse", sm: "row-reverse" },
                  gap: 2,
                  mt: 2,
                  justifyContent: "space-between",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={isFirstStep || isSubmitting}
                  startIcon={<ArrowBackIcon />}
                  sx={{ order: { xs: 2, sm: 1 } }}
                >
                  Back
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  color="secondary"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  endIcon={<ArrowForwardIcon />}
                >
                  {activeStep === 2 ? "Review" : "Next"}
                </Button>
              </Box>
            </CardContent>
          )}

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Already have an account?{" "}
            <Link
              component={RouterLink}
              to="/login"
              underline="hover"
              sx={{ fontWeight: 500, color: "primary.main" }}
            >
              Login here
            </Link>
          </Typography>
        </Stack>
      </Card>
    </Stack>
  );
};

export default Register;
