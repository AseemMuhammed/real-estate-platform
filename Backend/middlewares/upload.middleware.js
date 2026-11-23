import multer from "multer";

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only image files are allowed"));
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
    },
});

export default upload;
