import { ListingComment } from "../listingComment/listingComment.schema.js";
import { ListingCommentReply } from "./listingCommentReply.schema.js";
import { User } from "../auth/user.schema.js";
import { PropertyProvider } from "../propertyProvider/propertyProvider.schema.js";
import { Validator } from "../../lib/validator.js";
import { createListingCommentReplyRequest } from "./create-listingCommentReply.request.js";
import { asyncHandler } from "../../lib/util.js";
import {
    ValidationError,
    NotFoundError,
    UnauthenticatedError,
} from "../../lib/error-definitions.js";
import { createNotification } from "../notifications/notification.service.js";

export const createListingCommentReply = asyncHandler(async (req, res) => {

    const { id } = req.params; // comment id

    if (!req.user && !req.propertyProvider) {
        throw new UnauthenticatedError("Authentication required.");
    }

    const validator = new Validator();

    const { value, errors } = validator.validate(
        createListingCommentReplyRequest,
        req.body
    );

    if (errors) {
        throw new ValidationError(
            "Validation failed.",
            errors
        );
    }

    const comment = await ListingComment.findById(id);

    if (!comment) {
        throw new NotFoundError("Comment not found.");
    }

    let authorId;
    let authorModel;
    let username;

    if (req.user?.role === "propertyProvider") {

        const owner = await PropertyProvider.findById(req.user.id)
            .select("username");

        if (!owner) {
            throw new NotFoundError("property provider not found.");
        }

        authorId = owner._id;
        authorModel = "PropertyProvider";
        username = owner.username;

    } else if (req.user) {

        const user = await User.findById(req.user.id)
            .select("username");

        if (!user) {
            throw new NotFoundError("User not found.");
        }

        authorId = user._id;
        authorModel = "User";
        username = user.username;

    } else {

        const owner = await PropertyProvider.findById(req.propertyProvider.id)
            .select("username");

        if (!owner) {
            throw new NotFoundError("property provider not found.");
        }

        authorId = owner._id;
        authorModel = "PropertyProvider";
        username = owner.username;
    }

    const reply = await ListingCommentReply.create({

        comment: comment._id,

        listing: comment.listing,

        author: authorId,

        authorModel,

        username,

        reply: value.reply,
    });

    await ListingComment.updateOne(
        {
            _id: comment._id,
        },
        {
            $inc: {
                replyCount: 1,
            },
        }
    );

    //dont notify someone when they reply to their own comment 
    const isOwnComment = comment.author.toString() == authorId.toString() && comment.authorModel === authorModel;

    if (!isOwnComment) {
        await createNotification({
            //the original comment author recieves the notification
            recipient: comment.author,

            //user or propertyprovider
            recipientModel: comment.authorModel,

            senderModel: authorModel,

            type: "COMMENT_REPLIED",
            entityId: comment._id,
            entityModel: "ListingComment",
            message: `${username} replied to your comment.`,
        });
    }

    return res.status(201).json({

        success: true,

        message: "Reply added successfully.",

        data: {
            reply,
        },
    });
});


export const deleteListingCommentReply = asyncHandler(async (req, res) => {
    const { id } = req.params; // Reply ID

    // Authentication
    if (!req.user && !req.propertyProvider) {
        throw new UnauthenticatedError("Authentication required.");
    }

    // Find reply
    const reply = await ListingCommentReply.findById(id);

    if (!reply) {
        throw new NotFoundError("Reply not found.");
    }

    // Determine authenticated account
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

    // Ensure only the reply owner can delete it
    if (
        reply.author.toString() !== accountId ||
        reply.authorModel !== accountModel
    ) {
        throw new UnauthenticatedError(
            "You are not authorized to delete this reply."
        );
    }

    // Delete reply
    await ListingCommentReply.findByIdAndDelete(reply._id);

    // Decrement reply count
    await ListingComment.updateOne(
        {
            _id: reply.comment,
            replyCount: { $gt: 0 },
        },
        {
            $inc: {
                replyCount: -1,
            },
        }
    );

    return res.status(200).json({
        success: true,
        message: "Reply deleted successfully.",
    });
});