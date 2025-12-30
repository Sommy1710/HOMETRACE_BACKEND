import Joi from "joi";

export const createListingRequest = Joi.object({
  //author: Joi.string().hex().length(24).required(), // MongoDB ObjectId
  //listedBy: Joi.string().hex().length(24).required(), // PropertyProvider ID
  
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().required(),

  type: Joi.string()
    .valid(
      // Residential
      'Self Contain (Mini Flat)',
      'Single Room',
      '1 Bedroom Flat',
      '2 Bedroom Flat',
      '3 Bedroom Flat',
      '4 Bedroom Flat',
      '5 Bedroom Flat',
      'Bungalow',
      'Duplex',
      'Detached Duplex',
      'Semi-Detached Duplex',
      'Terraced Duplex',
      'Mansion',
      'Penthouse',
      'Studio Apartment',
      'Mini Flat',
      'Maisonette',
      'Block of Flats',
      'Boys Quarters (BQ)',
      'Shared Apartment',
      'Short Let Apartment',
      'Serviced Apartment',

      // Commercial
      'Office Space',
      'Shop',
      'Warehouse',
      'Event Hall',
      'Hotel / Guest House',
      'Restaurant / Bar',
      'School / Educational Building',
      'Hospital / Clinic / Pharmacy',
      'Factory',
      'Filling Station',
      'Bank Building',
      'Commercial Complex / Plaza',

      // Land
      'Residential Land',
      'Commercial Land',
      'Industrial Land',
      'Agricultural Land',
      'Mixed-Use Land',
      'Bare Land',
      'Estate Plot',

      // Special / Luxury
      'Luxury Apartment',
      'Smart Home',
      'Beach House',
      'Farm House',
      'Villa',

      // Industrial
      'Industrial Complex',
      'Manufacturing Plant',
      'Cold Room / Storage Facility',
      'Workshop / Mechanic Village Space'
    )
    .required(),

  /*photos: Joi.array().items(Joi.string().uri()).min(1).required()
    .messages({
      "array.min": "At least one photo must be uploaded.",
      "any.required": "Photos are required."
    }),*/


  //videos: Joi.array().items(Joi.string().uri()).optional(),
  price: Joi.number().positive().required(),
  location: Joi.string().trim().required(),
  amenities: Joi.string().trim().optional(),
  
  status: Joi.string().valid('available', 'unavailable').default('available'),
});

export const updateListingRequest = Joi.object({
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),

  type: Joi.string()
    .valid(
      // Residential
      'Self Contain (Mini Flat)',
      'Single Room',
      '1 Bedroom Flat',
      '2 Bedroom Flat',
      '3 Bedroom Flat',
      '4 Bedroom Flat',
      '5 Bedroom Flat',
      'Bungalow',
      'Duplex',
      'Detached Duplex',
      'Semi-Detached Duplex',
      'Terraced Duplex',
      'Mansion',
      'Penthouse',
      'Studio Apartment',
      'Mini Flat',
      'Maisonette',
      'Block of Flats',
      'Boys Quarters (BQ)',
      'Shared Apartment',
      'Short Let Apartment',
      'Serviced Apartment',

      // Commercial
      'Office Space',
      'Shop',
      'Warehouse',
      'Event Hall',
      'Hotel / Guest House',
      'Restaurant / Bar',
      'School / Educational Building',
      'Hospital / Clinic / Pharmacy',
      'Factory',
      'Filling Station',
      'Bank Building',
      'Commercial Complex / Plaza',

      // Land
      'Residential Land',
      'Commercial Land',
      'Industrial Land',
      'Agricultural Land',
      'Mixed-Use Land',
      'Bare Land',
      'Estate Plot',

      // Special / Luxury
      'Luxury Apartment',
      'Smart Home',
      'Beach House',
      'Farm House',
      'Villa',

      // Industrial
      'Industrial Complex',
      'Manufacturing Plant',
      'Cold Room / Storage Facility',
      'Workshop / Mechanic Village Space'
    )
    .optional(),

  /*photos: Joi.array().items(Joi.string().uri()).min(1).required()
    .messages({
      "array.min": "At least one photo must be uploaded.",
      "any.required": "Photos are required."
    }),*/


  //videos: Joi.array().items(Joi.string().uri()).optional(),
  price: Joi.number().positive().optional(),
  location: Joi.string().trim().optional(),
  amenities: Joi.string().trim().optional(),
  
  status: Joi.string().valid('available', 'unavailable').default('available'),
})