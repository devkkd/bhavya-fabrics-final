# Bulk Product Upload Templates

This document describes the bulk product upload template system for Bhavya Fabrics, including backend setup, frontend integration, and usage guidelines.

## Overview

The template system provides Excel-based bulk import for two product types:

1. **Raw Materials** - Products sold by meter (fabrics, yarns, etc.)
2. **Ready-Made** - Finished products sold by piece (garments, etc.)

## Files Created

### Backend Files

#### `/backend/templates/` (Directory)
- `rawMaterials_template.xlsx` - Excel template for meter-based products
- `readyMade_template.xlsx` - Excel template for piece-based products
- `TEMPLATES_GUIDE.md` - Detailed usage documentation

#### `/backend/utils/generateTemplates.js`
Script to generate the Excel templates with:
- Header row with bold formatting and color
- Sample data rows
- Validation hints in cell comments
- Proper column widths for readability

**Usage:**
```bash
npm install xlsx  # Already installed
node utils/generateTemplates.js
```

#### `/backend/routes/templates.js`
Express routes for template management:

**Endpoints:**
- `GET /api/templates/list` - Get list of available templates
- `GET /api/templates/download/:templateName` - Download a specific template
  - Valid templateNames: `rawMaterials`, `readyMade`
  - Requires admin authentication

**Features:**
- Admin authentication required
- Proper MIME type headers for Excel files
- Stream-based file delivery
- Error handling

#### `server.js` (Modified)
- Added template routes import
- Registered template routes at `/api/templates`

### Frontend Files

#### `/frontend/src/app/admin/(panel)/templates/page.jsx`
Admin dashboard page for template downloads with:
- Template information cards
- One-click download buttons
- Download progress indicators
- Error and success messages
- Step-by-step usage instructions
- Tips for successful imports
- Responsive design (mobile-friendly)

#### `/frontend/src/hooks/useTemplateDownload.js`
Custom React hook for template downloads:
- `download(templateName, filename)` - Initiates download
- `loading` - Loading state
- `error` - Error message
- `clearError()` - Dismiss error

**Usage:**
```javascript
const { download, loading, error } = useTemplateDownload();
await download('rawMaterials', 'rawMaterials_template.xlsx');
```

#### `/frontend/src/app/admin/components/TemplateDownloader.jsx`
Reusable component for template downloads:
- Can be embedded in other admin pages
- Compact mode for inline usage
- Full mode for dedicated sections
- Error and success notifications

**Usage (Compact):**
```jsx
<TemplateDownloader 
  templateName="rawMaterials" 
  templateLabel="Download Raw Materials Template"
  compact={true}
/>
```

**Usage (Full):**
```jsx
<TemplateDownloader 
  templateName="readyMade" 
  templateLabel="Download Ready-Made Template"
  showMessage={true}
/>
```

## Template Structure

### Raw Materials Template

**Columns:**
| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | SKU | Text | ✓ | Unique identifier |
| 2 | Product Name | Text | ✓ | Display name |
| 3 | Category | Text | ✓ | Parent category |
| 4 | Sub Category | Text | ✓ | Sub-category |
| 5 | Description | Text | ✓ | Detailed description |
| 6 | Meter Config: Min Meters | Number | ✓ | Minimum meters |
| 7 | Meter Config: Max Meters | Number | ✓ | Maximum meters |
| 8 | Meter Config: Increment Meters | Number | ✓ | Order increment |
| 9 | Regular Price (Per Meter) | Number | ✓ | Base price |
| 10 | Sale Price (Per Meter) | Number | ✗ | Discounted price |
| 11 | Images | Text | ✓ | Comma-separated filenames |
| 12 | Colors | JSON | ✓ | Color options with hex codes |
| 13 | Bulk Order Note | Text | ✗ | Special notes |
| 14 | Status | Text | ✓ | `draft` or `published` |

**Colors JSON Example:**
```json
[
  {
    "name": "Red",
    "hex": "#FF0000",
    "images": ["red_1.jpg", "red_2.jpg"]
  },
  {
    "name": "Blue",
    "hex": "#0000FF",
    "images": ["blue_1.jpg"]
  }
]
```

### Ready-Made Template

**Columns:**
| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | SKU | Text | ✓ | Unique identifier |
| 2 | Product Name | Text | ✓ | Display name |
| 3 | Category | Text | ✓ | Parent category |
| 4 | Sub Category | Text | ✓ | Sub-category |
| 5 | Description | Text | ✓ | Detailed description |
| 6 | Regular Price (Per Piece) | Number | ✓ | Base price |
| 7 | Sale Price (Per Piece) | Number | ✗ | Discounted price |
| 8 | Images | Text | ✓ | Comma-separated filenames |
| 9 | Variants JSON | JSON | ✗ | Color/size variants |
| 10 | Status | Text | ✓ | `draft` or `published` |

**Variants JSON Example:**
```json
[
  {
    "colorName": "Red",
    "colorValue": "red",
    "colorHex": "#FF0000",
    "sizeName": "Medium",
    "sizeValue": "m",
    "regularPrice": 299,
    "salePrice": 249,
    "stock": 50
  }
]
```

## Setup Instructions

### 1. Backend Setup

The backend is already configured. Verify the setup:

```bash
cd backend
npm install  # If not already done
npm run dev  # Start the server
```

The templates will be available at:
- `/api/templates/list`
- `/api/templates/download/rawMaterials`
- `/api/templates/download/readyMade`

### 2. Frontend Setup

