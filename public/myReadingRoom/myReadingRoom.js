document.addEventListener('DOMContentLoaded', () => {
  const roomTitle = document.getElementById('room-title');
  const roomPhoto = document.getElementById('room-photo');
  const roomInfo = document.getElementById('room-info');
  const seatInfo = document.getElementById('seat-info');
  const feeStatus = document.getElementById('fee-status');
  const notEnrolled = document.getElementById('not-enrolled');
  const roomContent = document.getElementById('room-content');
  const logoutBtn = document.querySelector('.logout-btn');
  const token = localStorage.getItem('token');

  
  if (!token) {
    window.location.href = '/login';
    return;
  }

    logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login/login.html'; 
  });

  
  async function fetchReadingRoom() {
    try {
      const response = await axios.get(`${BASE_URL}/student/myReadingRoom`, {
        headers: { authorization: token },
      });
      console.log(response);
      const { success, seat } = response.data;
      if (!success) {
        notEnrolled.innerHTML = '<p>You are not enrolled in any reading room!</p>';
        notEnrolled.classList.add('show');
        roomTitle.style.display = 'none';
        roomContent.style.display = 'none';
        return;
      }
      notEnrolled.style.display = 'none';
      roomTitle.style.display = 'block';
      roomContent.style.display = 'flex';
      displayReadingRoom(seat);
    } catch (error) {
      console.log(error);
      if(error.response.status===400){
      notEnrolled.innerHTML = `<p>You are not enrolled in any Reading Room</p>`;}
      else{
         notEnrolled.innerHTML = `<p>Error occurred</p>`;
      }
      notEnrolled.classList.add('show');
      roomTitle.style.display = 'none';
      roomContent.style.display = 'none';
    }
  }

  
  function displayReadingRoom(seat) {
    const room = seat.readingRoomId;
  
    roomTitle.textContent = room.readingRoomName || 'Reading Room';

  
    roomPhoto.src = room.photos?.[0] || '../../image/img1.jpg';
    roomPhoto.alt = room.readingRoomName || 'Reading Room';

  
    roomInfo.innerHTML = `
      <p><i class="fas fa-map-marker-alt"></i> ${room.address || 'N/A'}</p>
      <p><i class="fas fa-city"></i> ${room.city || 'N/A'}</p>
      <p><i class="fas fa-users"></i> Capacity: ${room.totalSeats || 'N/A'}</p>
      <p><i class="fas fa-chair"></i> Vacant Seats: ${room.vacantSeats || 'N/A'}</p>
      <p><i class="fas fa-clock"></i> Open: ${room.timings?.open || 'N/A'} - Close: ${room.timings?.close || 'N/A'}</p>
      <p><i class="fas fa-phone"></i> Contact: ${room.contact || 'N/A'}</p>
      <p><i class="fas fa-rupee-sign"></i> Fees: 
        Monthly - ${room.fees?.monthly ? '₹' + room.fees.monthly : 'N/A'}, 
        3 Months - ${room.fees?.threeMonths ? '₹' + room.fees.threeMonths : 'N/A'}
      </p>
      <p><i class="fas fa-tools"></i> Facilities: ${room.facilities?.length ? room.facilities.join(', ') : 'N/A'}</p>
    `;

  
    seatInfo.innerHTML = `
      <p><i class="fas fa-chair"></i> Seat Number: ${seat.seatNumber || 'N/A'}</p>
      <p><i class="fas fa-rupee-sign"></i> Fee Plan: ${seat.plan || 'N/A'}</p>
      <p><i class="fas fa-money-bill"></i> Fee Amount: ${seat.feeAmount ? '₹' + seat.feeAmount : 'N/A'}</p>
      <p><i class="fas fa-calendar-alt"></i> Payment Date: ${seat.feePaymentDate ? new Date(seat.feePaymentDate).toLocaleDateString() : 'N/A'}</p>
      <p><i class="fas fa-calendar-alt"></i> Next Due Date: ${seat.nextDueDate ? new Date(seat.nextDueDate).toLocaleDateString() : 'N/A'}</p>
    `;

  
    const today = new Date('2025-07-13');
    const dueDate = seat.nextDueDate ? new Date(seat.nextDueDate) : null;
    if (dueDate && dueDate <= today) {
      feeStatus.innerHTML = '<p>Fees Pending!</p>';
    } else {
      feeStatus.style.display = 'none';
    }
  }

  
  fetchReadingRoom();
});