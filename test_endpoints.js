const axios = require('axios');

async function check() {
  try {
    const loginRes = await axios.post('http://127.0.0.1:3004/api/v1/auth/login', {
      email: "john@example.com",
      password: "Password123"
    });
    const token = loginRes.data.data.token.access_token;
    
    // Test undocumented endpoints
    try {
      const g1 = await axios.get('http://127.0.0.1:3004/api/v1/group', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('GET /group response:', JSON.stringify(g1.data, null, 2));
    } catch (e1) {
      console.log('GET /group failed:', e1.response ? e1.response.status : e1.message);
    }

    try {
      const g2 = await axios.get('http://127.0.0.1:3004/api/v1/group/my-group', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('GET /group/my-group response:', JSON.stringify(g2.data, null, 2));
    } catch (e2) {
      console.log('GET /group/my-group failed:', e2.response ? e2.response.status : e2.message);
    }
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
check();
