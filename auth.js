const axios = require('axios');

// Middleware to check if the user is authenticated
async function requireAuth(req, res, next) {
    try {
        const access_token = req.cookies.access_token;
        
        if (!access_token) {
            console.log('No access token found, redirecting to login');
            return res.redirect('/');
        }

        // Verify token validity by making a request to Spotify API
        try {
            const response = await axios.get('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });

            if (response.status !== 200) {
                console.log('Invalid token response from Spotify');
                return res.redirect('/');
            }

            // Add user info to request object for potential future use
            req.user = response.data;
            next();

        } catch (spotifyError) {
            console.error('Spotify API error:', spotifyError.message);
            
            // Handle specific API errors
            if (spotifyError.response) {
                switch (spotifyError.response.status) {
                    case 401:
                        console.log('Token expired or invalid');
                        
                        return res.redirect('/');
                    case 403:
                        console.log('Insufficient permissions');
                        return res.status(403).send('Insufficient permissions');
                    default:
                        console.log('Spotify API error:', spotifyError.response.status);
                        return res.status(500).send('Authentication error');
                }
            }

            return res.status(500).send('Authentication service unavailable');
        }

    } catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(500).send('Internal server error during authentication');
    }
}

module.exports = requireAuth;