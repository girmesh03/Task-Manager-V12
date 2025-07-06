import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { makeRequest } from "../api/apiRequest";
import StepperComponent from "../components/registration/StepperComponent";
import BasicInfoStep from "../components/registration/BasicInfoStep";
import CompanyDetailsStep from "../components/registration/CompanyDetailsStep";
import AccountOwnerStep from "../components/registration/AccountOwnerStep";

const Register = () => {
  console.log("Register");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    control,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      companyName: "",
      businessEmail: "",
      password: "",
      confirmPassword: "",
      phone: "",
      companySize: "",
      industry: "",
      address: "",
      adminFirstName: "",
      adminLastName: "",
      adminPosition: "",
      departmentName: "",
    },
    mode: "onChange",
  });

  const stepFields = [
    ["companyName", "businessEmail", "password", "confirmPassword", "phone", "companySize", "industry"],
    ["address"],
    ["adminFirstName", "adminLastName", "adminPosition", "departmentName"],
  ];

  const handleNext = async () => {
    const fieldsToValidate = stepFields[activeStep];
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setError("");
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setError("");
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = async (formData) => {
    setError("");
    setIsSubmitting(true);

    try {
      const companyData = {
        name: formData.companyName,
        address: formData.address,
        phone: formData.phone,
        email: formData.businessEmail,
      };

      const userData = {
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        adminEmail: formData.businessEmail,
        adminPassword: formData.password,
        adminPosition: formData.adminPosition,
        departmentName: formData.departmentName,
      };

      const response = await makeRequest.post("/companies/subscribe", {
        companyData,
        userData,
      });

      toast.success(response.data.message || "Registration successful! Please login to continue.");
      navigate("/login", { replace: true });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <BasicInfoStep control={control} watch={watch} />;
      case 1:
        return <CompanyDetailsStep control={control} />;
      case 2:
        return <AccountOwnerStep control={control} />;
      default:
        return null;
    }
  };

  const isLastStep = activeStep === 2;
  const isFirstStep = activeStep === 0;

  return (
    <Stack 
      direction="column" 
      sx={{ 
        height: "100%", 
        px: { xs: 1, sm: 2 }, 
        py: { xs: 2, sm: 4 },
        overflow: "auto",
      }}
    >
      <Card
        variant="outlined"
        sx={{
          maxWidth: { xs: "100%", sm: 600, md: 700 },
          width: "100%",
          m: "auto",
          px: { xs: 2, sm: 3 },
          py: { xs: 3, sm: 4 },
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Stack direction="column" spacing={3}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            textAlign="center" 
            fontWeight={700}
          >
            Create Your Account
          </Typography>

          <StepperComponent activeStep={activeStep} />

          <CardContent
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            autoComplete="off"
            sx={{ p: 0 }}
          >
            {renderStepContent()}

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                mt: 4,
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

              <Box sx={{ order: { xs: 1, sm: 2 } }}>
                {isLastStep ? (
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    disabled={isSubmitting}
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={20} sx={{ color: "white" }} />
                      ) : null
                    }
                    sx={{ minWidth: 120 }}
                  >
                    {isSubmitting ? "Creating..." : "Create Account"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ minWidth: 120 }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Button
                component={Link}
                to="/login"
                variant="text"
                size="small"
                sx={{ textTransform: "none", p: 0, minWidth: "auto" }}
              >
                Sign in here
              </Button>
            </Typography>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
};

export default Register;