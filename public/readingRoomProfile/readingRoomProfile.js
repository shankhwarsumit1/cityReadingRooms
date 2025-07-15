document.addEventListener('DOMContentLoaded', () => {
  const roomTitle = document.getElementById('room-title');
  const roomPhoto = document.getElementById('room-photo');
  const roomInfo = document.getElementById('room-info');
  const ownerInfo = document.getElementById('owner-info');
  const token = localStorage.getItem('token');
  const logoutBtn = document.querySelector('.logout-btn');

  logoutBtn.addEventListener('click', () => {
    localStorage.clear(); 
    window.location.href = '../login/login.html';
  });

  if (!token) {
    window.location.href = '/login';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const readingRoomId = params.get('id');

  if (!readingRoomId) {
    roomInfo.innerHTML = '<p class="error">Reading Room ID is required</p>';
    return;
  }

  async function fetchReadingRoom() {
    try {
      const response = await axios.get(`${BASE_URL}/openReadingRoom/${readingRoomId}`, {
        headers: { authorization: token },
      });
      const { success, readingRoom} = response.data;
      if (!success) {
        roomInfo.innerHTML = `<p class="error">${response.data.message || 'Error fetching reading room data'}</p>`;
        return;
      } 
      displayReadingRoom(readingRoom, readingRoom.ownerId);
    } catch (error) {
      console.error('Error fetching reading room:', error);
      roomInfo.innerHTML = '<p class="error">Error fetching reading room data. Please try again.</p>';
    }
  }

  function displayReadingRoom(room, owner) {
    roomTitle.textContent = room.readingRoomName || 'Reading Room';
    if (room.photos?.length) {
      console.log(room.photos);
      roomPhoto.src = room.photos[0] || '../../image/img1.jpg';
      roomPhoto.alt = room.readingRoomName || 'Reading Room';
    } else {
      roomPhoto.src = '../../image/img1.jpg';
      roomPhoto.alt = 'Reading Room';
    }

    // Display room details
    roomInfo.innerHTML = `
      <p><i class="fas fa-map-marker-alt"></i> ${room.address || 'N/A'}</p>
      <p><i class="fas fa-city"></i> ${room.city || 'N/A'}</p>
      <p><i class="fas fa-users"></i> Capacity: ${room.totalSeats || 'N/A'}</p>
      <p><i class="fas fa-chair"></i> Vacant Seats: ${room.vacantSeats || 'N/A'}</p>
      <p><i class="fas fa-clock"></i> Open: ${room.timings.open || 'N/A'} - Close: ${room.timings.close || 'N/A'}</p>
      <p><i class="fas fa-phone"></i> Contact: ${room.contact || 'N/A'}</p>
      <p><i class="fas fa-rupee-sign"></i> Fees: 
        Monthly - ${room.fees?.monthly ? '₹' + room.fees.monthly : 'N/A'}, 
        3 Months - ${room.fees?.threeMonths ? '₹' + room.fees.threeMonths : 'N/A'}
      </p>
      <p><i class="fas fa-tools"></i> Facilities: ${room.facilities?.length ? room.facilities.join(', ') : 'N/A'}</p>
    `;

    // Display owner details
    ownerInfo.innerHTML = `
      <p><i class="fas fa-user"></i> Name: ${owner.name || 'N/A'}</p>
      <p><i class="fas fa-envelope"></i> Email: ${owner.email ? `<a href="mailto:${owner.email}">${owner.email}</a>` : 'N/A'}</p>
      <p><i class="fas fa-phone"></i> Phone: ${owner.phone || 'N/A'}</p>
    `;
  }

  // Initial fetch
  fetchReadingRoom();
});