import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ParamSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true }, // e.g. String, Number, Object
    required: { type: Boolean, default: false },
    description: { type: String },
  },
  { _id: false }
);

const RequestSchema = new Schema(
  {
    language: { type: String, required: true }, // curl, javascript, python, php
    code: { type: String, required: true },
  },
  { _id: false }
);

const ResponseSchema = new Schema(
  {
    status: { type: Number, required: true }, // HTTP status code
    code: { type: String, required: true }, // JSON example
  },
  { _id: false }
);

const EndpointSchema = new Schema(
  {
    id: { type: String, required: true }, // e.g. "create-customer"
    title: { type: String, required: true },
    description: { type: String },
    method: {
      type: String,
      required: true,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
    url: { type: String, required: true },
    params: {
      headers: [ParamSchema],
      path: [ParamSchema],
      query: [ParamSchema],
      body: [ParamSchema],
    },
    requests: [RequestSchema],
    responses: [ResponseSchema],
  },
  { _id: false }
);

const SectionSchema = new Schema(
  {
    section: { type: String, required: true }, // e.g. "Authentication", "Customers"
    endpoints: [EndpointSchema],
  },
  { timestamps: true }
);

const ApiDoc = model('ApiDoc', SectionSchema);

export { ApiDoc, SectionSchema };