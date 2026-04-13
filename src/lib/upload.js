import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|mp4|mov|avi|mkv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) cb(null, true);
  else cb(new Error('Only JPEG, PNG images and MP4, MOV, AVI, MKV videos are allowed.'));
};

const upload = multer({ storage, fileFilter });

export const uploadListingMedia = upload.fields([
  { name: "photos", maxCount: 10 },
  { name: "videos", maxCount: 3 }
]);

export default upload;


