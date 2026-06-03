import { Box, Button, Container, Stack, Typography } from '@mui/material';

function Landing() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                px: 2,
            }}
        >
            <Container maxWidth="md">
                <Box
                    sx={{
                        p: { xs: 4, md: 6 },
                        bgcolor: 'white',
                    }}
                >
                    <Stack spacing={3}>
                        <Typography variant="h3" component="h1" fontWeight={700}>
                            Landing simple con React y MUI.
                        </Typography>
                        <Typography color="text.secondary">
                            Una página mínima.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Button variant="contained">
                                Ir al login
                            </Button>
                            <Button variant="outlined">
                                Ver Dashboard
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
}

export default Landing;