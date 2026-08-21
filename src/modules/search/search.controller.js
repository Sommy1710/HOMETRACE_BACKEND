import { asyncHandler } from "../../lib/util.js";
import { ValidationError } from "../../lib/error-definitions.js";
import { User } from "../auth/user.schema.js";
import { PropertyProvider } from "../propertyProvider/propertyProvider.schema.js";
import { Listing } from "../listing/listing.schema.js";

export const globalSearch = asyncHandler(async (req, res) => {
    const query = req.query.q?.trim();

    if (!query) {
        throw new ValidationError("Search query is required.");
    }

    const limit = Math.min(Number(req.query.limit) || 10, 30);

    // Escape special regex characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(escapedQuery, "i");

    const [users, propertyProviders, listings] = await Promise.all([

        //users
        User.find({
            isDeleted: false,
            $or: [
                { username: regex },
            ],
        })
            .select("username profilePhoto")
            .limit(limit)
            .lean(),

        //property providers
        PropertyProvider.find({
            isDeleted: false,
            isBanned: false,
            $or: [
                { username: regex },
                { firstname: regex },
                { lastname: regex },
            ],
        })
            .select(
                "username firstname lastname profilePhoto bio isVerified"
            )
            .limit(limit)
            .lean(),

        //listings
        Listing.find({
            $or: [
                { title: regex },
                { description: regex },
                { amenities: regex },
                { location: regex },
                { username: regex },
                { type: regex },
            ],
        })
            .select(
                "author username title description type amenities photos videos price location geoLocation likeCount commentCount views createdAt"
            )
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean(),
    ]);

    return res.status(200).json({
        success: true,
        message: "Search completed successfully.",

        data: {
            users: {
                total: users.length,
                results: users,
            },

            propertyProviders: {
                total: propertyProviders.length,
                results: propertyProviders,
            },

            listings: {
                total: listings.length,
                results: listings,
            },
        },
    });
});