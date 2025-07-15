document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('roomId');
  const logoutBtn = document.querySelector('.logout-btn');
  if (!token || !roomId) {
    window.location.href = '../login/login.html';
    return;
  }
logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../../login/login.html';
  });

  async function fetchRoomDetails() {
    try {
      const response = await axios.get(`${BASE_URL}/openReadingRoom/${roomId}`, {
        headers: { authorization: token },
      });
      const { success, readingRoom } = response.data;
      if (success) {
        document.getElementById('room-name').textContent = readingRoom.readingRoomName;
        document.getElementById('room-image').src = readingRoom.photos[0] || '../image/img1.jpg';
        document.getElementById('room-details').innerHTML = `
          <p><strong>Address:</strong> ${readingRoom.address}</p>
          <p><strong>Contact:</strong> ${readingRoom.contact}</p>
          <p><strong>Timings:</strong> Open: ${readingRoom.timings.open} Close: ${readingRoom.timings.close}</p>
          <p><strong>Fees:</strong> Monthly: ${readingRoom.fees.monthly} Three Months: ${readingRoom.fees.threeMonths}</p>
          <p><strong>City:</strong> ${readingRoom.city}</p>
        `;
        let one = 0;
        readingRoom.facilities.forEach((el) => {
          if (one === 0) {
            one++;
            document.getElementById('room-details').innerHTML += `<strong>Facilities:</strong> ${el}`;
          } else {
            document.getElementById('room-details').innerHTML += `, ${el}`;
          }
        });
 
      }
    } catch (error) {
      console.error('Error fetching room details:', error);
      alert('Error fetching room details');
    }
  }

  async function fetchVacantSeats() {
    try {
      const response = await axios.get(`${BASE_URL}/vacantSeats/${roomId}`, {
        headers: { authorization: token },
      });
      const { success, data } = response.data;
      if (success) {
        const vacantSeatsList = document.getElementById('vacant-seats-list');
        vacantSeatsList.innerHTML = '';
        data.vacantSeatsList.forEach(seat => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${seat.seatNumber}</td>
            <td><button class="btn btn-success reserve-btn" data-seat-id="${seat._id}">Reserve</button></td>
          `;
          vacantSeatsList.appendChild(row);
        });
      } else {
        alert('Failed to fetch vacant seats');
      }
    } catch (error) {
      console.error('Error fetching vacant seats:', error);
      alert('Error fetching vacant seats');
    }
  }

  async function fetchReservedSeats() {
    try {
      const response = await axios.get(`${BASE_URL}/getAllReservedSeats/${roomId}`, {
        headers: { authorization: token },
      });
      const { success, data } = response.data;
      if (success) {
        const reservedSeatsList = document.getElementById('reserved-seats-list');
        reservedSeatsList.innerHTML = '';
        data.forEach(seat => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${seat.seatNumber}</td>
            <td>${seat.studentId.name}</td>
            <td>${new Date(seat.feePaymentDate).toLocaleDateString()}</td>
            <td>${new Date(seat.nextDueDate).toLocaleDateString()}</td>
            <td><button class="btn btn-danger unreserve-btn" data-seat-id="${seat._id}">Unreserve</button></td>
          `;
          reservedSeatsList.appendChild(row);
        });
      } else {
        alert('Failed to fetch reserved seats');
      }
    } catch (error) {
      console.error('Error fetching reserved seats:', error);
      alert('Error fetching reserved seats');
    }
  }

  async function fetchPaymentPendingSeats() {
    try {
      const response = await axios.get(`${BASE_URL}/paymentPendingSeats/${roomId}`, {
        headers: { authorization: token },
      });
      const { success, data } = response.data;
      if (success) {
        const paymentPendingSeatsList = document.getElementById('payment-pending-seats-list');
        paymentPendingSeatsList.innerHTML = '';
        data.forEach(seat => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${seat.seatNumber}</td>
            <td>${seat.studentId.name}</td>
            <td>${seat.studentId.phone}</td>
            <td>${new Date(seat.nextDueDate).toLocaleDateString()}</td>
            <td><button class="btn btn-danger unreserve-btn" data-seat-id="${seat._id}">Unreserve</button></td>
          `;
          paymentPendingSeatsList.appendChild(row);
        });
      } else {
        alert('Failed to fetch payment pending seats');
      }
    } catch (error) {
      console.error('Error fetching payment pending seats:', error);
      alert('Error fetching payment pending seats');
    }
  }

  let currentSeatId = null;
  document.getElementById('vacant-seats').addEventListener('click', (e) => {
    if (e.target.classList.contains('reserve-btn')) {
      currentSeatId = e.target.getAttribute('data-seat-id');
      document.getElementById('reserve-seat-modal').classList.add('show');
    }
  });

  document.getElementById('reserve-seat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const reserveData = {
      studentPhone: document.getElementById('studentPhone').value,
      feePaymentDate: document.getElementById('feePaymentDate').value,
      feeAmount: document.getElementById('feeAmount').value,
      plan: document.getElementById('plan').value,
    };
    try {
      const response = await axios.patch(`${BASE_URL}/reserveSeat/${currentSeatId}`, reserveData, {
        headers: { authorization: token },
      });
      if (response.data.success) {
        document.getElementById('reserve-seat-modal').classList.remove('show');
        fetchVacantSeats();
        fetchReservedSeats();
        fetchPaymentPendingSeats();
      } else {
        alert(response.data.message || 'tell student to register on this platform');
      }
    } catch (error) {
        if(error.response.status===404){
         alert('tell student to register on this platform with unique phone number');
        }
        else{
                  alert('some error occourred');

        }
      console.error('Error reserving seat:', error);
    }
  });

  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('unreserve-btn')) {
      const seatId = e.target.getAttribute('data-seat-id');
      if (confirm('Are you sure you want to unreserve this seat?')) {
        try {
          const response = await axios.patch(`${BASE_URL}/unreserveSeat/${seatId}`, {}, {
            headers: { authorization: token },
          });
          if (response.data.success) {
            fetchVacantSeats();
            fetchReservedSeats();
            fetchPaymentPendingSeats();
          } else {
            alert(response.data.message || 'Failed to unreserve seat');
          }
        } catch (error) {
          console.error('Error unreserving seat:', error);
          alert('Error unreserving seat');
        }
      }
    }
  });

  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      closeBtn.closest('.modal').classList.remove('show');
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('show');
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('show'));
    }
  });

  fetchRoomDetails();
  fetchVacantSeats();
  fetchReservedSeats();
  fetchPaymentPendingSeats();
});