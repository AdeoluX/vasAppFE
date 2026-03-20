const axios = require('axios');

async function check() {
  try {
    const loginRes = await axios.post('http://127.0.0.1:3004/api/v1/auth/login', {
      email: "john@example.com",
      password: "Password123"
    });
    const token = loginRes.data.data.token.access_token;
    
    const profileRes = await axios.get('http://127.0.0.1:3004/api/v1/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(JSON.stringify(profileRes.data, null, 2));
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
check();
