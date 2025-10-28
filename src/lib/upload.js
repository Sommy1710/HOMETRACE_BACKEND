import multer from 'multer';
import path from 'path';

// store file temporarily in memory
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('only JEPG and PNG images are allowed'));
    }
};

const upload = multer({ storage, fileFilter });

export const uploadSinglePhoto = upload.single('profilePhoto'); // For profile photo
export const uploadMultiplePhotos = upload.array('photos', 10); // For tweets and messages

export default upload;
