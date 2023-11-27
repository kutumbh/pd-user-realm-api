const axios = require("axios")
async function verifyFacebookToken(accessToken) {
    const faceBookPublicKeyUrl = "https://graph.facebook.com/debug_token"
    const appID = "835202471373097"
    const appSecret = "c20cd17893dbe098414e30a01d164eca"
    try {
        const response = await axios.get(faceBookPublicKeyUrl, {
            params: {
                input_token: accessToken,
                access_token: `${appID}|${appSecret}`
            }
        })

        const data = response.data
        console.log("*********", data)
        console.log("**********")
        if (data.data && data.data.is_valid && data.data.app_id === appID) {
            // Token is valid, and it belongs to your Facebook app
            //const userID = data.data.user_id
            let json = {
                userID: data.data.user_id,
                scopes: data.data.scopes
            }
            return json
        } else {
            // Token is invalid or doesn't belong to your app
            throw new Error("Invalid token.")
        }
    } catch (error) {
        // Token verification failed
        console.error("Error verifying Facebook token:", error)
        throw new Error("Invalid access token")
    }
}

export default verifyFacebookToken
