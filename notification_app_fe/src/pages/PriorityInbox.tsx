import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Paper, Badge, Box, TextField, MenuItem, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import axios from 'axios';
import { Log } from 'logging_middleware';

interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

const typeWeights: Record<string, number> = {
  "Placement": 3,
  "Result": 2,
  "Event": 1
};

export default function PriorityInbox() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState<number>(10);
  const [filterType, setFilterType] = useState<string>("All");

  useEffect(() => {
    const storedViewed = localStorage.getItem('viewed_notifications');
    if (storedViewed) {
      try {
        setViewedIds(new Set(JSON.parse(storedViewed)));
      } catch (e) {
        console.error("Failed to parse viewed notifications", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchAndSortNotifications = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        // Fetch using query params as allowed by Stage 2
        let url = `http://4.224.186.213/evaluation-service/notifications?limit=${limit}`;
        if (filterType !== "All") {
          url += `&notification_type=${filterType}`;
        }

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.notifications) {
          // Frontend sorting as required for Priority Inbox
          let sorted = [...response.data.notifications].sort((a, b) => {
            const weightA = typeWeights[a.Type] || 0;
            const weightB = typeWeights[b.Type] || 0;
            if (weightA !== weightB) {
              return weightB - weightA; // Higher weight first
            }
            return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime(); // Newer first
          });
          
          setNotifications(sorted);
          Log("frontend", "info", "page", `Fetched and sorted priority notifications.`);
        }
      } catch (error) {
        console.error("Error fetching notifications", error);
        Log("frontend", "error", "api", "Failed to fetch priority notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndSortNotifications();
  }, [limit, filterType]);

  const markAsViewed = (id: string) => {
    if (!viewedIds.has(id)) {
      const newViewed = new Set(viewedIds).add(id);
      setViewedIds(newViewed);
      localStorage.setItem('viewed_notifications', JSON.stringify(Array.from(newViewed)));
    }
  };

  const handleTypeChange = (event: SelectChangeEvent) => {
    setFilterType(event.target.value);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Priority Inbox
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Top 'n' Notifications"
          type="number"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          inputProps={{ min: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Notification Type</InputLabel>
          <Select
            value={filterType}
            label="Notification Type"
            onChange={handleTypeChange}
          >
            <MenuItem value="All">All Types</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Paper elevation={3} sx={{ maxHeight: '60vh', overflow: 'auto' }}>
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
            {notifications.length === 0 && (
              <ListItem><ListItemText primary="No notifications found." /></ListItem>
            )}
          </List>
        </Paper>
      )}
    </Container>
  );
}
