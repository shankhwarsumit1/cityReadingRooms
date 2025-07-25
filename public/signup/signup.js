document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const messageDiv = document.getElementById('message');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const URL = `${BASE_URL}/signup`;

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = '';

    try {
      const formData = new FormData(signupForm);

      let latitude = null;
      let longitude = null;
      loadingOverlay.classList.remove('hidden');
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
            loadingOverlay.classList.add('hidden');

      } else {
          loadingOverlay.classList.add('hidden');
        console.error('Geolocation not supported');
      }

      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        role: formData.get('role').toLowerCase(),
        city: formData.get('city').toLowerCase(),
        location: {
          type: "Point",
          coordinates: [longitude,latitude]
        }
      };

      const response = await axios.post(URL, data);
      const result = response.data;

      if (result.success) {
        messageDiv.textContent = result.message;
        messageDiv.classList.add('success');
        signupForm.reset();
        window.location.href = '../login/login.html';
      } else {
        messageDiv.textContent = result.message;
        messageDiv.classList.add('error');
      }
    } catch (error) {
      console.error(error);
      messageDiv.textContent = error?.response?.data?.message || 'An error occurred';
      messageDiv.classList.add('error');
    }
  });
});
