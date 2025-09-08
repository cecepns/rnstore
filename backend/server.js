const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads-toko-iphone')));

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'toko_iphone'
});

// Connect to database and create tables
// db.connect((err) => {
//   if (err) {
//     console.error('Database connection failed:', err);
//     return;
//   }
//   console.log('Connected to MySQL database');
//   createTables();
// });

// Create tables function
function createTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      specifications TEXT,
      price DECIMAL(12,2) NOT NULL,
      category_id INT,
      image VARCHAR(255),
      colors JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(20) NOT NULL,
      customer_address TEXT NOT NULL,
      product_id INT NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      product_color VARCHAR(50),
      quantity INT NOT NULL DEFAULT 1,
      total_price DECIMAL(12,2) NOT NULL,
      payment_proof VARCHAR(255),
      status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      instagram VARCHAR(255),
      address TEXT,
      phone VARCHAR(20),
      email VARCHAR(255),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS banners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle TEXT,
      image_desktop VARCHAR(255),
      image_mobile VARCHAR(255),
      link_url VARCHAR(500),
      is_active BOOLEAN DEFAULT true,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  ];

  tables.forEach((sql) => {
    db.execute(sql, (err) => {
      if (err) console.error('Error creating table:', err);
    });
  });

  // Insert default admin user and settings
  const defaultPassword = bcrypt.hashSync('admin123', 10);
  db.execute(
    'INSERT IGNORE INTO admin_users (username, password) VALUES (?, ?)',
    ['admin', defaultPassword]
  );

  db.execute(
    'INSERT IGNORE INTO settings (instagram, address, phone, email) VALUES (?, ?, ?, ?)',
    ['@iphonestore_official', 'Jl. Sudirman No. 123, Jakarta Pusat', '+62 812-3456-7890', 'info@iphonestore.com']
  );

  // Insert sample categories
  const sampleCategories = [
    ['iPhone 15 Series', 'iPhone 15 terbaru dengan teknologi terdepan'],
    ['iPhone 14 Series', 'iPhone 14 dengan performa handal'],
    ['iPhone 13 Series', 'iPhone 13 dengan harga terjangkau'],
  ];
  
  sampleCategories.forEach(([name, description]) => {
    db.execute(
      'INSERT IGNORE INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
  });

  // Insert sample banners
  const sampleBanners = [
    ['iPhone 15 Pro Max', 'Dapatkan iPhone 15 Pro Max dengan teknologi terdepan', '/uploads/banner-1.webp', '/uploads/banner-1.webp', '/products', 1],
    ['iPhone 15 Series', 'Koleksi iPhone 15 terbaru dengan harga terbaik', '/uploads/banner-2.webp', '/uploads/banner-2.webp', '/products', 2],
  ];
  
  sampleBanners.forEach(([title, subtitle, image_desktop, image_mobile, link_url, sort_order]) => {
    db.execute(
      'INSERT IGNORE INTO banners (title, subtitle, image_desktop, image_mobile, link_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [title, subtitle, image_desktop, image_mobile, link_url, sort_order]
    );
  });
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads-toko-iphone'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Utility function to safely delete image files
const deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  
  try {
    // Extract filename from path (remove /uploads/ prefix)
    const filename = imagePath.replace('/uploads/', '');
    const fullPath = path.join(__dirname, 'uploads-toko-iphone', filename);
    
    // Check if file exists and delete it
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted image file: ${filename}`);
    }
  } catch (error) {
    console.error(`Error deleting image file ${imagePath}:`, error);
  }
};

// Utility function to delete multiple image files from product colors
const deleteProductImages = (colors) => {
  if (!colors) return;
  
  try {
    const colorData = typeof colors === 'string' ? JSON.parse(colors) : colors;
    colorData.forEach(color => {
      if (color.image) {
        deleteImageFile(color.image);
      }
    });
  } catch (error) {
    console.error('Error deleting product images:', error);
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    db.execute(
      'SELECT * FROM admin_users WHERE username = ?',
      [username],
      async (err, results) => {
        if (err || results.length === 0) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = results[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
        res.json({ token, user: { id: user.id, username: user.username } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Categories Routes
app.get('/api/categories', (req, res) => {
  db.execute('SELECT * FROM categories ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.post('/api/categories', authenticateToken, (req, res) => {
  const { name, description } = req.body;
  
  db.execute(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: results.insertId, name, description });
    }
  );
});

app.put('/api/categories/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  db.execute(
    'UPDATE categories SET name = ?, description = ? WHERE id = ?',
    [name, description, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Category updated successfully' });
    }
  );
});

app.delete('/api/categories/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.execute('DELETE FROM categories WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Category deleted successfully' });
  });
});

// Products Routes
app.get('/api/products', (req, res) => {
  const sql = `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    ORDER BY p.created_at DESC
  `;
  
  db.execute(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    // Parse colors JSON for each product
    const products = results.map(product => ({
      ...product,
      colors: product.colors ? JSON.parse(product.colors) : []
    }));
    
    res.json(products);
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.id = ?
  `;
  
  db.execute(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    const product = results[0];
    product.colors = product.colors ? JSON.parse(product.colors) : [];
    res.json(product);
  });
});

