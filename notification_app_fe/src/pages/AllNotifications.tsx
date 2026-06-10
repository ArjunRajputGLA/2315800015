import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Paper, Badge, Box } from '@mui/material';
import axios from 'axios';
import { Log } from 'logging_middleware';

interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

export default function AllNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load viewed IDs from local storage
    const storedViewed = localStorage.getItem('viewed_notifications');
    if (storedViewed) {
      try {
        setViewedIds(new Set(JSON.parse(storedViewed)));
      } catch (e) {
        console.error("Failed to parse viewed notifications", e);
      }
    }

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://4.224.186.213/evaluation-service/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.notifications) {
          setNotifications(response.data.notifications);
          Log("frontend", "info", "page", `Fetched ${response.data.notifications.length} notifications successfully.`);
        }
      } catch (error) {
        console.error("Error fetching notifications", error);
        Log("frontend", "error", "api", "Failed to fetch all notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsViewed = (id: string) => {
    if (!viewedIds.has(id)) {
      const newViewed = new Set(viewedIds).add(id);
      setViewedIds(newViewed);
      localStorage.setItem('viewed_notifications', JSON.stringify(Array.from(newViewed)));
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        All Notifications
      </Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Paper elevation={3} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          <List>
            {notifications.map((notif) => {
              const isViewed = viewedIds.has(notif.ID);
              return (
                <ListItem 
                  key={notif.ID} 
                  divider 
                  button 
                  onClick={() => markAsViewed(notif.ID)}
                  sx={{ backgroundColor: isViewed ? 'transparent' : 'rgba(25, 118, 210, 0.08)' }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={isViewed ? 'normal' : 'bold'}>
                          [{notif.Type}] {notif.Message}
                        </Typography>
                        {!isViewed && <Badge badgeContent="New" color="primary" sx={{ ml: 3 }} />}
                      </Box>
                    }
                    secondary={new Date(notif.Timestamp).toLocaleString()}
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      )}
    </Container>
  );
}
