/*import multer from 'multer';
import path from 'path';


// store file temporarily in memory
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // ✅ Allow both images and videos
    const allowedTypes = /jpeg|jpg|png|mp4|mov|avi|mkv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG images and MP4, MOV, AVI, MKV videos are allowed.'));
    }
};

const upload = multer({ storage, fileFilter });

export const uploadSinglePhoto = upload.single('profilePhoto'); // For profile photo
export const uploadMultiplePhotos = upload.array('photos', 10); // For images
export const uploadMultipleVideos = upload.array('videos', 3); // For listing videos

export const uploadListingMedia = upload.fields([
  { name: "photos", maxCount: 10 },
  { name: "videos", maxCount: 3 }
]);

export default upload;*/

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


