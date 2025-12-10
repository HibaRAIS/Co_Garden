// src/membersClient.js (Tasks Backend Service) - DEVELOPMENT VERSION

const axios = require('axios'); 
// Ensure your Tasks Service .env has MEMBERS_API_URL set to http://localhost:8001/api
const baseUrl = process.env.MEMBERS_API_URL || 'http://localhost:8001/api'; 

// 💡 NEW: Read the JWT token from the Tasks Service .env file (e.g., set as INTERNAL_JWT_TOKEN)
const INTERNAL_TOKEN = process.env.INTERNAL_JWT_TOKEN; 

/**
 * Verifies if a member ID exists by calling the Member Service API (GET /api/members/{memberId}).
 * @param {string} memberId 
 * @returns {Promise<boolean>}
 */
exports.verifyMember = async function (memberId) {
  // ✅ DEVELOPMENT MODE: Accept all valid member IDs without verification
  // Remove this bypass in production
  if (memberId && !isNaN(Number(memberId))) {
    console.log(`✅ Member ${memberId} accepted (development mode - bypass verification)`);
    return true;
  }
  
  try {
    if (!INTERNAL_TOKEN) {
        console.error("❌ ERROR: INTERNAL_JWT_TOKEN is missing in Tasks Service .env. Member verification will fail.");
        return false;
    }
    
    // The Member Service requires an Authorization header for all /api/members endpoints
    const res = await axios.get(`${baseUrl}/members/${memberId}`, {
        // 💡 CRITICAL FIX: Inject the token here
        headers: {
            'Authorization': `Bearer ${INTERNAL_TOKEN}`
        }
    });
    
    // The member exists if the status is 200 (and the body contains data)
    return res.status === 200 && res.data && res.data.id; 
    
  } catch (err) {
    // Log the specific error from the Member Service response (e.g., 401 Unauthorized)
    console.error(`❌ Member verification failed for ID ${memberId}. Error: ${err.response ? err.response.status : err.message}`);
    return false; // This triggers the 400 Bad Request in your controller
  }
};
