import Charger from '../models/Charger.js';
import Booking from '../models/Booking.js';
import ChargingSession from '../models/ChargingSession.js';

// Helper to sanitize charger address for public viewing
const sanitizeChargerForPublic = (charger, isAuthorized = false) => {
  const obj = charger.toObject ? charger.toObject() : { ...charger };
  if (!isAuthorized) {
    obj.exactAddress = null;
    obj.address = {
      city: obj.address?.city || '',
      state: obj.address?.state || '',
      country: obj.address?.country || 'India',
      landmark: obj.address?.landmark ? `Near ${obj.address.landmark}` : '',
      street: 'Full address revealed after booking confirmation'
    };
  }
  return obj;
};

// @desc    Create a new EV charger listing
// @route   POST /api/chargers
// @access  Private (Host)
export const createCharger = async (req, res, next) => {
  try {
    const {
      title,
      description,
      chargerType,
      connectorType,
      chargingMethod,
      powerKW,
      supportedVehicles,
      address,
      latitude,
      longitude,
      images,
      pricing,
      availabilitySchedule,
      bookingRules,
      accessType,
      amenities
    } = req.body;

    if (!title || !connectorType || !powerKW || !address || !latitude || !longitude || !pricing?.pricePerKWh) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields including location and pricing'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude coordinates'
      });
    }

    const approximateArea = address.landmark 
      ? `${address.landmark}, ${address.city}` 
      : `${address.city}, ${address.state}`;

    const charger = await Charger.create({
      host: req.user._id,
      title,
      description: description || '',
      chargerType: chargerType || 'Level 2 AC (Fast)',
      connectorType,
      chargingMethod: chargingMethod || 'AC',
      powerKW: Number(powerKW),
      supportedVehicles: supportedVehicles || ['All compatible electric vehicles'],
      address: {
        street: address.street,
        landmark: address.landmark || '',
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country || 'India'
      },
      approximateArea,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      images: images && images.length > 0 ? images : undefined,
      pricing: {
        pricePerKWh: Number(pricing.pricePerKWh),
        pricePerHour: Number(pricing.pricePerHour) || 0,
        timeFeeEnabled: Boolean(pricing.timeFeeEnabled),
        currency: pricing.currency || 'INR'
      },
      availabilitySchedule: availabilitySchedule || undefined,
      bookingRules: bookingRules || undefined,
      accessType: accessType || 'Public',
      status: 'Active',
      amenities: amenities || ['Covered Parking', 'Wi-Fi']
    });

    res.status(201).json({
      success: true,
      message: 'Charger listing published successfully',
      charger
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Find & Discover nearby EV Chargers with filters
// @route   GET /api/chargers/nearby
// @access  Public
export const getNearbyChargers = async (req, res, next) => {
  try {
    const {
      lat,
      lng,
      radiusKm = 50,
      powerMin,
      powerMax,
      chargingMethod,
      connectorType,
      maxPrice,
      minRating,
      availableNow,
      searchQuery
    } = req.query;

    const query = { status: 'Active' };

    // Connector type filter
    if (connectorType && connectorType !== 'All') {
      query.connectorType = connectorType;
    }

    // Charging method (AC/DC) filter
    if (chargingMethod && chargingMethod !== 'All') {
      query.chargingMethod = chargingMethod;
    }

    // Power kW filter
    if (powerMin || powerMax) {
      query.powerKW = {};
      if (powerMin) query.powerKW.$gte = Number(powerMin);
      if (powerMax) query.powerKW.$lte = Number(powerMax);
    }

    // Price per kWh filter
    if (maxPrice) {
      query['pricing.pricePerKWh'] = { $lte: Number(maxPrice) };
    }

    // Host rating filter
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Text search query (city, title, area)
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { 'address.city': { $regex: searchQuery, $options: 'i' } },
        { 'address.state': { $regex: searchQuery, $options: 'i' } },
        { approximateArea: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    let chargers = [];
    const centerLat = lat ? parseFloat(lat) : 12.9716; // default Bangalore
    const centerLng = lng ? parseFloat(lng) : 77.5946;

    if (lat && lng && !isNaN(centerLat) && !isNaN(centerLng)) {
      const maxDistanceMeters = Number(radiusKm) * 1000;

      // Use geospatial query
      chargers = await Charger.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [centerLng, centerLat]
            },
            $maxDistance: maxDistanceMeters
          }
        }
      }).populate('host', 'name avatar isHostVerified');
    } else {
      chargers = await Charger.find(query)
        .populate('host', 'name avatar isHostVerified')
        .limit(50);
    }

    // Calculate straight-line distance in km and sanitize addresses
    const results = chargers.map((charger) => {
      const sanitized = sanitizeChargerForPublic(charger, false);
      const [cLng, cLat] = charger.location.coordinates;

      // Haversine formula
      const R = 6371; // Earth radius in km
      const dLat = ((cLat - centerLat) * Math.PI) / 180;
      const dLon = ((cLng - centerLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((centerLat * Math.PI) / 180) *
          Math.cos((cLat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = Number((R * c).toFixed(1));

      return {
        ...sanitized,
        distanceKm
      };
    });

    res.json({
      success: true,
      count: results.length,
      center: { lat: centerLat, lng: centerLng },
      chargers: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single charger details
// @route   GET /api/chargers/:id
// @access  Public / Authenticated
export const getChargerById = async (req, res, next) => {
  try {
    const charger = await Charger.findById(req.params.id).populate(
      'host',
      'name avatar phone email isHostVerified createdAt'
    );

    if (!charger) {
      return res.status(404).json({ success: false, message: 'Charger not found' });
    }

    // Check if requester is authorized to view exact address:
    // Authorized if user is host OR has a confirmed/in-progress booking for this charger
    let isAuthorized = false;
    if (req.user) {
      if (charger.host._id.toString() === req.user._id.toString()) {
        isAuthorized = true;
      } else {
        const confirmedBooking = await Booking.findOne({
          charger: charger._id,
          user: req.user._id,
          status: { $in: ['Confirmed', 'In Progress'] }
        });
        if (confirmedBooking) isAuthorized = true;
      }
    }

    const sanitized = sanitizeChargerForPublic(charger, isAuthorized);

    res.json({
      success: true,
      charger: sanitized,
      isAddressRevealed: isAuthorized
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chargers hosted by logged-in user
// @route   GET /api/chargers/my-listings
// @access  Private (Host)
export const getMyChargers = async (req, res, next) => {
  try {
    const chargers = await Charger.find({ host: req.user._id }).sort('-createdAt');

    // Attach booking and earnings summaries
    const enriched = await Promise.all(
      chargers.map(async (c) => {
        const totalBookings = await Booking.countDocuments({ charger: c._id });
        const completedSessions = await ChargingSession.countDocuments({
          charger: c._id,
          status: 'Completed'
        });
        return {
          ...c.toObject(),
          totalBookings,
          completedSessions
        };
      })
    );

    res.json({
      success: true,
      count: enriched.length,
      chargers: enriched
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update charger listing
// @route   PUT /api/chargers/:id
// @access  Private (Host owner only)
export const updateCharger = async (req, res, next) => {
  try {
    let charger = await Charger.findById(req.params.id);

    if (!charger) {
      return res.status(404).json({ success: false, message: 'Charger not found' });
    }

    if (charger.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only update chargers that you own.'
      });
    }

    const {
      title,
      description,
      chargerType,
      connectorType,
      chargingMethod,
      powerKW,
      address,
      latitude,
      longitude,
      pricing,
      availabilitySchedule,
      bookingRules,
      accessType,
      status,
      amenities,
      images
    } = req.body;

    if (title) charger.title = title;
    if (description !== undefined) charger.description = description;
    if (chargerType) charger.chargerType = chargerType;
    if (connectorType) charger.connectorType = connectorType;
    if (chargingMethod) charger.chargingMethod = chargingMethod;
    if (powerKW) charger.powerKW = Number(powerKW);
    if (status) charger.status = status;
    if (bookingRules) charger.bookingRules = bookingRules;
    if (accessType) charger.accessType = accessType;
    if (amenities) charger.amenities = amenities;
    if (images && images.length > 0) charger.images = images;

    if (pricing) {
      charger.pricing = {
        ...charger.pricing,
        pricePerKWh: Number(pricing.pricePerKWh) || charger.pricing.pricePerKWh,
        pricePerHour: Number(pricing.pricePerHour) ?? charger.pricing.pricePerHour,
        timeFeeEnabled: pricing.timeFeeEnabled ?? charger.pricing.timeFeeEnabled
      };
    }

    if (availabilitySchedule) {
      charger.availabilitySchedule = {
        ...charger.availabilitySchedule,
        ...availabilitySchedule
      };
    }

    if (address) {
      charger.address = { ...charger.address, ...address };
      if (address.landmark || address.city) {
        charger.approximateArea = address.landmark 
          ? `${address.landmark}, ${address.city}` 
          : `${address.city}, ${address.state}`;
      }
    }

    if (latitude && longitude) {
      charger.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    await charger.save();

    res.json({
      success: true,
      message: 'Charger listing updated successfully',
      charger
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete charger listing
// @route   DELETE /api/chargers/:id
// @access  Private (Host owner only)
export const deleteCharger = async (req, res, next) => {
  try {
    const charger = await Charger.findById(req.params.id);

    if (!charger) {
      return res.status(404).json({ success: false, message: 'Charger not found' });
    }

    if (charger.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only delete chargers that you own.'
      });
    }

    // Check for active or upcoming bookings
    const activeBookings = await Booking.findOne({
      charger: charger._id,
      status: { $in: ['Confirmed', 'In Progress'] },
      endTime: { $gte: new Date() }
    });

    if (activeBookings) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete charger with active or upcoming bookings. Please cancel or complete them first.'
      });
    }

    await charger.deleteOne();

    res.json({
      success: true,
      message: 'Charger listing deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
