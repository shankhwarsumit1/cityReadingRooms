document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const messageDiv = document.getElementById('message');
  const URL = `${BASE_URL}/login`;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = '';

    const formData = new FormData(loginForm);
    const identifier = formData.get('identifier');
    const password = formData.get('password');


    if (!identifier) {
      messageDiv.textContent = 'Please provide an email or phone number.';
      messageDiv.classList.add('error');
      return;
    }


    const isEmail = identifier.includes('@');
    const data = {
      [isEmail ? 'email' : 'phone']: identifier,
      password
    };

    try {
      const response = await axios.post(URL, data);
      const result = response.data;
      console.log(result);
      if (result.success) {
        messageDiv.textContent = result.message;
        messageDiv.classList.add('success');
        localStorage.setItem('token', result.token);
        localStorage.setItem('userId', result.user.id);
        localStorage.setItem('role', result.user.role);
        localStorage.setItem('city', result.user.city);
        loginForm.reset();
        setTimeout(() => {
          if (result.user.role === 'owner') {
            window.location.href = '../home/ownerHome/ownerHome.html';
          } else if (result.user.role === 'student') {
            window.location.href = '../home/studentHome/studentHome.html';
          }
        }, 1000);
      } else {
        messageDiv.textContent = result.message || result.error || 'Login failed';
        messageDiv.classList.add('error');
      }
    } catch (error) {
      if(error.response.status===404){
          messageDiv.textContent = "Incorrect email or password";
      }
      else{
      messageDiv.textContent = error.message;
      }messageDiv.classList.add('error');
    }
  });
});