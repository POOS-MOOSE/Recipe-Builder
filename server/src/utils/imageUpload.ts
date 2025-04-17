import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Create uploads directory if it doesn't exist
// Using path.resolve to get an absolute path that works across different operating systems
const uploadDir = path.resolve(__dirname, '../../uploads/imgs');
console.log('Image upload directory path:', uploadDir);

if (!fs.existsSync(uploadDir)) {
  console.log('Creating uploads directory:', uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory successfully');
} else {
  console.log('Uploads directory already exists');
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const imageId = uuidv4();
    // Save the imageId for later use in the controller
    req.imageId = imageId;
    // Get file extension
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${imageId}${ext}`);
  }
});

// Filter to accept only image files
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

// Configure multer upload
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
});

export { upload };

// Add declaration merging to extend the Express Request type
declare global {
  namespace Express {
    interface Request {
      imageId?: string;
    }
  }
}
