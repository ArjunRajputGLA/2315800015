import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import AllNotifications from './pages/AllNotifications';
import PriorityInbox from './pages/PriorityInbox';
import axios from 'axios';
import { setLogAuthToken, Log } from 'logging_middleware';

const clientID = "cc3f7ab8-2e6d-45a0-b85c-b204e256675d";
const clientSecret = "QxEqJhaSnJtPFjcG";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authenticate = async () => {
      try {
        const response = await axios.post('http://4.224.186.213/evaluation-service/auth', {
          clientID,
          clientSecret
        });
        if (response.data && response.data.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
          setLogAuthToken(response.data.access_token);
          setIsAuthenticated(true);
          Log("frontend", "info", "auth", "User successfully authenticated to fetching token.");
        }
      } catch (error) {
        console.error("Failed to authenticate", error);
      }
    };

    authenticate();
  }, []);

  if (!isAuthenticated) {
    return <Container><Typography variant="h5" sx={{ mt: 5 }}>Authenticating...</Typography></Container>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Campus Notifications
          </Typography>
          <Button color="inherit" component={Link} to="/">All Notifications</Button>
          <Button color="inherit" component={Link} to="/priority">Priority Inbox</Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Routes>
          <Route path="/" element={<AllNotifications />} />
          <Route path="/priority" element={<PriorityInbox />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