app.post('/api/products', authenticateToken, upload.any(), (req, res) => {
  const { name, description, specifications, price, category_id, colors } = req.body;
  
  try {
    const colorData = JSON.parse(colors);
    const files = req.files || [];
    
    // Map uploaded files to colors
    const colorsWithImages = colorData.map((color, index) => {
      const imageFile = files.find(f => f.fieldname === `color_image_${index}`);
      return {
        color: color.color,
        image: imageFile ? `/uploads/${imageFile.filename}` : null
      };
    });

    const mainImage = colorsWithImages[0]?.image || null;

    db.execute(
      'INSERT INTO products (name, description, specifications, price, category_id, image, colors) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, specifications, price, category_id, mainImage, JSON.stringify(colorsWithImages)],
      (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ id: results.insertId, message: 'Product created successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error processing product data' });
  }
});

app.put('/api/products/:id', authenticateToken, upload.any(), (req, res) => {
  const { id } = req.params;
  const { name, description, specifications, price, category_id, colors } = req.body;
  
  try {
    // First, get the existing product to preserve existing images
    db.execute('SELECT image, colors FROM products WHERE id = ?', [id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
      
      const existingProduct = results[0];
      const existingColors = existingProduct.colors ? JSON.parse(existingProduct.colors) : [];
      const files = req.files || [];
      
      // Track which images will be replaced
      const imagesToDelete = [];
      
      const colorData = JSON.parse(colors);
      
      // Map uploaded files to colors, preserving existing images
      const colorsWithImages = colorData.map((color, index) => {
        const imageFile = files.find(f => f.fieldname === `color_image_${index}`);
        const existingImage = existingColors[index]?.image;
        
        // If new image uploaded and there was an existing image, mark old image for deletion
        if (imageFile && existingImage) {
          imagesToDelete.push(existingImage);
        }
        
        return {
          color: color.color,
          // If new image uploaded, use it; otherwise keep existing image
          image: imageFile ? `/uploads/${imageFile.filename}` : existingImage
        };
      });

      const mainImage = colorsWithImages[0]?.image || null;
      
      // Check if main image changed and mark old one for deletion
      if (mainImage !== existingProduct.image && existingProduct.image) {
        imagesToDelete.push(existingProduct.image);
      }

      // Delete old images that are being replaced
      imagesToDelete.forEach(imagePath => {
        deleteImageFile(imagePath);
      });

      db.execute(
        'UPDATE products SET name = ?, description = ?, specifications = ?, price = ?, category_id = ?, image = ?, colors = ? WHERE id = ?',
        [name, description, specifications, price, category_id, mainImage, JSON.stringify(colorsWithImages), id],
        (err) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          res.json({ message: 'Product updated successfully' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Error processing product data' });
  }
});

app.delete('/api/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // First, get the product data to delete associated images
  db.execute('SELECT image, colors FROM products WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    const product = results[0];
    
    // Delete main product image
    if (product.image) {
      deleteImageFile(product.image);
    }
    
    // Delete all color images
    if (product.colors) {
      deleteProductImages(product.colors);
    }
    
    // Now delete the product from database
    db.execute('DELETE FROM products WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Product deleted successfully' });
    });
  });
});

// Orders Routes
app.get('/api/orders', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  // Get total count first
  db.execute('SELECT COUNT(*) as total FROM orders', (countErr, countResults) => {
    if (countErr) return res.status(500).json({ error: 'Database error' });

    const totalItems = countResults[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit) || 1;

    db.execute(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset],
      (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({
          data: results,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        });
      }
    );
  });
});

