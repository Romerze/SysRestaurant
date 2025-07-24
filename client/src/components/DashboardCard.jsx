import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const DashboardCard = ({ title, value, icon, color }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;