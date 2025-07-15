document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const messageDiv = document.getElementById('message');
  const locationInput = document.getElementById('location');
  const URL = `${BASE_URL}/signup`;
    let latitude, longitude;


  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => { latitude = position.coords.latitude; longitude = position.coords.longitude; },
      (error) => { console.error('Geolocation error:', error);});
  } else {
    locationInput.value = 'Geolocation not supported';
  }

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = '';

    const formData = new FormData(signupForm);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      password: formData.get('password'),
      role: formData.get('role').toLowerCase(),
      location: formData.get('location'),
      city: formData.get('city').toLowerCase(),
      location: {
        type: "Point",
        coordinates: [latitude, longitude]
      }
    };

    try {
      const response = await axios.post(URL, data)
        const result = response.data;
      if (result.success) {
        messageDiv.textContent = result.message;
        messageDiv.classList.add('success');
        window.location.href = '../login/login.html'; 
        signupForm.reset();
      } else {
        messageDiv.textContent = result.message;
        messageDiv.classList.add('error');
      }
    } catch (error) {
      messageDiv.textContent = 'An error occurred. Please try again.';
      messageDiv.classList.add('error');
    }
  });
});