import type { LocationHub, PGListing } from '../types/pg';

export const BRAND_LOGO_URL =
  '/assets/aistudio/Find_My_PG_Student_Housing_Logo_5a9fb925.png';

export const TOUR_GUIDE_QR_URL =
  '/assets/aistudio/WhatsApp_Image_2026-11-22_at_12.01.59_AM_qr_abaa5575.jpeg';

export const TOUR_GUIDE_FEE_INR = 99;

export const LOCATION_HUBS: LocationHub[] = [
  {
    area: 'Law Gate',
    displayTitle: 'LPU Law Gate',
    subtitle: 'Campus Corridor · Punjab 144411',
    description:
      'Walkable student stays and apartment PGs surrounding Lovely Professional University Law Gate, Simar Enclave, and Maheru.',
    mapQuery: 'LPU Law Gate Phagwara Punjab 144411',
    image: 'https://i.ibb.co/ymXxVhZB/pg-2.png',
  },
  {
    area: 'Phagwara',
    displayTitle: 'Phagwara',
    subtitle: 'Residential Enclaves · 144401 & 144411',
    description:
      'Boys hostels and co-living PGs located across Satnampura, Sham Enclave, and Simar Enclave with direct university transit.',
    mapQuery: 'Phagwara Punjab PG Hostel',
    image:
      'https://lh3.googleusercontent.com/grass-cs/AABkmLeI_H0f92qTmxSc-bgwbxp7Y3Lf0ftijC4jIpweELErsAIJ1ki6MXZz75ER65JFZrtLz-pNIZ8FhbGdRzyigT5ZLEMYJ-EBctfHYYqOvcGTshulXtnGrZQ6eHB5oz0F9XDEdBYDOw=w408-h306-k-no',
  },
  {
    area: 'Jalandhar',
    displayTitle: 'Jalandhar',
    subtitle: 'Urban Neighbourhoods · 144001 & 144005',
    description:
      'Established paying guest stays and PG rooms in Model Town, Vijay Nagar near Football Chowk, and Garha Road.',
    mapQuery: 'Model Town Vijay Nagar Jalandhar Punjab',
    image:
      'https://lh3.googleusercontent.com/grass-cs/AABkmLeUp3pfYMOe639FdNbuufLiURT-tCYBwdPQdOaAPvHPeOZdzFgcWA_berHYjmFSBkyK62acGio9rFCOE4QEltzpchXyCG6o3p67XV9yMFBvgwSBjTMJn7DoH1IOsfUSJEbe8PUn82Ce8gAE=w408-h306-k-no',
  },
];

