import React, { useContext, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  CompareArrows as CompareArrowsIcon,
  SwapHoriz as SwapHorizIcon,
  TrendingUp as TrendingUpIcon,
  SyncAlt as SyncAltIcon,
  Logout as LogoutIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from '@mui/icons-material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import GridViewIcon from '@mui/icons-material/GridView';
import PieChartIcon from '@mui/icons-material/PieChart';
import BoltIcon from '@mui/icons-material/Bolt';
import { AuthContext } from '../AuthContext';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Corretoras', icon: <AccountBalanceIcon />, path: '/exchanges' },
  { text: 'Saldos', icon: <AccountBalanceWalletIcon />, path: '/balances' },
  { text: 'Patrimônio', icon: <PieChartIcon />, path: '/portfolio' },
  { text: 'Transferências', icon: <SwapHorizIcon />, path: '/transfers' },
  { text: 'Arbitragem', icon: <CompareArrowsIcon />, path: '/arbitrage' },
  { text: 'Cross-Market', icon: <ShowChartIcon />, path: '/cross-market' },
  { text: 'Market Making', icon: <TimelineIcon />, path: '/market-making' },
  { text: 'Grid Bot', icon: <GridViewIcon />, path: '/grid-bot' },
  { text: 'Flash Loans', icon: <BoltIcon />, path: '/flash-loan' }
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          ArbTrade
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          borderBottom: '1px solid #30363d',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, 
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #30363d' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, minHeight: '100vh', bgcolor: 'background.default' }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
