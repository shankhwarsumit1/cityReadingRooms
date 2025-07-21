document.addEventListener('DOMContentLoaded', () => {
  const roomTitle = document.getElementById('room-title');
  const roomPhoto = document.getElementById('room-photo');
  const roomInfo = document.getElementById('room-info');
  const ownerInfo = document.getElementById('owner-info');
  const vacantSeatsInfo = document.getElementById('vacant-seats-info');
  const modal = document.getElementById('reservation-modal');
  const closeModal = document.getElementById('close-modal');
  const reservationForm = document.getElementById('reservation-form');
  const seatIdInput = document.getElementById('seat-id');
  const studentNameInput = document.getElementById('student-name');
  const studentPhoneInput = document.getElementById('student-phone');
  const feePaymentDateInput = document.getElementById('fee-payment-date');
  const planSelect = document.getElementById('plan');
  const feeAmountInput = document.getElementById('fee-amount');
  const payNowBtn = document.getElementById('pay-now-btn');
  const token = localStorage.getItem('token');
  const logoutBtn = document.querySelector('.logout-btn');
  let readingRoomData = null;
  let seatforReservationId;
  let loggedInUser;
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
      const { success, readingRoom } = response.data;
      if (!success) {
        roomInfo.innerHTML = `<p class="error">${response.data.message || 'Error fetching reading room data'}</p>`;
        return;
      }
      readingRoomData = readingRoom;
      displayReadingRoom(readingRoom, readingRoom.ownerId);
      fetchVacantSeats();
    } catch (error) {
      console.error('Error fetching reading room:', error);
      roomInfo.innerHTML = '<p class="error">Error fetching reading room data. Please try again.</p>';
    }
  }

  async function fetchVacantSeats() {
    try {
      const response = await axios.get(`${BASE_URL}/vacantSeats/${readingRoomId}`, {
        headers: { authorization: token },
      });
      const { success } = response.data;
      const {vacantSeatsList} = response.data.data;
      if (!success) {
        vacantSeatsInfo.innerHTML = `<p class="error">${response.data.message || 'Error fetching vacant seats'}</p>`;
        return;
      }
      displayVacantSeats(vacantSeatsList);
    } catch (error) {
      console.error('Error fetching vacant seats:', error);
      vacantSeatsInfo.innerHTML = '<p class="error">Error fetching vacant seats. Please try again.</p>';
    }
  }

  async function fetchStudentProfile() {
    try {
      const response = await axios.get(`${BASE_URL}/student/profile`, {
        headers: { authorization: token },
      });
      const { success, user } = response.data;
      if (success && user) {
        studentNameInput.value = user.name || '';
        studentPhoneInput.value = user.phone || '';
        loggedInUser=user;
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      // Allow manual entry if profile fetch fails
    }
  }

  function displayReadingRoom(room, owner) {
    roomTitle.textContent = room.readingRoomName || 'Reading Room';
    if (room.photos?.length) {
     
      roomPhoto.src = room.photos[0] || '../../image/img1.jpg';
      roomPhoto.alt = room.readingRoomName || 'Reading Room';
    } else {
      roomPhoto.src = '../../image/img1.jpg';
      roomPhoto.alt = 'Reading Room';
    }

    roomInfo.innerHTML = `
      <p><i class="fas fa-map-marker-alt"></i> ${room.address || 'N/A'}</p>
      <p><i class="fas fa-city"></i> ${room.city || 'N/A'}</p>
      <p><i class="fas fa-users"></i> Capacity: ${room.totalSeats || 'N/A'}</p>
      <p><i class="fas fa-chair"></i> Vacant Seats: ${room.vacantSeats || 'N/A'}</p>
      <p><i class="fas fa-clock"></i> Open: ${room.timings?.open || 'N/A'} - Close: ${room.timings?.close || 'N/A'}</p>
      <p><i class="fas fa-phone"></i> Contact: ${room.contact || 'N/A'}</p>
      <p><i class="fas fa-rupee-sign"></i> Fees: 
        Monthly - ${room.fees?.monthly ? '₹' + room.fees.monthly : 'N/A'}, 
        Quarterly - ${room.fees?.threeMonths ? '₹' + room.fees.threeMonths : 'N/A'}
      </p>
      <p><i class="fas fa-tools"></i> Facilities: ${room.facilities?.length ? room.facilities.join(', ') : 'N/A'}</p>
    `;

    ownerInfo.innerHTML = `
      <p><i class="fas fa-user"></i> Name: ${owner.name || 'N/A'}</p>
      <p><i class="fas fa-envelope"></i> Email: ${owner.email ? `<a href="mailto:${owner.email}">${owner.email}</a>` : 'N/A'}</p>
      <p><i class="fas fa-phone"></i> Phone: ${owner.phone || 'N/A'}</p>
    `;
  }

  function displayVacantSeats(seats) {
    if (seats?.length > 0) {
      vacantSeatsInfo.innerHTML = `
        <p><i class="fas fa-chair"></i> Available Seats: ${seats.length}</p>
        <div class="seats-list">
          ${seats.map(seat => `
            <div class="seat-item">
              <span>Seat ${seat.seatNumber}</span>
              <button class="reserve-btn" data-seat-id="${seat._id}" data-seat-number="${seat.seatNumber}">Reserve</button>
            </div>
          `).join('')}
        </div>
      `;
      document.querySelectorAll('.reserve-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          seatIdInput.value = `${btn.dataset.seatNumber}`;
          seatforReservationId= `${btn.dataset.seatId}`;
          modal.style.display = 'block';
          fetchStudentProfile();
          const today = new Date().toISOString().split('T')[0];
          feePaymentDateInput.value = today;
        });
      });
    } else {
      vacantSeatsInfo.innerHTML = '<p>No vacant seats available.</p>';
    }
  }

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    reservationForm.reset();
    feeAmountInput.value = '';
    seatIdInput.value = '';
  });

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
      reservationForm.reset();
      feeAmountInput.value = '';
      seatIdInput.value = '';
    }
  });

  planSelect.addEventListener('change', () => {
    const selectedPlan = planSelect.value;
    if (readingRoomData && readingRoomData.fees) {
      if (selectedPlan === 'monthly') {
        feeAmountInput.value = readingRoomData.fees.monthly || '';
      } else if (selectedPlan === 'threeMonths') {
        feeAmountInput.value = readingRoomData.fees.threeMonths || '';
      } else {
        feeAmountInput.value = '';
      }
    }
  });

  reservationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log(planSelect.value);
    const seatId = seatforReservationId;
       const response =await axios.post(`${BASE_URL}/payment/create`,{
      readingRoomId,
      plan:planSelect.value,
      seatId,
     
    },{headers:{authorization:token}
       }
    );
     console.log(response);
    const {keyId} = response.data;
    const {amount,currency,orderId} = response.data.savedPayment;
   const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: readingRoomData.readingRoomName,
        description: 'Thanks for reserving a seat',
        order_id: orderId, 
        prefill: {
          name: loggedInUser.name,
          email: loggedInUser.email,
          contact: loggedInUser.phone
        },
        theme: {
          color: '#F37254'
        }, handler: function (response) {
    console.log("Payment Success:", response);
    window.location.href='../myReadingRoom/myReadingRoom.html';
  }
      };
    
    const rzp = new Razorpay(options);
    rzp.open();
  });


  fetchReadingRoom();
});