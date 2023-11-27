import { OAuth2Client } from 'google-auth-library';

// Create an instance of the OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Replace with your own client ID
// Create a verify function for google token
async function verifyGoogleToken(token) {
  try {
    //console.log("hi..")
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Replace with your own client ID
    });
    
    // Get the user information from the verified token
    const payload = ticket.getPayload();
    const userId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const imageurl = payload.picture;
    //console.log("payload..", payload)
    // You can perform additional validation or database operations here

    // Return the user information
    return {
      userId,
      email,
      name,
      imageurl
    };
  } catch (error) {
    // Token verification failed
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid access token');
  }
}

export default verifyGoogleToken;
