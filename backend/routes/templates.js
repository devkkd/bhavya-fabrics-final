const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Middleware to verify admin authentication
const adminAuth = require('../middleware/adminAuth');

/**
 * GET /api/templates/download/:templateName
 * Download Excel template for bulk product upload
 * @param {string} templateName - 'rawMaterials' or 'readyMade'
 */
router.get('/download/:templateName', adminAuth, (req, res) => {
  try {
    const { templateName } = req.params;
    
    // Validate template name to prevent directory traversal
    const validTemplates = ['rawMaterials_template', 'readyMade_template'];
    const templateFile = `${templateName}.xlsx`;
    
    if (!validTemplates.includes(templateName)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template name. Use: rawMaterials or readyMade'
      });
    }

    const filePath = path.join(__dirname, '../templates', templateFile);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Template file not found'
      });
    }

    // Set appropriate headers for Excel download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${templateFile}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('Error streaming template file:', err);
      res.status(500).json({
        success: false,
        message: 'Error downloading template'
      });
    });
  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while downloading template'
    });
  }
});

/**
 * GET /api/templates/list
 * Get list of available templates
 */
router.get('/list', adminAuth, (req, res) => {
  try {
    const templatesDir = path.join(__dirname, '../templates');
    
    if (!fs.existsSync(templatesDir)) {
      return res.json({
        success: true,
        templates: []
      });
    }

    const files = fs.readdirSync(templatesDir).filter(file => file.endsWith('.xlsx'));
    
    const templates = files.map(file => ({
      name: file.replace('_template.xlsx', ''),
      filename: file,
      path: `/api/templates/download/${file.replace('_template.xlsx', '')}`
    }));

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error listing templates:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while listing templates'
    });
  }
});

module.exports = router;
