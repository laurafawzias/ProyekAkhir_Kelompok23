const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

let users = { admin: 'admin123' };
const csrfTokens = new Map();

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory: ${uploadsDir}`);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: 'very_secret_key_123',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      maxAge: 1000 * 60 * 15,
      httpOnly: true,
      secure: false,
      sameSite: 'strict'
    }
  })
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const uniqueFilename = `${nameWithoutExt}-${timestamp}${ext}`;
    cb(null, uniqueFilename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Only JPEG, PNG, and PDF files are permitted. Received: ${file.mimetype}`), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

function generateCSRFToken(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

function validateCSRFToken(req, res, next) {
  const tokenFromSession = req.session.csrfToken;
  const tokenFromForm = req.body._csrf;

  if (!tokenFromSession || !tokenFromForm || tokenFromSession !== tokenFromForm) {
    return res.status(403).render('error', { 
      message: 'CSRF Token Invalid! Request rejected.' 
    });
  }
  next();
}

app.use(generateCSRFToken);

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (users[username] && users[username] === password) {
    req.session.userId = username;
    res.redirect('/dashboard');
  } else {
    res.render('login', { error: 'Invalid username or password' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/login');
  });
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', { username: req.session.userId });
});

app.get('/upload', isAuthenticated, (req, res) => {
  const uploadedFiles = fs.readdirSync(uploadsDir).map(filename => ({
    name: filename,
    url: `/uploads/${filename}`
  }));
  
  res.render('upload', { 
    message: null, 
    uploadedFile: null, 
    username: req.session.userId,
    uploadedFiles: uploadedFiles
  });
});

app.post('/upload', isAuthenticated, (req, res) => {
  upload.single('file')(req, res, function(err) {
    const uploadedFiles = fs.readdirSync(uploadsDir).map(filename => ({
      name: filename,
      url: `/uploads/${filename}`
    }));

    if (err) {
      return res.render('upload', {
        message: { type: 'error', text: err.message },
        uploadedFile: null,
        username: req.session.userId,
        uploadedFiles: uploadedFiles
      });
    }

    if (!req.file) {
      return res.render('upload', {
        message: { type: 'error', text: 'No file selected!' },
        uploadedFile: null,
        username: req.session.userId,
        uploadedFiles: uploadedFiles
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.render('upload', {
      message: {
        type: 'success',
        text: 'File uploaded successfully!'
      },
      uploadedFile: {
        name: req.file.filename,
        url: fileUrl
      },
      username: req.session.userId,
      uploadedFiles: uploadedFiles
    });
  });
});

app.get('/change-password', isAuthenticated, (req, res) => {
  res.render('change-password', { 
    message: null, 
    username: req.session.userId,
    csrfToken: res.locals.csrfToken
  });
});

app.post('/change-password', isAuthenticated, validateCSRFToken, (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword) {
    return res.render('change-password', {
      message: {
        type: 'error',
        text: 'Current password is required!'
      },
      username: req.session.userId,
      csrfToken: res.locals.csrfToken
    });
  }

  if (users[req.session.userId] !== currentPassword) {
    return res.render('change-password', {
      message: {
        type: 'error',
        text: 'Current password is incorrect!'
      },
      username: req.session.userId,
      csrfToken: res.locals.csrfToken
    });
  }

  if (!newPassword || !confirmPassword) {
    return res.render('change-password', {
      message: {
        type: 'error',
        text: 'New password and confirmation are required!'
      },
      username: req.session.userId,
      csrfToken: res.locals.csrfToken
    });
  }

  if (newPassword !== confirmPassword) {
    return res.render('change-password', {
      message: {
        type: 'error',
        text: 'New passwords do not match!'
      },
      username: req.session.userId,
      csrfToken: res.locals.csrfToken
    });
  }

  if (currentPassword === newPassword) {
    return res.render('change-password', {
      message: {
        type: 'error',
        text: 'New password must be different from current password!'
      },
      username: req.session.userId,
      csrfToken: res.locals.csrfToken
    });
  }

  users[req.session.userId] = newPassword;

  res.render('change-password', {
    message: {
      type: 'success',
      text: 'Password changed successfully!'
    },
    username: req.session.userId,
    csrfToken: res.locals.csrfToken
  });
});

app.listen(PORT, () => {
  console.log(`Application running on: http://localhost:${PORT}`);
  console.log(`Demo credentials: admin / admin123`);
});
