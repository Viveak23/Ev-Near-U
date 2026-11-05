import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Charger from '../models/Charger.js';
import Booking from '../models/Booking.js';
import ChargingSession from '../models/ChargingSession.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Charger.deleteMany({}),
      Booking.deleteMany({}),
      ChargingSession.deleteMany({}),
      Payment.deleteMany({}),
      Review.deleteMany({})
    ]);

    console.log('[Seed] Creating demo users...');
    const plainPassword = 'Password123!';

    // Host 1: Rajesh Sharma (Bangalore)
    const host1 = await User.create({
      name: 'Rajesh Sharma',
      email: 'rajesh.host@evnearu.com',
      phone: '+91 98765 43210',
      password: plainPassword,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isHostVerified: true,
      vehicles: [
        {
          make: 'Tata',
          model: 'Nexon EV Empowered+',
          year: 2024,
          batteryCapacityKWh: 40.5,
          connectorType: 'CCS2',
          licensePlate: 'KA 03 EV 9901',
          isPrimary: true
        }
      ],
      payoutBankDetails: {
        accountHolder: 'Rajesh Sharma',
        bankName: 'HDFC Bank',
        accountNumberMasked: '•••• •••• 8821',
        ifscCode: 'HDFC0001234',
        upiId: 'rajesh.sharma@okaxis'
      }
    });

    // Host 2: Priya Patel (Bangalore / Indiranagar)
    const host2 = await User.create({
      name: 'Priya Patel',
      email: 'priya.host@evnearu.com',
      phone: '+91 98112 23344',
      password: plainPassword,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      isHostVerified: true,
      vehicles: [
        {
          make: 'MG',
          model: 'ZS EV Exclusive',
          year: 2023,
          batteryCapacityKWh: 50.3,
          connectorType: 'CCS2',
          licensePlate: 'KA 05 EV 4422',
          isPrimary: true
        }
      ],
      payoutBankDetails: {
        accountHolder: 'Priya Patel',
        bankName: 'ICICI Bank',
        accountNumberMasked: '•••• •••• 4129',
        ifscCode: 'ICIC0005521',
        upiId: 'priyapatel@icici'
      }
    });

    // Seeker 1: Vikram Reddy (EV Driver)
    const seeker1 = await User.create({
      name: 'Vikram Reddy',
      email: 'vikram.seeker@evnearu.com',
      phone: '+91 99887 76655',
      password: plainPassword,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      isHostVerified: false,
      vehicles: [
        {
          make: 'Hyundai',
          model: 'Ioniq 5 AWD',
          year: 2024,
          batteryCapacityKWh: 72.6,
          connectorType: 'CCS2',
          licensePlate: 'KA 01 EV 7788',
          isPrimary: true
        },
        {
          make: 'Ather',
          model: '450X Gen 3',
          year: 2023,
          batteryCapacityKWh: 3.7,
          connectorType: '16A 3-Pin',
          licensePlate: 'KA 01 EK 3300',
          isPrimary: false
        }
      ],
      savedLocations: [
        {
          label: 'Office - Koramangala',
          address: 'Koramangala 4th Block, Bengaluru',
          coordinates: [77.6271, 12.9352]
        }
      ]
    });

    console.log('[Seed] Creating demo chargers...');

    // Charger 1: High power AC Level 2 at Koramangala
    const charger1 = await Charger.create({
      host: host1._id,
      title: 'GreenPoint Level 2 Fast AC Charger (11 kW)',
      description: 'Dedicated solar-powered EV bay in a secure gated independent villa. High-speed 11 kW Type 2 / CCS2 compatibility with covered parking, CCTV monitoring, and complimentary high-speed Wi-Fi while you wait.',
      chargerType: 'Level 2 AC (Fast)',
      connectorType: 'CCS2',
      chargingMethod: 'AC',
      powerKW: 11,
      supportedVehicles: ['Tata Nexon EV', 'MG ZS EV', 'Mahindra XUV400', 'Hyundai Ioniq 5', 'BYD Atto 3', 'Kia EV6'],
      address: {
        street: '#42, 7th Main, 4th Block, Koramangala',
        landmark: 'Near Sony World Junction',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560034',
        country: 'India'
      },
      approximateArea: 'Near Sony World Junction, Koramangala, Bengaluru',
      location: {
        type: 'Point',
        coordinates: [77.6245, 12.9345] // Koramangala
      },
      images: [
        'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1558441719-aa34bbe5f347?auto=format&fit=crop&w=1200&q=80'
      ],
      pricing: {
        pricePerKWh: 14.5,
        pricePerHour: 20,
        timeFeeEnabled: true,
        currency: 'INR'
      },
      availabilitySchedule: {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        startHour: '06:00',
        endHour: '23:30',
        maxDurationHours: 6
      },
      bookingRules: 'Park straight in Bay A. Please notify host on arrival. Restroom access in clubhouse.',
      accessType: 'Public',
      status: 'Active',
      amenities: ['Covered Parking', 'CCTV Security', 'Wi-Fi', 'Restroom', 'Waiting Lounge', 'Drinking Water'],
      rating: 4.9,
      reviewCount: 18
    });

    // Charger 2: Indiranagar Fast DC Charger (30 kW)
    const charger2 = await Charger.create({
      host: host2._id,
      title: 'PowerHub 30 kW DC Fast Charger',
      description: 'Rapid DC charger for EV owners in a rush. Capable of topping up 20% to 80% in under 45 minutes for most popular Indian electric cars. Drive-in bay with automated barrier.',
      chargerType: 'DC Fast Charger',
      connectorType: 'CCS2',
      chargingMethod: 'DC',
      powerKW: 30,
      supportedVehicles: ['All CCS2 Fast Charging EVs'],
      address: {
        street: '100 Feet Road, HAL 2nd Stage, Indiranagar',
        landmark: 'Opposite Starbucks',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India'
      },
      approximateArea: 'Near 100 Feet Road, Indiranagar, Bengaluru',
      location: {
        type: 'Point',
        coordinates: [77.6412, 12.9719] // Indiranagar
      },
      images: [
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80'
      ],
      pricing: {
        pricePerKWh: 19.0,
        pricePerHour: 0,
        timeFeeEnabled: false,
        currency: 'INR'
      },
      availabilitySchedule: {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        startHour: '07:00',
        endHour: '23:00',
        maxDurationHours: 3
      },
      bookingRules: 'Maximum 90 minutes charging slot per booking to accommodate rush hour commuters.',
      accessType: 'Public',
      status: 'Active',
      amenities: ['CCTV Security', 'Nearby Cafes', 'Illuminated Bay', 'Air Compressor'],
      rating: 4.8,
      reviewCount: 24
    });

    // Charger 3: HSR Layout AC Charger (7.4 kW)
    const charger3 = await Charger.create({
      host: host1._id,
      title: 'EcoCharge Home Station (7.4 kW)',
      description: 'Quiet residential street parking with 7.4 kW Type 2 connector. Perfect for overnight or working day long charges.',
      chargerType: 'Level 2 AC (Fast)',
      connectorType: 'Type 2',
      chargingMethod: 'AC',
      powerKW: 7.4,
      supportedVehicles: ['Tata Tiago EV', 'Nexon EV', 'Comet EV', 'All Type 2 vehicles'],
      address: {
        street: '14th Main, Sector 4, HSR Layout',
        landmark: 'Near BDA Complex',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560102',
        country: 'India'
      },
      approximateArea: 'Near BDA Complex, HSR Layout, Bengaluru',
      location: {
        type: 'Point',
        coordinates: [77.6391, 12.9081] // HSR Layout
      },
      images: [
        'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80'
      ],
      pricing: {
        pricePerKWh: 12.0,
        pricePerHour: 0,
        timeFeeEnabled: false,
        currency: 'INR'
      },
      availabilitySchedule: {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        startHour: '08:00',
        endHour: '21:00',
        maxDurationHours: 8
      },
      bookingRules: 'Residential zone; please keep music off and respect neighborhood tranquility.',
      accessType: 'Public',
      status: 'Active',
      amenities: ['Covered Parking', 'Wi-Fi'],
      rating: 4.7,
      reviewCount: 9
    });

    console.log('[Seed] Creating demo bookings & charging sessions...');

    // Completed Booking 1
    const pastStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pastEnd = new Date(pastStart.getTime() + 2 * 60 * 60 * 1000);

    const bookingCompleted = await Booking.create({
      bookingId: 'EVB-DEMO1',
      user: seeker1._id,
      host: host1._id,
      charger: charger1._id,
      startTime: pastStart,
      endTime: pastEnd,
      durationHours: 2,
      estimatedKWh: 20,
      estimatedCost: {
        energyCharge: 290,
        timeCharge: 40,
        subtotal: 330,
        platformFee: 16.5,
        taxes: 62.37,
        totalEstimated: 408.87,
        currency: 'INR'
      },
      vehicle: {
        make: 'Hyundai',
        model: 'Ioniq 5',
        licensePlate: 'KA 01 EV 7788'
      },
      status: 'Completed'
    });

    // Completed Session
    const sessionCompleted = await ChargingSession.create({
      sessionId: 'EVS-DEMO1',
      booking: bookingCompleted._id,
      user: seeker1._id,
      host: host1._id,
      charger: charger1._id,
      status: 'Completed',
      startTime: pastStart,
      endTime: pastEnd,
      durationMinutes: 120,
      currentPowerKW: 0,
      energyConsumedKWh: 21.4,
      telemetrySource: 'Simulated Telemetry',
      initialSOC: 22,
      currentSOC: 85,
      targetSOC: 85,
      pricingSnapshot: {
        pricePerKWh: 14.5,
        pricePerHour: 20,
        timeFeeEnabled: true,
        platformFeePercent: 5,
        taxPercent: 18
      },
      finalBill: {
        energyCharge: 310.3,
        timeCharge: 40.0,
        subtotal: 350.3,
        platformFee: 17.52,
        taxes: 66.21,
        discounts: 0,
        finalAmount: 434.03,
        currency: 'INR'
      },
      paymentStatus: 'Paid'
    });

    // Payment for Completed Session
    const paymentCompleted = await Payment.create({
      paymentId: 'PAY-DEMO1-SUCCESS',
      invoiceNumber: 'INV-2026-004921',
      user: seeker1._id,
      host: host1._id,
      session: sessionCompleted._id,
      booking: bookingCompleted._id,
      amount: 434.03,
      currency: 'INR',
      paymentMethod: 'UPI',
      gatewayOrderId: 'order_demo_12345',
      gatewayPaymentId: 'pay_demo_success_9988',
      gatewaySignature: 'sig_demo_verified_hash',
      status: 'Success',
      hostEarnings: {
        grossAmount: 350.3,
        platformCommissionRate: 10,
        platformCommissionAmount: 35.03,
        netHostPayout: 315.27,
        payoutStatus: 'Pending'
      },
      billSnapshot: sessionCompleted.finalBill
    });

    sessionCompleted.paymentId = paymentCompleted._id;
    await sessionCompleted.save();

    // Review for Completed Session
    await Review.create({
      user: seeker1._id,
      charger: charger1._id,
      session: sessionCompleted._id,
      rating: 5,
      comment: 'Super convenient location and fast charging speed! Rajesh was very helpful showing me into the parking bay. Highly recommended for all EV owners passing through Koramangala.',
      hostResponse: 'Thank you Vikram! Glad to have you anytime.'
    });

    // Upcoming Booking for Seeker
    const upcomingStart = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const upcomingEnd = new Date(upcomingStart.getTime() + 1.5 * 60 * 60 * 1000);

    await Booking.create({
      bookingId: 'EVB-DEMO2',
      user: seeker1._id,
      host: host2._id,
      charger: charger2._id,
      startTime: upcomingStart,
      endTime: upcomingEnd,
      durationHours: 1.5,
      estimatedKWh: 35,
      estimatedCost: {
        energyCharge: 665,
        timeCharge: 0,
        subtotal: 665,
        platformFee: 33.25,
        taxes: 125.69,
        totalEstimated: 823.94,
        currency: 'INR'
      },
      vehicle: {
        make: 'Hyundai',
        model: 'Ioniq 5',
        licensePlate: 'KA 01 EV 7788'
      },
      status: 'Confirmed'
    });

    console.log('[Seed] Database seeded successfully with demo accounts:');
    console.log('--------------------------------------------------');
    console.log('Host Account:');
    console.log('  Email: rajesh.host@evnearu.com');
    console.log('  Password: Password123!');
    console.log('Seeker / Driver Account:');
    console.log('  Email: vikram.seeker@evnearu.com');
    console.log('  Password: Password123!');
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

// Run directly if invoked from CLI
if (process.argv[1]?.includes('seed.js')) {
  seedDatabase().then(() => {
    console.log('[Seed] Finished. Exiting...');
    process.exit(0);
  });
}
