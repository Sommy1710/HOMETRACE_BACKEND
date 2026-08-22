import { ListingComment } from "./listingComment.schema.js";
import { Listing } from "../listing/listing.schema.js";
import { Validator } from "../../lib/validator.js";
import { createListingCommentRequest } from "./create-listingComment.request.js";
import { User } from "../auth/user.schema.js";
import {PropertyProvider} from '../propertyProvider/propertyProvider.schema.js';
import { asyncHandler } from "../../lib/util.js";
import {
    ValidationError,
    NotFoundError,
    UnauthenticatedError,
} from "../../lib/error-definitions.js";
import {createNotification} from "../notifications/notification.service.js";

export const createListingComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Authentication
    if (!req.user && !req.propertyProvider) {
        throw new UnauthenticatedError("Authentication required.");
    }

    // Validate request body
    const validator = new Validator();

    const { value, errors } = validator.validate(
        createListingCommentRequest,
        req.body
    );

    if (errors) {
        throw new ValidationError(
            "The request failed with the following errors.",
            errors
        );
    }

    // Ensure the post exists
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new NotFoundError("listing not found.");
    }

    // Determine commenter
    let authorId;
    let authorModel;
    let username;

if (req.user?.role === "propertyProvider") {
    const owner = await PropertyProvider.findById(req.user.id).select("username");

    if (!owner) {
        throw new NotFoundError("property Provider not found.");
    }

    authorId = owner._id;
    authorModel = "PropertyProvider";
    username = owner.username;

} else if (req.user) {
    const user = await User.findById(req.user.id).select("username");

    if (!user) {
        throw new NotFoundError("User not found.");
    }

    authorId = user._id;
    authorModel = "User";
    username = user.username;

} else if (req.propertyProvider) {
    const owner = await PropertyProvider.findById(req.propertyProvider.id).select("username");

    if (!owner) {
        throw new NotFoundError("property provider not found.");
    }

    authorId = owner._id;
    authorModel = "PropertyProvider";
    username = owner.username;
} 
    

    // Create comment
    const comment = await ListingComment.create({
        listing: id,
        author: authorId,
        authorModel,
        username,
        comment: value.comment,
    });

    // Increment comment count
    await Listing.updateOne(
        { _id: id },
        {
            $inc: {
                commentCount: 1,
            },
        }
    );

    //create notification
    //dont notify the property provider if they comment on their own listing
    if (
        listing.author.toString() !== authorId.toString()
    ) {
        await createNotification({
            //owner of the listing
            recipient: listing.author,
            recipientModel: "PropertyProvider",
            sender: authorId,
            senderModel: authorModel,
            type: "COMMENTED_ON_LISTING",
            entityId: listing._id,
            entityModel: "Listing",
            message: `${username} commented on your listing.`
        })
    }

    return res.status(201).json({
        success: true,
        message: "Comment added successfully.",
        data: {
            comment,
        },
    });
});

export const deleteListingComment = asyncHandler(async (req, res) => {
    const {id} = req.params;

    //authentication
    if (!req.user && !req.propertyProvider) {
        throw new UnauthenticatedError("Authentication required.");
    }

    //find the comment
    const comment = await ListingComment.findById(id);

    if (!comment) {
        throw new NotFoundError("Comment not found.");
    }

    //determine authenticated account
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

    //ensure only the comment owner can delete it 
    if (
        comment.author.toString() !== accountId || 
        comment.authorModel !== accountModel
    ) {
        throw new UnauthenticatedError(
            "You are not authorized to delete this comment."
        );
    }

    //delete the comment
    await ListingComment.findByIdAndDelete(id);
    //decrement the comment count
    await Listing.updateOne(
        {
            _id: comment.listing,
            commentCount: {$gt: 0},
        },
        {
            $inc: {
                commentCount: -1,
            }
        }
    );

    return res.status(200).json({
        success: true,
        message: "Comment deleted successfully.",
    });
});