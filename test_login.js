import axios from 'axios';

const testLogin = async () => {
  try {
    console.log('Testing Admin Login...');
    const response = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'admin@snapadda.com',
      password: 'Manoj587487'
    });
    console.log('Login Success:', response.data.status);
  } catch (error) {
    console.error('Login Failed:', error.response?.data || error.message);
  }
};

testLogin();
