const validator = require('validator');

const validateSignupData = (req) => {
  const {
    name,
    email,
    phone,
    password,
    role,
    location,
    city
  } = req.body;
  const validRoles = ['owner', 'student'];
  if (!name || !email || !phone || !password || !role || !city) {
    throw new Error('All fields are required');
  } else if (!validator.isEmail(email)) {
    throw new Error('Invalid email format');
  } else if (!validator.isMobilePhone(phone, 'any', {
      strict: false
    })) {
    throw new Error('Invalid phone number');
  } else if (!validRoles.includes(role)) {
    throw new Error('Invalid user role');
  } else if (location) {
    if (
      location.type !== "Point" ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      throw new Error("Location must be a GeoJSON Point with coordinates [lng, lat]");
    }
  } else if (city.length < 2 || city.length > 100) {
    throw new Error('City name must be between 2 and 100 characters');
  }
};

const validateReadingRoomRegistrationData = ({
  readingRoomName,
  address,
  contact,
  totalSeats,
  timings,
  fees,
  facilities,
  location,
  city,
  user
}) => {
  if (user.role !== "owner") {
    throw new Error("Only owners can register reading rooms");
  }
  if (!readingRoomName || !address || !contact || !totalSeats || !timings || !fees || !facilities || !location || !city) {
    throw new Error("All fields are required");
  }
  if (parseInt(totalSeats) < 1) {
    throw new Error("Total seats must be at least 1");
  }
  if (!Array.isArray(facilities) || facilities.length === 0) {
    throw new Error("Facilities must be a non-empty array");
  }
  if (
    !location ||
    location.type !== "Point" ||
    !Array.isArray(location.coordinates) ||
    location.coordinates.length !== 2
  ) {
    throw new Error("Location must be a GeoJSON Point with coordinates [lng, lat]");
  }
  if (!timings || !timings.open || !timings.close) {
    throw new Error("Timings must include open and close times");
  }
};



const validateReadingRoomUpdateData = (req) => {
  const {
    totalSeats,
    timings,
    fees,
    facilities,
    photos,
    location,
    city
  } = req.body;

  if (totalSeats) {
    if (typeof totalSeats !== "number" || totalSeats < 1) {
      throw new Error("Total seats must be a number >= 1");
    }
  }

  if (timings) {
    if (!timings.open || !timings.close) {
      throw new Error("Timings must include open and close times");
    }
  }

  if (fees) {
    if (
      typeof fees.monthly !== "number" ||
      typeof fees.threeMonths !== "number"
    ) {
      throw new Error("Fees must include numeric monthly and threeMonths");
    }
  }

  if (facilities) {
    if (!Array.isArray(facilities) || facilities.length === 0) {
      throw new Error("Facilities must be a non-empty array");
    }
  }

  if (photos) {
    if (!Array.isArray(photos) || photos.length === 0) {
      throw new Error("Photos must be a non-empty array");
    }
  }

  if (location) {
    if (
      location.type !== "Point" ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      throw new Error("Location must be a GeoJSON Point with coordinates [lng, lat]");
    }
  }
  if (city) {
    if (typeof city !== "string" || city.length < 2 || city.length > 100) {
      throw new Error("City name must be a string between 2 and 100 characters");
    }
  }
};

module.exports = {
  validateReadingRoomUpdateData,
  validateReadingRoomRegistrationData,
  validateSignupData
};