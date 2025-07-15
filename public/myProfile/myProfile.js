document.addEventListener('DOMContentLoaded',  () => {
  const profileTitle = document.getElementById('profile-title');
  const profileInfo = document.getElementById('profile-info');
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '../login/login.html';
    return;
  }
const logoutBtn = document.querySelector('.logout-btn');

  logoutBtn.addEventListener('click', () => {
    localStorage.clear(); 
    window.location.href = '../login/login.html'; 
  });


  async function fetchProfile() {
    try {
      const response = await axios.get(`${BASE_URL}/student/profile`, {
        headers: { authorization: token },
      });
      console.log(response);
      const { success, user } = response.data;
      if (!success) {
        profileInfo.innerHTML = `<p class="error">${response.data.message || 'Error fetching profile data'}</p>`;
        return;
      }
 
      displayProfile(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
      profileInfo.innerHTML = '<p class="error">Error fetching profile data. Please try again.</p>';
    }
  }


  function displayProfile(user) {

    
    profileInfo.innerHTML = `
      <p><i class="fas fa-user"></i> Name: ${user.name || 'N/A'}</p>
      <p><i class="fas fa-envelope"></i> Email: ${user.email ? `<a href="mailto:${user.email}">${user.email}</a>` : 'N/A'}</p>
      <p><i class="fas fa-phone"></i> Phone: ${user.phone || 'N/A'}</p>
      <p><i class="fas fa-user-tag"></i> Role: ${user.role || 'N/A'}</p>
      <p><i class="fas fa-city"></i> City: ${user.city || 'N/A'}</p>
    `;
  }

  
  fetchProfile();
});