import { ListingCommentReply } from "../listingcommentReply/listingCommentReply.schema.js";
import { ListingCommentReplyLike } from "./listingCommentReplyLike.schema.js";
import { asyncHandler } from "../../lib/util.js";
import {
    NotFoundError,
    UnauthenticatedError,
} from "../../lib/error-definitions.js";
import { createNotification } from "../notifications/notification.service.js";
import { User } from "../auth/user.schema.js";

export const toggleLikeListingCommentReply = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Authentication
    if (!req.user && !req.propertyProvider) {
        throw new UnauthenticatedError("Authentication required.");
    }

    let accountId;
    let accountModel;
    let username;

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
    
    //dont notify someone when they like their own reply
    const isOwnReply = reply.author.toString() === accountId.toString() && reply.authorModel === accountModel;

    if (!isOwnReply) {
        //get the name of the person who liked
        if (accountModel === "propertyProvider") {
            const provider = await PropertyProvider.findById(accountId)
            .select("username");
            username = provider?.username || "Someone";
        } else {
            const user = 
            await User.findById(accountId)
            .select("username");
            username = user?.username || "Someone";
        }

        await createNotification({
            recipient: reply.author,
            recipientModel: reply.authorModel,
            sender: accountId,
            senderModel: accountModel,
            type: "REPLY_LIKED",
            entityId: reply._id,
            entityModel: "ListingComment",
            message: `${username} liked your reply.`,
        });
    }

    return res.status(200).json({
        success: true,
        message: "Reply liked successfully.",
        liked: true,
        likeCount: updatedReply.replyLikeCount,
    });
});