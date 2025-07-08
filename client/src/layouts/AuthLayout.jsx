import { Outlet, useNavigate } from "react-router-dom";

import Container from "@mui/material/Container";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DashboardRounded from "@mui/icons-material/DashboardRounded";

const AuthLayout = () => {
  console.log("AuthLayout");
  const navigate = useNavigate();
  return (
    <Container
      maxWidth="xl"
      disableGutters
      sx={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <AppBar position="sticky" sx={{ backgroundImage: "none" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ mr: 1, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0d47a1, #1976d2)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DashboardRounded sx={{ fontSize: 16, color: "white" }} />
            </Box>
            <Typography variant="h4">Taskmanager</Typography>
          </Stack>
          <Button
            color="secondary"
            variant="outlined"
            size="small"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <Outlet />
      </Box>
    </Container>
  );
};

export default AuthLayout;
