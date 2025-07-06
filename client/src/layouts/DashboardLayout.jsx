import { useState, useEffect, useCallback, memo } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";

import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import AppBar from "@mui/material/AppBar";
import useMediaQuery from "@mui/material/useMediaQuery";

import ChevronLeft from "@mui/icons-material/ChevronLeft";
import Menu from "@mui/icons-material/Menu";
// import HomeRounded from "@mui/icons-material/HomeRounded";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import PeopleRounded from "@mui/icons-material/PeopleRounded";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import AssignmentInd from "@mui/icons-material/AssignmentInd";

import { DRAWER_WIDTH } from "../utils/constants";

const GENERAL_ROUTES = [
  {
    text: "Statistics",
    icon: <DashboardRounded />,
    path: "/dashboard/statistics",
  },
  { text: "Tasks", icon: <AssignmentRounded />, path: "/dashboard/tasks" },
  { text: "Routines", icon: <AssignmentInd />, path: "/dashboard/routines" },
  { text: "Users", icon: <PeopleRounded />, path: "/dashboard/users" },
];

const MenuListItem = memo(({ item, currentPath }) => {
  const isSelected = currentPath.startsWith(item.path);
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        component={Link}
        to={item.path}
        selected={isSelected}
        sx={{
          "&.MuiListItemButton-root.Mui-selected": {
            backgroundColor: (theme) => theme.palette.primary.main,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.primary.dark,
            },
          },
        }}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.text} />
      </ListItemButton>
    </ListItem>
  );
});

const DashboardLayout = memo(() => {
  console.log("Dashboard");
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [drawerOpen, setDrawerOpen] = useState(isDesktop);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  // Auto-close mobile drawer on navigation
  useEffect(() => {
    if (!isDesktop) setDrawerOpen(false);
  }, [pathname, isDesktop]);

  // Sync drawer state with viewport changes
  useEffect(() => {
    setDrawerOpen(isDesktop);
  }, [isDesktop]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Appbar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundImage: "none",
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(drawerOpen &&
            isDesktop && {
              width: `calc(100% - ${DRAWER_WIDTH}px)`,
              marginLeft: DRAWER_WIDTH,
            }),
        }}
      >
        <Toolbar>
          {(!isDesktop || !drawerOpen) && (
            <>
              <IconButton
                color="inherit"
                onClick={toggleDrawer}
                sx={{ mr: 1.5 }}
                size="small"
              >
                <Menu fontSize="small" />
              </IconButton>
              <Typography
                variant="h4"
                onClick={() => navigate("/")}
                sx={{
                  cursor: "pointer",
                  "@media (max-width: 600px) and (orientation: portrait)": {
                    display: "none",
                  },
                }}
              >
                Taskmanager
              </Typography>
            </>
          )}

          {/* The remaining content of the Appbar here */}
        </Toolbar>
      </AppBar>

      {/* Drawer container */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Drawer
          variant={isDesktop ? "permanent" : "temporary"}
          open={drawerOpen}
          onClose={toggleDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              borderRight: 1,
              borderColor: "divider",
              backgroundImage: "none",
            },
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
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
              <Typography variant="h5">Taskmanager</Typography>
            </Stack>
            {isDesktop && (
              <IconButton onClick={toggleDrawer} size="small">
                <ChevronLeft fontSize="small" />
              </IconButton>
            )}
          </Toolbar>
          <List dense>
            <ListSubheader>Dashboard</ListSubheader>
            {GENERAL_ROUTES.map((item) => (
              <MenuListItem
                key={item.path}
                item={item}
                currentPath={pathname}
              />
            ))}
            <ListSubheader sx={{ mt: 2 }}>General</ListSubheader>
            {/* <MenuListItem
              item={{ text: "Home", icon: <HomeRounded />, path: "/" }}
              currentPath={pathname}
            /> */}
          </List>
        </Drawer>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            width: `calc(100% - ${
              drawerOpen && isDesktop ? DRAWER_WIDTH : 0
            }px)`,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Toolbar />
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 1,
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

export default DashboardLayout;
