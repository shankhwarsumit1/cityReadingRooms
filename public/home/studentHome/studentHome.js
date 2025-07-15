document.addEventListener('DOMContentLoaded', () => {
  const mainTitle = document.getElementById('main-title');
  const readingRoomsDiv = document.getElementById('reading-rooms');
  const paginationDiv = document.getElementById('pagination');
  const limitSelect = document.getElementById('limit');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const city = localStorage.getItem('city');
  let currentPage = 1;
  let currentLimit = parseInt(limitSelect.value) || 10;
  let currentSearch = '';

  if (!token || role !== 'student') {
    window.location.href = '../../login/login.html';
    return;
  }

  const logoutBtn = document.querySelector('.logout-btn');

  logoutBtn.addEventListener('click', () => {
    localStorage.clear(); 
    window.location.href = '../login/login.html'; 
  });
  mainTitle.textContent = `Reading Rooms in ${city || 'Your City'}`;

  async function fetchReadingRooms(page = 1, limit = currentLimit, search = currentSearch) {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      const response = await axios.get(`${BASE_URL}/allReadingRooms`, {
        params,
        headers: { authorization: token },
      });
      const { success, readingRooms, pagination } = response.data;
      if (!success) {
        readingRoomsDiv.innerHTML = '<p class="error">Error fetching reading rooms: Invalid user location</p>';
        return;
      }
      const { currentPage, hasNextPage, hasPreviousPage } = pagination;
      displayReadingRooms(readingRooms);
      displayPagination(currentPage, hasNextPage, hasPreviousPage);
    } catch (error) {
      readingRoomsDiv.innerHTML = '<p class="error">Error fetching reading rooms. Please try again.</p>';
    }
  }

  function displayReadingRooms(rooms) {
    readingRoomsDiv.innerHTML = rooms.length
      ? rooms.map(room => `
          <a href="../../readingRoomProfile/readingRoomProfile.html?id=${room._id}" class="reading-room-link">
            <div class="reading-room-card">
              <img src="${room.photos?.[0] || '../../image/img1.jpg'}" alt="${room.readingRoomName}">
              <div class="content">
                <h3>${room.readingRoomName}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${room.address}</p>
                <p><i class="fas fa-city"></i> ${room.city}</p>
                <p><i class="fas fa-users"></i> Capacity: ${room.totalSeats}</p>
                <p><i class="fas fa-clock"></i> Open: ${room.timings.open} - Close: ${room.timings.close}</p>
                <p><i class="fas fa-phone"></i> Contact: ${room.contact}</p>
                <p><i class="fas fa-chair"></i> Vacant Seats: ${room.vacantSeats}</p>
                <p><i class="fas fa-rupee-sign"></i> Fees: 
                  Monthly - ${room.fees?.monthly ? '₹' + room.fees.monthly : 'N/A'}, 
                  3 Months - ${room.fees?.threeMonths ? '₹' + room.fees.threeMonths : 'N/A'}
                </p>
                <p><i class="fas fa-tools"></i> Facilities: ${room.facilities?.length ? room.facilities.join(', ') : 'N/A'}</p>
              </div>
            </div>
          </a>
        `).join('')
      : '<p class="error">No reading rooms found.</p>';
  }

  
  function displayPagination(currentPage, hasNextPage, hasPreviousPage) {
    paginationDiv.innerHTML = '';

    
    if (hasPreviousPage) {
      const prevButton = document.createElement('button');
      prevButton.textContent = 'Previous';
      prevButton.className = 'pagination-btn';
      prevButton.addEventListener('click', () => {
        currentPage--;
        fetchReadingRooms(currentPage, currentLimit, currentSearch);
      });
      paginationDiv.appendChild(prevButton);
    }

    
    const currentPageSpan = document.createElement('span');
    currentPageSpan.textContent = `Page ${currentPage}`;
    currentPageSpan.className = 'pagination-current';
    paginationDiv.appendChild(currentPageSpan);

    
    if (hasNextPage) {
      const nextButton = document.createElement('button');
      nextButton.textContent = 'Next';
      nextButton.className = 'pagination-btn';
      nextButton.addEventListener('click', () => {
        currentPage++;
        fetchReadingRooms(currentPage, currentLimit, currentSearch);
      });
      paginationDiv.appendChild(nextButton);
    }
  }

  
  limitSelect.addEventListener('change', () => {
    currentLimit = parseInt(limitSelect.value);
    currentPage = 1; 
    fetchReadingRooms(currentPage, currentLimit, currentSearch);
  });

  
  function handleSearch() {
    currentSearch = searchInput.value.trim();
    currentPage = 1; 
    fetchReadingRooms(currentPage, currentLimit, currentSearch);
  }

  searchButton.addEventListener('click', handleSearch);

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  
  fetchReadingRooms();
});