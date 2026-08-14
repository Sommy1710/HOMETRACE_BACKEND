import { ListingCommentReply } from "../listingcommentReply/listingCommentReply.schema.js";
import { ListingCommentReplyLike } from "./listingCommentReplyLike.schema.js";
import { asyncHandler } from "../../lib/util.js";
import {
    NotFoundError,
    UnauthenticatedError,
} from "../../lib/error-definitions.js";

export const toggleLikeListingCommentReply = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Authentication
    if (!req.user && !req.propertyProvider) {
        throw new UnauthenticatedError("Authentication required.");
    }

    let accountId;
    let accountModel;

    if (req.user?.role === "propertyProvider") {
        accountId = req.user.id;
        accountModel = "PropertyProvider";
    } else if (req.user) {
        accountId = req.user.id;
        accountModel = "User";
    } else {
        accountId = req.propertyProvider.id;
        accountModel = "PropertyProvider";
    }

    // Ensure reply exists
    const reply = await ListingCommentReply.findById(id);

    if (!reply) {
        throw new NotFoundError("Reply not found.");
    }

    // Check if already liked
    const existingLike = await ListingCommentReplyLike.findOne({
        reply: id,
        user: accountId,
        userModel: accountModel,
    });

    // Unlike
    if (existingLike) {
        await ListingCommentReplyLike.deleteOne({
            _id: existingLike._id,
        });

        await ListingCommentReply.updateOne(
            {
                _id: id,
                replyLikeCount: { $gt: 0 },
            },
            {
                $inc: {
                    replyLikeCount: -1,
                },
            }
        );

        const updatedReply = await ListingCommentReply.findById(id)
            .select("replyLikeCount");

        return res.status(200).json({
            success: true,
            message: "Reply unliked successfully.",
            liked: false,
            likeCount: updatedReply.replyLikeCount,
        });
    }

    // Like
    await ListingCommentReplyLike.create({
        reply: id,
        user: accountId,
        userModel: accountModel,
    });

    await ListingCommentReply.updateOne(
        { _id: id },
        {
            $inc: {
                replyLikeCount: 1,
            },
        }
    );

    const updatedReply = await ListingCommentReply.findById(id)
        .select("replyLikeCount");

    return res.status(200).json({
        success: true,
        message: "Reply liked successfully.",
        liked: true,
        likeCount: updatedReply.replyLikeCount,
    });
});