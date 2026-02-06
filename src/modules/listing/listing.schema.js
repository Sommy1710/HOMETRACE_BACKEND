import mongoose, {model, Schema} from 'mongoose';

/*const ListingSchema = new Schema ({
    author: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    description: {type: String, required: true},
    photos: [{type: String}],
    price: {type: Number, required: true},
    location: {type: String, required: true},
    amenities: {type: String, required: true},
    status: {
        type: String,
        enum: ['available', 'unavailable'],
        default: 'available'
    }

})*/


const ListingSchema = new Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "PropertyProvider", required: true },
  title: { type: String, required: true },
  username: {type: String, required: true},
  description: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  photos: {
    type: [String],
    required: [true, 'At least one photo is required.'],
    validate: {
      validator: function (arr) {
        return Array.isArray(arr) && arr.length > 0;
      },
      message: 'At least one photo must be uploaded.'
    }
  },
  videos: [{type: String}],
  price: { type: Number, required: true },
  location: { type: String, required: true },
  amenities: { type: String},
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  listedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'PropertyProvider', required: true },
  likes: [
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userType: { type: String, enum: ['user', 'propertyProvider'], required: true }
  }],
  views: {
    type: Number,
    default: 0
  },

  createdAt: {type: Date, default: Date.now},
}, { timestamps: true });

export const Listing = model('Listing', ListingSchema);

const ReportListingSchema = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true
    },

    reporter: {
      type: Schema.Types.ObjectId,
      required: true
    },

    reporterModel: {
      type: String,
      enum: ["User", "PropertyProvider"],
      required: true
    },

    reason: {
      type: String,
      enum: [
        "scam",
        "fake_photos",
        "misleading_info",
        "offensive_content",
        "duplicate_listing",
        "other"
      ],
      reqired: true
    },

    description: {
      type: String,
      maxlength: 500
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending"
    }
  },
  {timestamps: true}
);

//prevent same user from reporting same listing multiple times

ReportListingSchema.index(
  {listing: 1, reporter: 1, reporterModel: 1},
  {unique: true}
);

export const ReportListing = model("ReportListing", ReportListingSchema);