The frontend components are ready to use. Add the templates link to the admin navigation menu:

**Example in admin layout or navigation:**
```jsx
<Link href="/admin/(panel)/templates">
  <FileText className="w-5 h-5" />
  Templates
</Link>
```

### 3. Environment Variables

Ensure `NEXT_PUBLIC_BACKEND_URL` is set in `.env.local`:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

## Usage Flow

### For Admins

1. **Navigate** to Admin Panel → Templates
2. **View** available templates and their features
3. **Download** the template for your product type
4. **Fill** in product data following the column guidelines
5. **Upload** images with proper naming (SKU_1.jpg, etc.)
6. **Import** the filled template via the Products section
7. **Review** products in draft status
8. **Publish** when satisfied

### For Developers

#### Using the Template Download Hook

```javascript
import { useTemplateDownload } from '@/hooks/useTemplateDownload';

function MyComponent() {
  const { download, loading, error } = useTemplateDownload();

  const handleDownload = async () => {
    const success = await download('rawMaterials', 'my_template.xlsx');
    if (success) {
      console.log('Download successful!');
    }
  };

  return (
    <button onClick={handleDownload} disabled={loading}>
      {loading ? 'Downloading...' : 'Download'}
    </button>
  );
}
```

#### Using the Template Downloader Component

```javascript
import TemplateDownloader from '@/app/admin/components/TemplateDownloader';

function MyAdminPage() {
  return (
    <div>
      <TemplateDownloader 
        templateName="readyMade"
        templateLabel="Download Ready-Made Template"
      />
    </div>
  );
}
```

#### Fetching Template List

```javascript
const response = await fetch('/api/templates/list', {
  credentials: 'include'
});
const data = await response.json();
console.log(data.templates); // Array of available templates
```

## Image Upload Guidelines

### Naming Convention

**Raw Materials:**
```
SKU_1.jpg
SKU_2.jpg
SKU_3.jpg
SKU_color_1.jpg
SKU_color_2.jpg
```

**Ready-Made:**
```
product.jpg
product_2.jpg
product_front.jpg
product_back.jpg
```

### Supported Formats

- `.jpg` / `.jpeg`
- `.png`
- `.webp`
- `.gif`

### Upload Process

1. Use the media/upload section in the admin panel
2. Upload images with proper naming
3. Verify filenames exactly match the template
4. Note: Filenames are case-sensitive on Linux servers

## Validation Rules

### Data Validation

- **SKU**: Must be unique, alphanumeric with hyphens/underscores allowed
- **Prices**: Must be numeric (no currency symbols)
- **Meter/Piece Quantities**: Must be positive numbers
- **Categories**: Must exist in the system
- **JSON Fields**: Must be valid JSON format
- **Status**: Must be either `draft` or `published`

### Image Validation

- Filenames must match exactly
- All referenced images must be uploaded
- Formats must be supported

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid JSON in Colors | Formatting error | Use JSON validator (jsonlint.com) |
| Duplicate SKU | SKU already exists | Use unique SKU |
| Category not found | Category doesn't exist | Create category first |
| Image not found | Filename mismatch | Check exact filename match |
| Invalid price | Non-numeric value | Remove currency symbols |

## Troubleshooting

### Download Not Working

1. **Check authentication**: Ensure you're logged in as admin
2. **Check backend**: Verify backend is running and accessible
3. **Check network**: Verify CORS is properly configured
4. **Check console**: Look for JavaScript errors in browser console

### Import Failing

1. **Validate data**: Check all required fields are filled
2. **Check JSON**: Validate JSON in Colors/Variants columns
3. **Check images**: Ensure all referenced images exist
4. **Check categories**: Verify categories exist in system

### Performance Issues

- For large uploads (1000+ products), split into multiple files
- Test with a small batch first
- Monitor server memory and database load

## Future Enhancements

Potential improvements to the template system:

1. **Bulk Import Progress** - Real-time progress tracking
2. **Template Validation** - Pre-upload validation
3. **Error Reporting** - Detailed error messages for failed rows
4. **Batch Processing** - Handle large files with background jobs
5. **Template Customization** - Allow users to customize templates
6. **Import History** - Track import history and enable rollback
7. **Duplicate Detection** - Detect and handle duplicate SKUs
8. **Image Auto-upload** - Auto-upload images from template references

## API Documentation

### GET /api/templates/list

**Description:** Get list of available templates

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "name": "rawMaterials",
      "filename": "rawMaterials_template.xlsx",
      "path": "/api/templates/download/rawMaterials"
    },
    {
      "name": "readyMade",
      "filename": "readyMade_template.xlsx",
      "path": "/api/templates/download/readyMade"
    }
  ]
}
```

### GET /api/templates/download/:templateName

**Description:** Download a template file

**Authentication:** Required (Admin)

**Parameters:**
- `templateName` (string): `rawMaterials` or `readyMade`

**Response:** Binary file download (.xlsx)

**Error Responses:**
```json
{
  "success": false,
  "message": "Invalid template name. Use: rawMaterials or readyMade"
}
```

## Support

For issues or questions:
1. Check the `TEMPLATES_GUIDE.md` in `/backend/templates/`
2. Review error messages in browser console
3. Contact the technical team

## References

- Excel Generation: [xlsx npm package](https://www.npmjs.com/package/xlsx)
- Next.js: [Next.js Documentation](https://nextjs.org/docs)
- Express.js: [Express.js Documentation](https://expressjs.com/)
- JSON Format: [json.org](https://www.json.org/)