app.post('/api/orders', upload.single('payment_proof'), (req, res) => {
  const {
    customer_name,
    customer_phone,
    customer_address,
    product_id,
    product_name,
    product_color,
    quantity,
    total_price
  } = req.body;
  
  const payment_proof = req.file ? `/uploads/${req.file.filename}` : null;

  db.execute(
    `INSERT INTO orders (
      customer_name, customer_phone, customer_address, 
      product_id, product_name, product_color, quantity, 
      total_price, payment_proof
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      customer_name, customer_phone, customer_address,
      product_id, product_name, product_color, quantity,
      total_price, payment_proof
    ],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: results.insertId, message: 'Order created successfully' });
    }
  );
});

app.put('/api/orders/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.execute(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Order status updated successfully' });
    }
  );
});

app.delete('/api/orders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.execute('DELETE FROM orders WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Order deleted successfully' });
  });
});

// Settings Routes
app.get('/api/settings', (req, res) => {
  db.execute('SELECT * FROM settings ORDER BY id DESC LIMIT 1', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results[0] || {});
  });
});

app.put('/api/settings', authenticateToken, (req, res) => {
  const { instagram, address, phone, email } = req.body;
  
  db.execute('SELECT COUNT(*) as count FROM settings', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    if (results[0].count > 0) {
      // Update existing settings
      db.execute(
        'UPDATE settings SET instagram = ?, address = ?, phone = ?, email = ? WHERE id = 1',
        [instagram, address, phone, email],
        (err) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          res.json({ message: 'Settings updated successfully' });
        }
      );
    } else {
      // Insert new settings
      db.execute(
        'INSERT INTO settings (instagram, address, phone, email) VALUES (?, ?, ?, ?)',
        [instagram, address, phone, email],
        (err) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          res.json({ message: 'Settings created successfully' });
        }
      );
    }
  });
});

// Banners Routes
app.get('/api/banners', (req, res) => {
  db.execute(
    'SELECT * FROM banners WHERE is_active = true ORDER BY sort_order ASC, created_at DESC', 
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    }
  );
});

app.get('/api/banners/all', authenticateToken, (req, res) => {
  db.execute(
    'SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC', 
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    }
  );
});

app.post('/api/banners', authenticateToken, upload.fields([
  { name: 'image_desktop', maxCount: 1 },
  { name: 'image_mobile', maxCount: 1 }
]), (req, res) => {
  const { title, subtitle, link_url, sort_order } = req.body;
  const files = req.files;
  
  const image_desktop = files.image_desktop ? `/uploads/${files.image_desktop[0].filename}` : null;
  const image_mobile = files.image_mobile ? `/uploads/${files.image_mobile[0].filename}` : null;
  
  db.execute(
    'INSERT INTO banners (title, subtitle, image_desktop, image_mobile, link_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
    [title, subtitle, image_desktop, image_mobile, link_url, sort_order || 0],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: results.insertId, message: 'Banner created successfully' });
    }
  );
});

app.put('/api/banners/:id', authenticateToken, upload.fields([
  { name: 'image_desktop', maxCount: 1 },
  { name: 'image_mobile', maxCount: 1 }
]), (req, res) => {
  const { id } = req.params;
  const { title, subtitle, link_url, sort_order, is_active } = req.body;
  const files = req.files;
  
  // First, get the existing banner to preserve existing images
  db.execute('SELECT image_desktop, image_mobile FROM banners WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Banner not found' });
    
    const existingBanner = results[0];
    const imagesToDelete = [];
    
    // Handle desktop image
    let image_desktop = existingBanner.image_desktop;
    if (files.image_desktop) {
      if (existingBanner.image_desktop) {
        imagesToDelete.push(existingBanner.image_desktop);
      }
      image_desktop = `/uploads/${files.image_desktop[0].filename}`;
    }
    
    // Handle mobile image
    let image_mobile = existingBanner.image_mobile;
    if (files.image_mobile) {
      if (existingBanner.image_mobile) {
        imagesToDelete.push(existingBanner.image_mobile);
      }
      image_mobile = `/uploads/${files.image_mobile[0].filename}`;
    }
    
    // Delete old images that are being replaced
    imagesToDelete.forEach(imagePath => {
      deleteImageFile(imagePath);
    });
    
    db.execute(
      'UPDATE banners SET title = ?, subtitle = ?, image_desktop = ?, image_mobile = ?, link_url = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [title, subtitle, image_desktop, image_mobile, link_url, sort_order || 0, is_active === 'true', id],
      (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Banner updated successfully' });
      }
    );
  });
});

app.delete('/api/banners/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // First, get the banner data to delete associated images
  db.execute('SELECT image_desktop, image_mobile FROM banners WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Banner not found' });
    
    const banner = results[0];
    
    // Delete banner images
    if (banner.image_desktop) {
      deleteImageFile(banner.image_desktop);
    }
    if (banner.image_mobile) {
      deleteImageFile(banner.image_mobile);
    }
    
    // Now delete the banner from database
    db.execute('DELETE FROM banners WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Banner deleted successfully' });
    });
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  res.status(500).json({ error: error.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});