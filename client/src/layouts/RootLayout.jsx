import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";

const RootLayout = () => {
  return (
    <Box
      sx={(theme) => ({
        width: "100vw",
        height: "100dvh",
        position: "relative",
        [theme.breakpoints.up("xl")]: {
          maxWidth: theme.breakpoints.values.xl,
          margin: "0 auto",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          zIndex: -1,
          inset: 0,
          backgroundImage:
            "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
          ...theme.applyStyles("dark", {
            backgroundImage:
              "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
          }),
        },
      })}
    >
      <Outlet />
    </Box>
  );
};

export default RootLayout;
