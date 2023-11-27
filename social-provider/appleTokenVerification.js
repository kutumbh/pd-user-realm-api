const jwt = require('jsonwebtoken');
const axios = require('axios');
const jwkToPem = require('jwk-to-pem');

// Create a verify function for apple token
async function verifyAppleToken(token) {
    const applePublicKeyUrl = 'https://appleid.apple.com/auth/keys';
    try {
        // Decode the token to retrieve the header
        const decodedToken = jwt.decode(token, { complete: true });
        const header = decodedToken.header;
    
        // Fetch Apple's public keys
        const response = await axios.get(applePublicKeyUrl);
        const applePublicKeys = response.data.keys;
    
        // Find the correct key to verify the token
        const selectedKey = applePublicKeys.find((key) => key.kid === header.kid);
    
        // Convert the selected key to PEM format
        const pem = jwkToPem(selectedKey);
    
        // Verify the token
        const verifiedToken = jwt.verify(token, pem, { algorithms: ['RS256'] });
        return verifiedToken;
      } catch (error) {
        //console.error('Error verifying Apple token:', error);
        throw new Error('Invalid access token');
    }
  }

  

export default verifyAppleToken;