const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Ensure templates directory exists
const templatesDir = path.join(__dirname, '../templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Create Raw Materials Template
function createRawMaterialsTemplate() {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    // Headers
    [
      'SKU',
      'Product Name',
      'Category',
      'Sub Category',
      'Description',
      'Meter Config: Min Meters',
      'Meter Config: Max Meters',
      'Meter Config: Increment Meters',
      'Regular Price (Per Meter)',
      'Sale Price (Per Meter)',
      'Images',
      'Colors',
      'Bulk Order Note',
      'Status'
    ],
    // Sample data
    [
      'RM001',
      'Cotton Fabric',
      'Fabrics',
      'Cotton',
      'Premium cotton fabric suitable for apparel',
      1,
      50,
      0.5,
      150,
      120,
      'RM001_1.jpg, RM001_2.jpg',
      '[{"name":"Red","hex":"#FF0000","images":["red_1.jpg","red_2.jpg"]},{"name":"Blue","hex":"#0000FF","images":["blue_1.jpg","blue_2.jpg"]}]',
      'Minimum 5 meters for bulk orders',
      'published'
    ]
  ]);

  // Set column widths
  const colWidths = [12, 18, 15, 15, 25, 18, 18, 22, 22, 22, 30, 50, 25, 12];
  worksheet['!cols'] = colWidths.map(w => ({ wch: w }));

  // Style header row (bold)
  const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cell = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cell]) continue;
    worksheet[cell].font = { bold: true, color: { rgb: 'FFFFFF' } };
    worksheet[cell].fill = { fgColor: { rgb: '366092' } };
    worksheet[cell].alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
  }

  // Add comments/validation hints
  const comments = {
    'A2': 'Unique product identifier (e.g., RM001)',
    'C2': 'Parent category (e.g., Fabrics, Yarns)',
    'D2': 'Sub-category within the main category',
    'E2': 'Detailed product description',
    'F2': 'Minimum meters customer can order',
    'G2': 'Maximum meters customer can order',
    'H2': 'Increment step (e.g., 0.5 means can order 1, 1.5, 2, 2.5...)',
    'I2': 'Base price per meter (required)',
    'J2': 'Discounted price per meter (optional)',
    'K2': 'Image filenames separated by commas. Format: SKU_1.jpg, SKU_2.jpg',
    'L2': 'JSON array of color options with hex codes and images',
    'M2': 'Special notes for bulk orders',
    'N2': 'draft or published'
  };

  Object.keys(comments).forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].comment = [{
        author: 'Template',
        text: comments[cell],
        visible: false
      }];
    }
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Raw Materials');
  const filePath = path.join(templatesDir, 'rawMaterials_template.xlsx');
  XLSX.writeFile(workbook, filePath);
  console.log('✓ Raw Materials template created:', filePath);
}

// Create Ready-Made Template
function createReadyMadeTemplate() {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    // Headers
    [
      'SKU',
      'Product Name',
      'Category',
      'Sub Category',
      'Description',
      'Regular Price (Per Piece)',
      'Sale Price (Per Piece)',
      'Images',
      'Variants JSON',
      'Status'
    ],
    // Sample data
    [
      'RM-SHIRT-001',
      'Cotton T-Shirt',
      'Ready-Made',
      'Shirts',
      'Premium cotton t-shirt available in multiple colors and sizes',
      299,
      249,
      'shirt_red_m.jpg, shirt_red_l.jpg, shirt_blue_m.jpg',
      '[{"colorName":"Red","colorValue":"red","colorHex":"#FF0000","sizeName":"Medium","sizeValue":"m","regularPrice":299,"salePrice":249,"stock":50},{"colorName":"Red","colorValue":"red","colorHex":"#FF0000","sizeName":"Large","sizeValue":"l","regularPrice":299,"salePrice":249,"stock":30}]',
      'published'
    ]
  ]);

  // Set column widths
  const colWidths = [15, 20, 15, 15, 30, 20, 20, 40, 80, 12];
  worksheet['!cols'] = colWidths.map(w => ({ wch: w }));

  // Style header row (bold)
  const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cell = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cell]) continue;
    worksheet[cell].font = { bold: true, color: { rgb: 'FFFFFF' } };
    worksheet[cell].fill = { fgColor: { rgb: '366092' } };
    worksheet[cell].alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
  }

  // Add comments/validation hints
  const comments = {
    'A2': 'Unique product identifier (e.g., RM-SHIRT-001)',
    'C2': 'Product category',
    'D2': 'Sub-category within the main category',
    'E2': 'Detailed product description',
    'F2': 'Base price per piece (required)',
    'G2': 'Discounted price per piece (optional)',
    'H2': 'Image filenames separated by commas (e.g., product.jpg, product_2.jpg)',
    'I2': 'JSON array with color/size variants. Include colorName, colorValue, colorHex, sizeName, sizeValue, regularPrice, salePrice, stock',
    'J2': 'draft or published'
  };

  Object.keys(comments).forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].comment = [{
        author: 'Template',
        text: comments[cell],
        visible: false
      }];
    }
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ready-Made');
  const filePath = path.join(templatesDir, 'readyMade_template.xlsx');
  XLSX.writeFile(workbook, filePath);
  console.log('✓ Ready-Made template created:', filePath);
}

// Generate both templates
try {
  createRawMaterialsTemplate();
  createReadyMadeTemplate();
  console.log('\n✓ Both templates generated successfully in /backend/templates/');
} catch (error) {
  console.error('Error generating templates:', error);
  process.exit(1);
}
