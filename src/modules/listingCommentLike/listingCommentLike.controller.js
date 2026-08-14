import { ListingComment } from "../listingComment/listingComment.schema.js";
import { ListingCommentLike } from "./listingCommentLike.schema.js";
import { asyncHandler } from "../../lib/util.js";
import {
    NotFoundError,
    UnauthenticatedError,
} from "../../lib/error-definitions.js";

export const toggleLikeListingComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

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

    const comment = await ListingComment.findById(id);

    if (!comment) {
        throw new NotFoundError("Comment not found.");
    }

    const existingLike = await ListingCommentLike.findOne({
        comment: id,
        user: accountId,
        userModel: accountModel,
    });

    // Unlike
    if (existingLike) {
        await ListingCommentLike.deleteOne({
            _id: existingLike._id,
        });

        comment.commentLikeCount = Math.max(
            comment.commentLikeCount - 1,
            0
        );

        await comment.save();

        return res.status(200).json({
            success: true,
            message: "Comment unliked successfully.",
            liked: false,
            likeCount: comment.commentLikeCount,
        });
    }

    // Like
    await ListingCommentLike.create({
        comment: id,
        user: accountId,
        userModel: accountModel,
    });

    comment.commentLikeCount += 1;

    await comment.save();

    return res.status(200).json({
        success: true,
        message: "Comment liked successfully.",
        liked: true,
        likeCount: comment.commentLikeCount,
    });
});