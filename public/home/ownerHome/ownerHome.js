document.addEventListener('DOMContentLoaded', () => {
  const noRooms = document.getElementById('no-rooms');
  const roomsList = document.getElementById('rooms-list');
  const registerBtn = document.getElementById('register-btn');
  const registerModal = document.getElementById('register-modal');
  const closeModal = document.getElementById('close-modal');
  const registerForm = document.getElementById('register-form');
  const formError = document.getElementById('form-error');
  const logoutBtn = document.querySelector('.logout-btn');
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '../../login/login.html';
    return;
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../../login/login.html';
  });

  async function fetchReadingRooms() {
    try {
      const response = await axios.get(`${BASE_URL}/listMyReadingRooms`, {
        headers: { authorization: token },
      });
      const { success, readingRooms } = response.data;
      if (!success || !readingRooms || readingRooms.length === 0) {
        noRooms.innerHTML = '<p>You don’t have any reading rooms yet. Register one to get started!</p>';
        noRooms.classList.add('show');
        roomsList.style.display = 'none';
        return;
      }
      noRooms.style.display = 'none';
      roomsList.style.display = 'grid';
      displayReadingRooms(readingRooms);
    } catch (error) {
      if (error.response?.status === 404) {
        noRooms.innerHTML = `<p>You don't have a reading room, register now!</p>`;
      } else {
        noRooms.innerHTML = `<p>Error fetching reading rooms. Please try again.</p>`;
      }
      noRooms.classList.add('show');
      roomsList.style.display = 'none';
      console.error('Error fetching reading rooms:', error);
    }
  }

  // Display reading rooms
  function displayReadingRooms(readingRooms) {
    roomsList.innerHTML = '';
    readingRooms.forEach(room => {
      const roomCard = document.createElement('div');
      roomCard.classList.add('room-card');
      roomCard.innerHTML = `
        <h3>${room.readingRoomName || 'Reading Room'}</h3>
        <button class="dashboard-btn" data-room-id="${room._id}">View Dashboard</button>
      `;
      roomsList.appendChild(roomCard);
    });

    // Add event listeners to dashboard buttons
    document.querySelectorAll('.dashboard-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const roomId = btn.getAttribute('data-room-id');
        window.location.href = `../../dashboard/dashboard.html?roomId=${roomId}`;
      });
    });
  }

  registerBtn.addEventListener('click', () => {
    registerModal.classList.add('show');
  });

  closeModal.addEventListener('click', () => {
    registerModal.classList.remove('show');
    registerForm.reset();
    formError.textContent = '';
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.textContent = '';

    const formData = new FormData();

    const readingRoomName = registerForm.readingRoomName.value.trim();
    const address = registerForm.address.value.trim();
    const city = registerForm.city.value.trim();
    const contact = registerForm.contact.value.trim();
    const totalSeats = registerForm.totalSeats.value.trim();
    const openTime = registerForm.openTime.value.trim();
    const closeTime = registerForm.closeTime.value.trim();
    const monthlyFee = registerForm.monthlyFee.value.trim();
    const threeMonthsFee = registerForm.threeMonthsFee.value.trim();
    const facilitiesRaw = registerForm.facilities.value.trim();
    const photo = registerForm.photo.files[0]; 

    if (
      !readingRoomName ||
      !address ||
      !city ||
      !contact ||
      !totalSeats ||
      !openTime ||
      !closeTime ||
      !monthlyFee ||
      !threeMonthsFee ||
      !facilitiesRaw ||
      !photo
    ) {
      formError.textContent = 'Please fill all required fields, including a photo.';
      return;
    }

    
    const facilities = facilitiesRaw
      ? facilitiesRaw.split(',').map((f) => f.trim()).filter((f) => f)
      : [];
    if (facilities.length === 0) {
      formError.textContent = 'Please provide at least one facility.';
      return;
    }


    let coordinates = [0, 0]; 
    try {
      coordinates = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            if (longitude === 0 && latitude === 0) {
              resolve([0, 0]); 
            } else {
              resolve([longitude, latitude]);
            }
          },
          () => resolve([81.1943097, 26.9193418]) 
        );
      });
    } catch (err) {
      console.error('Geolocation error:', err);
      coordinates = [0,0]; 
    }

    formData.append('readingRoomName', readingRoomName);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('contact', contact);
    formData.append('totalSeats', totalSeats);
    formData.append('timings', JSON.stringify({ open: openTime, close: closeTime }));
    formData.append('fees', JSON.stringify({ monthly: monthlyFee, threeMonths: threeMonthsFee }));
    facilities.forEach((facility, index) => {
      formData.append(`facilities[${index}]`, facility); 
    });
    formData.append('photo', photo); 
    formData.append('location', JSON.stringify({ type: 'Point', coordinates }));


    try {
            formError.textContent ='wait for few seconds';
      const response = await axios.post(`${BASE_URL}/registerReadingRoom`, formData, {
        headers: {
          authorization: token,
          'Content-Type': 'multipart/form-data',
        },
      });
      const { success, readingRoom, message } = response.data;
      if (success) {
        formError.textContent = 'Registration successful! Please wait...';
    registerModal.classList.remove('show');
    registerForm.reset();
    formError.textContent = '';
    fetchReadingRooms();
      } else {
        formError.textContent = message || 'Registration failed. Please try again.';
      }
    } catch (error) {
      formError.textContent =
        error.response?.data?.error || 'Error registering reading room. Please try again.';
      console.error('Error registering reading room:', error);
    }
  });


  fetchReadingRooms();
});