export const PG_LISTINGS: PGListing[] = [
  {
    id: 'pg-1',
    slug: 'phase-3-the-nest-pg',
    name: 'Phase 3, The Nest P.G.',
    area: 'Law Gate',
    areaLabel: 'Law Gate / LPU Area',
    city: 'Phagwara',
    address: 'Law Gate Road, Punjab 144411.',
    propertyType: 'PG Accommodation',
    supportedGenders: [],
    image: 'https://i.ibb.co/cKBGfNbt/pg1.png',
    featured: false,
    recentlyAdded: true,
    addedOrder: 10,
  },
  {
    id: 'pg-2',
    slug: 'dreams-pg',
    name: 'Dreams PG',
    area: 'Law Gate',
    areaLabel: 'Law Gate / LPU Area',
    city: 'Phagwara',
    address:
      'University View Estate, Plot No. 18, Near LPU Law Gate, Phagwara, Punjab 144411.',
    propertyType: 'PG Accommodation',
    supportedGenders: [],
    phone: '088474 65393',
    ratingCount: 116,
    image:
      'https://lh3.googleusercontent.com/grass-cs/AABkmLcHNIlT4bB7t4uKE1uF4-N6tUMEJOYO3WysZAYy7Fjz4-9SAQ45yfHT8nEG20CmMCrOTDtbcIArexHx379Iue1s8xiFLriC26jNajLfnGYs79b0OC4CYMJpzW9SUUgktsddqH_nvtILrFJ4=w408-h544-k-no',
    featured: true,
    recentlyAdded: false,
    addedOrder: 4,
  },
  {
    id: 'pg-3',
    slug: 'the-grand-sardar-pg',
    name: 'The Grand Sardar PG',
    area: 'Law Gate',
    areaLabel: 'Law Gate / LPU Area',
    city: 'Phagwara',
    address:
      '323, 324, Simar Enclave, Near Green Valley, LPU, Maheru, Punjab 144411.',
    propertyType: 'PG Accommodation',
    supportedGenders: [],
    phone: '080540 40890',
    ratingCount: 41,
    website: 'https://the-grand-sardar-pg.localo.site/',
    image: 'https://i.ibb.co/ymXxVhZB/pg-2.png',
    featured: true,
    recentlyAdded: false,
    addedOrder: 5,
  },
  {
    id: 'pg-4',
    slug: 'sardar-apartment',
    name: 'Sardar Apartment',
    area: 'Law Gate',
    areaLabel: 'Law Gate / LPU Area',
    city: 'Phagwara',
    address:
      '7M2W+XR, Simar Enclave, D-11, Near LPU Law Gate, Maheru, Phagwara, Punjab 144411.',
    propertyType: 'Apartment PG',
    supportedGenders: [],
    phone: '082890 02152',
    ratingCount: 76,
    website: 'https://sardar-apartments-pg.localo.site/',
    image: 'https://i.ibb.co/kgFS6DkD/pg3.png',
    featured: true,
    recentlyAdded: false,
    addedOrder: 6,
  },
  {
    id: 'pg-5',
    slug: 'satyam-pg-boys-hostel',
    name: 'Satyam PG Boys Hostel',
    area: 'Phagwara',
    areaLabel: 'Phagwara',
    city: 'Phagwara',
    address:
      'Chak Hakim, Crossing Bridge Lane, Near Guru Ravidass Gurudwara, Sham Enclave, Phagwara, Punjab 144401.',
    propertyType: 'Hostel',
    genderLabel: 'Boys',
    supportedGenders: ['Boys'],
    phone: '078890 32669',
    ratingCount: 153,
    website: 'https://satyam-pg-boys-hostel.grexa.site/',
    image:
      'https://lh3.googleusercontent.com/grass-cs/AABkmLeI_H0f92qTmxSc-bgwbxp7Y3Lf0ftijC4jIpweELErsAIJ1ki6MXZz75ER65JFZrtLz-pNIZ8FhbGdRzyigT5ZLEMYJ-EBctfHYYqOvcGTshulXtnGrZQ6eHB5oz0F9XDEdBYDOw=w408-h306-k-no',
    featured: true,
    recentlyAdded: false,
    addedOrder: 3,
  },
  {
    id: 'pg-6',
    slug: 'chawla-pg-boys-and-girls',
    name: 'Chawla PG Boys and Girls',
    area: 'Phagwara',
    areaLabel: 'Phagwara',
    city: 'Phagwara',
    address: 'Street Number 1, Satnampura, Phagwara, Punjab 144401.',
    propertyType: 'PG Accommodation',
    genderLabel: 'Co-living (Boys & Girls)',
    supportedGenders: ['Boys', 'Girls', 'Co-living'],
    phone: '098101 31734',
    ratingCount: 10,
    image:
      'https://lh3.googleusercontent.com/grass-cs/AABkmLd2GULZaQJLC_z0l_KDf7AP-dKE08JKMOQZq6ph-RNdm-p7xK20d_g97ikVyDe8boHFdNH5ZOAQvv2VSaabwTrNi30NFAcsioMrmzFXGPaafwC2PkzyN9vdpt2BJ5osDObZM66risDX6pD7=w408-h544-k-no',
    featured: false,
    recentlyAdded: true,
    addedOrder: 9,
  },
  {
    id: 'pg-7',
    slug: 'keshav-villa-pg-for-boys-and-girls',
    name: 'Keshav Villa PG for Boys and Girls',
    area: 'Phagwara',
    areaLabel: 'Phagwara',
    city: 'Phagwara',
    address:
      'SIMAR ENCLAVE, 321, Near Lovely Professional University, Phagwara, Punjab 144411.',
    propertyType: 'PG Accommodation',
    genderLabel: 'Co-living (Boys & Girls)',
    supportedGenders: ['Boys', 'Girls', 'Co-living'],
    phone: '095922 00996',
    ratingCount: 10,
    image:
      'https://lh3.googleusercontent.com/grass-cs/AABkmLdWAMSIMPa5OqBh8l75OwoPW8SLCJwl-7iubCYCE8yHYWcI_dPh2FjjViww7Y3iwwuTroRAl5hIYDECi2FdqOpW0NO23qVtCONwRGiTaMkhp7o3JIW1X_mR_MKJKUqPYs85mVdK=w408-h306-k-no',
    featured: false,
    recentlyAdded: true,
    addedOrder: 8,
  },
  {
    id: 'pg-8',
    slug: 'pg-in-jalandhar',
    name: 'PG in Jalandhar',
    area: 'Jalandhar',
    areaLabel: 'Jalandhar',
    city: 'Jalandhar',
    address:
      '432-L, Sat Kartar Nagar, Model Town, Jalandhar, Punjab 144001.',
    propertyType: 'PG Accommodation',
    supportedGenders: [],
    phone: '094170 06059',
    ratingCount: 81,
    image:
      'https://lh3.googleusercontent.com/grass-cs/AABkmLe7CjnLjHF2n2LImgSJCyR9ii4bGDI4qxVPVGJ2Z9ydXUAvRXxo60M6aSiSQBEJZ5-P8XOuwRPRLJA-pmOTkp5E915GtvO5XvGQMw-wTU0QlDmWLUjYbumAPSThnKRh0jk7EkRl5Q=w408-h408-k-no',
    featured: true,
    recentlyAdded: false,
    addedOrder: 2,
  },
  {
    id: 'pg-9',
    slug: 'radhe-radhe-pg',
    name: 'Radhe Radhe PG',
    area: 'Jalandhar',
    areaLabel: 'Jalandhar',
    city: 'Jalandhar',
    address:
      'Garha Road, Golden Avenue Phase 1, Part 1, Gurjit Nagar, Jalandhar, Punjab 144005.',
    propertyType: 'PG Accommodation',
    supportedGenders: [],
    phone: '098140 60441',
    ratingCount: 46,
    image:
      'https://lh3.googleusercontent.com/grass-cs/AABkmLd0xlA9i86D3PcvIZb16F11RuQnL8Nk6bfNPnqiymAZvJkvPFEFr4RqHWizsB2DqbJKhaLwBsM894A2Jac1VFh1OIwyPoxghaJH62VyWkN9QH5DzOT9risiQ9MzKxmnGnt87aYScNCn-NPW=w408-h544-k-no',
    featured: false,
    recentlyAdded: true,
    addedOrder: 7,
  },
  {
    id: 'pg-10',
    slug: 'gm-pg-room',
    name: 'GM PG Room',
    area: 'Jalandhar',
    areaLabel: 'Jalandhar',
    city: 'Jalandhar',
    address: 'Football Chowk, Vijay Nagar, Jalandhar, Punjab 144001.',
    propertyType: 'PG Room',
    supportedGenders: [],
    phone: '076268 78154',
    ratingCount: 134,
    website: 'https://linktr.ee/gm_pg_rooms',
    bookingForm:
      'https://docs.google.com/forms/d/e/1FAIpQLScX5-OXdMrCteWHor-zAZRPbNvnjaJURgf8htqraoMhiiU3og/viewform',
    image:
      'https://lh3.googleusercontent.com/grass-cs/AABkmLeUp3pfYMOe639FdNbuufLiURT-tCYBwdPQdOaAPvHPeOZdzFgcWA_berHYjmFSBkyK62acGio9rFCOE4QEltzpchXyCG6o3p67XV9yMFBvgwSBjTMJn7DoH1IOsfUSJEbe8PUn82Ce8gAE=w408-h306-k-no',
    featured: true,
    recentlyAdded: false,
    addedOrder: 1,
  },
];
