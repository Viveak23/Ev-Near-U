// Static Demo Fallback for GitHub Pages and Offline Preview
export const DEMO_USERS = {
  host: {
    _id: 'usr_host_rajesh_01',
    name: 'Rajesh Sharma',
    email: 'rajesh.host@evnearu.com',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    isHostVerified: true,
    vehicles: [
      {
        _id: 'veh_01',
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
  },
  driver: {
    _id: 'usr_driver_vikram_01',
    name: 'Vikram Mehta',
    email: 'vikram.seeker@evnearu.com',
    phone: '+91 91234 56789',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    isHostVerified: false,
    vehicles: [
      {
        _id: 'veh_02',
        make: 'Hyundai',
        model: 'Ioniq 5 Long Range RWD',
        year: 2024,
        batteryCapacityKWh: 72.6,
        connectorType: 'CCS2',
        licensePlate: 'KA 01 EV 7788',
        isPrimary: true
      }
    ]
  }
};

export const DEMO_CHARGERS = [
  {
    _id: 'chg_01',
    title: 'GreenPoint Level 2 Fast AC Charger (11 kW)',
    description: 'Dedicated solar-powered EV bay in a secure gated independent villa. High-speed 11 kW Type 2 / CCS2 compatibility with covered parking, CCTV monitoring, and complimentary high-speed Wi-Fi.',
    chargerType: 'Level 2 AC (Fast)',
    connectorType: 'CCS2',
    chargingMethod: 'AC',
    powerKW: 11,
    supportedVehicles: ['Tata Nexon EV', 'MG ZS EV', 'Mahindra XUV400', 'Hyundai Ioniq 5', 'BYD Atto 3', 'Kia EV6'],
    approximateArea: 'Near Sony World Junction, Koramangala, Bengaluru',
    address: {
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
      landmark: 'Near Sony World Junction'
    },
    location: {
      type: 'Point',
      coordinates: [77.6245, 12.9345]
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
    status: 'Active',
    ratingAverage: 4.9,
    ratingCount: 38,
    host: {
      _id: 'usr_host_rajesh_01',
      name: 'Rajesh Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isHostVerified: true
    }
  },
  {
    _id: 'chg_02',
    title: 'VoltHaven Ultra DC Fast Hub (50 kW)',
    description: 'Commercial-grade DC fast charging spot at Indiranagar 100ft road. Pull up, plug in, and charge up to 80% in 45 minutes.',
    chargerType: 'DC Fast Charger (50+ kW)',
    connectorType: 'CCS2',
    chargingMethod: 'DC',
    powerKW: 50,
    supportedVehicles: ['All CCS2 Compatible EVs', 'Tata Tiago EV', 'Tata Punch EV', 'Kia EV6', 'Audi e-tron'],
    approximateArea: '100 Feet Road, Indiranagar, Bengaluru',
    address: {
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      landmark: 'Opposite Starbucks'
    },
    location: {
      type: 'Point',
      coordinates: [77.6413, 12.9784]
    },
    images: [
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80'
    ],
    pricing: {
      pricePerKWh: 21.0,
      pricePerHour: 0,
      timeFeeEnabled: false,
      currency: 'INR'
    },
    status: 'Active',
    ratingAverage: 4.8,
    ratingCount: 54,
    host: {
      _id: 'usr_host_priya_02',
      name: 'Priya Patel',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      isHostVerified: true
    }
  },
  {
    _id: 'chg_03',
    title: 'HSR EcoCharge 7.4 kW Home Station',
    description: 'Quiet residential porch charger in HSR Sector 2. Perfect for overnight or relaxed daytime charging while at local cafes.',
    chargerType: 'Level 2 AC (Fast)',
    connectorType: 'Type 2 AC',
    chargingMethod: 'AC',
    powerKW: 7.4,
    supportedVehicles: ['Tata Nexon EV', 'Mahindra XUV400', 'MG Comet EV', 'Ola Electric Scooter (via adapter)'],
    approximateArea: 'Sector 2, HSR Layout, Bengaluru',
    address: {
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560102',
      landmark: 'Near 27th Main Park'
    },
    location: {
      type: 'Point',
      coordinates: [77.6476, 12.9116]
    },
    images: [
      'https://images.unsplash.com/photo-1558441719-aa34bbe5f347?auto=format&fit=crop&w=1200&q=80'
    ],
    pricing: {
      pricePerKWh: 13.0,
      pricePerHour: 15,
      timeFeeEnabled: true,
      currency: 'INR'
    },
    status: 'Active',
    ratingAverage: 5.0,
    ratingCount: 19,
    host: {
      _id: 'usr_host_rajesh_01',
      name: 'Rajesh Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isHostVerified: true
    }
  },
  {
    _id: 'chg_04',
    title: 'Whitefield TechBay Level 2 (22 kW)',
    description: 'High-amperage 22 kW 3-phase charger in ITPL / Whitefield area. Gated apartment visitor parking with easy security clearance.',
    chargerType: 'Level 2 AC (Fast)',
    connectorType: 'CCS2',
    chargingMethod: 'AC',
    powerKW: 22,
    supportedVehicles: ['All CCS2 and Type 2 compatible EVs'],
    approximateArea: 'Near ITPL Main Road, Whitefield, Bengaluru',
    address: {
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
      landmark: 'Next to ITPL Gate 3'
    },
    location: {
      type: 'Point',
      coordinates: [77.7471, 12.9863]
    },
    images: [
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80'
    ],
    pricing: {
      pricePerKWh: 16.0,
      pricePerHour: 25,
      timeFeeEnabled: true,
      currency: 'INR'
    },
    status: 'Active',
    ratingAverage: 4.7,
    ratingCount: 29,
    host: {
      _id: 'usr_host_priya_02',
      name: 'Priya Patel',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      isHostVerified: true
    }
  }
];
