import { Listing } from "./listing.schema.js";

export const createListing = async (payload) => {
    return await Listing.create(payload);
};

export const getListings = async ({ skip = 0, limit = 20, ...filters }) => {
  return await Listing.find(filters)
    .populate({
      path: 'comments',
      select: 'content author createdAt',
      populate: {
        path: 'author',
        select: 'username'
      }
    })
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const getListing = async (id) => {
    return await Listing.findById(id)
};

export const updateListing = async (id, payload) => {
    return await Listing.findByIdAndUpdate(id, payload, {new: true});
};

export const deleteListing = async (id) => {
    return await Listing.findByIdAndDelete(id);
};