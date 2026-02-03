import { ValidationError } from "../../lib/error-definitions.js";
import {Validator} from "../../lib/validator.js";
import { Message } from "./message.schema.js";
import { sendMessageRequest } from "./send.messaage.request.js";
import {v2 as cloudinary} from 'cloudinary';
import { Readable } from "stream";
import {User} from "../auth/user.schema.js";
import mongoose from "mongoose";

export const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Ensure the authenticated user matches the requested userId
    if (!req.user || req.user.id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these messages"
      });
    }

    // Fetch messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
      .populate({
        path: 'sender',
        select: 'username'
      })
      .populate({
        path: 'receiver',
        select: 'username'
      })
      .sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      data: messages
    });

  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    // ✅ Ensure body exists (multipart safety)
    req.body = req.body || {};

    // ✅ Auth check
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const senderId = req.user.id;

    // ✅ Extract uploaded photos correctly (fields())
    const uploadedPhotos = req.files?.photos || [];
    const photoUrls = [];

    // Helper: buffer → stream
    const bufferToStream = (buffer) => {
      const readable = new Readable();
      readable._read = () => {};
      readable.push(buffer);
      readable.push(null);
      return readable;
    };

    // Upload photos to Cloudinary
    for (const file of uploadedPhotos) {
      const imageUrl = await new Promise((resolve, reject) => {
        bufferToStream(file.buffer).pipe(
          cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (err, result) => {
              if (err) return reject(err);
              resolve(result.secure_url);
            }
          )
        );
      });

      photoUrls.push(imageUrl);
    }

    // Attach photos to body for Joi
    if (photoUrls.length > 0) {
      req.body.photos = photoUrls;
    }

    // ✅ Joi validation
    const validator = new Validator();
    const { error, value } = validator.validate(sendMessageRequest, req.body);

    if (error) {
      throw new ValidationError(
        "The request failed with the following errors",
        error
      );
    }

    // ✅ Prevent self-messaging
    if (value.receiver === senderId) {
      throw new ValidationError("You cannot send a message to yourself");
    }

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(value.receiver)) {
      throw new ValidationError("Receiver ID is not valid");
    }

    // ✅ Ensure receiver exists
    const receiverExists = await User.exists({ _id: value.receiver });
    if (!receiverExists) {
      throw new ValidationError("Receiver does not exist");
    }

    // ✅ Create message
    const message = await Message.create({
      sender: senderId,
      receiver: value.receiver,
      content: value.content,
      photos: value.photos || [],
    });

    // ✅ Populate response
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username")
      .populate("receiver", "username");

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (err) {
    next(err);
  }
};