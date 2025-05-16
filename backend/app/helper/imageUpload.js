const multer=require('multer')
const path = require('path');
const fs = require('fs');


// const FILE_TYPE_MAP = {
//     'image/png': 'png',
//     'image/jpeg': 'jpeg',
//     'image/jpg': 'jpg'
// };
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPG/PNG allowed'));
    }
  }
});

// const storage=multer.diskStorage({
//     destination:function(req,file,cb){
//        const isValid=FILE_TYPE_MAP[file.mimetype];
//        let uploadError=new Error('invalid image type');
//        if(isValid){
//            uploadError=null;
//        }
//        cb(uploadError,'uploads')
//     },
//     filename:function(req,file,cb){
//         const fileName=file.originalname.split(' ').join('-');
//         const extension=FILE_TYPE_MAP[file.mimetype];
//         cb(null,`${fileName}-${Date.now()}.${extension}`)
//     }
// })

// const upload = multer({ storage: storage });

module.exports = upload; 