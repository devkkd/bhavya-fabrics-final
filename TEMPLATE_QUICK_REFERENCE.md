# Template Quick Reference

## Quick Start

### 1. Raw Materials (By Meter)
```
SKU: RM001
Product: Premium Cotton Fabric
Category: Fabrics
Sub Category: Cotton
Description: 100% organic cotton
Min Meters: 1
Max Meters: 50
Increment: 0.5
Regular Price: 150 (per meter)
Sale Price: 120 (per meter) [optional]
Images: RM001_1.jpg, RM001_2.jpg
Colors: [{"name":"Red","hex":"#FF0000","images":["red_1.jpg"]}]
Bulk Note: Minimum 5 meters for bulk orders
Status: published
```

### 2. Ready-Made (By Piece)
```
SKU: SHIRT-001
Product: Cotton T-Shirt
Category: Ready-Made
Sub Category: Shirts
Description: Comfortable cotton t-shirt
Regular Price: 299 (per piece)
Sale Price: 249 (per piece) [optional]
Images: shirt.jpg, shirt_2.jpg
Variants: [{"colorName":"Red","colorValue":"red","colorHex":"#FF0000","sizeName":"M","sizeValue":"m","regularPrice":299,"salePrice":249,"stock":50}]
Status: published
```

## Checklists

### Before Upload
- [ ] All SKUs are unique
- [ ] Categories exist in the system
- [ ] Image files uploaded and naming matches exactly
- [ ] JSON is valid (use jsonlint.com to validate)
- [ ] Prices are numbers only (no currency symbols)
- [ ] Required fields filled (marked with ✓)
- [ ] Status set to 'draft' for review or 'published' for immediate visibility

### Image Naming

**Raw Materials:**
```
SKU_1.jpg
SKU_2.jpg
SKU_color_1.jpg
```

**Ready-Made:**
```
product.jpg
product_2.jpg
product_detail.jpg
```

**Allowed Formats:**
- .jpg, .jpeg, .png, .webp, .gif

## JSON Formatting Tips

### Colors (Raw Materials)
```json
[
  {"name":"Red","hex":"#FF0000","images":["image1.jpg","image2.jpg"]},
  {"name":"Blue","hex":"#0000FF","images":["image3.jpg"]}
]
```

**Required fields:**
- `name` - Color display name
- `hex` - Hex color code (e.g., #FF0000)
- `images` - Array of image filenames

### Variants (Ready-Made)
```json
[
  {
    "colorName":"Red",
    "colorValue":"red",
    "colorHex":"#FF0000",
    "sizeName":"Medium",
    "sizeValue":"m",
    "regularPrice":299,
    "salePrice":249,
    "stock":50
  }
]
```

**Required fields:**
- `colorName` - Display name (Red)
- `colorValue` - URL slug (red)
- `colorHex` - Hex code (#FF0000)
- `sizeName` - Display name (Medium)
- `sizeValue` - URL slug (m)
- `regularPrice` - Price (numeric)
- `salePrice` - Discount price (optional)
- `stock` - Quantity available

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Invalid JSON in Colors" | Remove trailing commas, check quotes |
| "Duplicate SKU" | Use unique SKU, check if already exists |
| "Category not found" | Create category first in admin panel |
| "Image not found" | Check filename case-sensitivity and spelling |
| "Invalid price" | Remove ₹, $, comma symbols - use numbers only |
| "Invalid meter config" | Use numbers only, decimals OK (e.g., 0.5) |

## File Locations

| File | Location |
|------|----------|
| Raw Materials Template | `/backend/templates/rawMaterials_template.xlsx` |
| Ready-Made Template | `/backend/templates/readyMade_template.xlsx` |
| Documentation | `/backend/templates/TEMPLATES_GUIDE.md` |
| Download Route | `GET /api/templates/download/:templateName` |
| Admin Page | `/admin/(panel)/templates` |

## Download URLs

**Frontend:**
```
http://localhost:3000/admin/(panel)/templates
```

**API:**
```
GET /api/templates/list                    (Admin auth required)
GET /api/templates/download/rawMaterials   (Admin auth required)
GET /api/templates/download/readyMade      (Admin auth required)
```

## Field Explanations

### Raw Materials Only
- **Meter Config: Min Meters** - Smallest order size (e.g., 1 meter)
- **Meter Config: Max Meters** - Largest order size (e.g., 50 meters)
- **Meter Config: Increment Meters** - Stepping (e.g., 0.5 = can order 1, 1.5, 2, 2.5...)
- **Bulk Order Note** - Custom message for bulk customers

### Ready-Made Only
- **Variants JSON** - Define color/size options with individual pricing and stock

## Tips

1. **Start with draft** - Set status to 'draft' to review before publishing
2. **Test first** - Upload 1-2 products to test the process
3. **Batch uploads** - For 1000+ products, split into multiple files
4. **Image preparation** - Resize and optimize images before uploading
5. **Backup** - Keep a backup of your template data
6. **Validate JSON** - Use online JSON validator before importing
7. **Check categories** - Ensure all categories exist before bulk import

## Support

For detailed documentation, see:
- `/backend/templates/TEMPLATES_GUIDE.md` - Full usage guide
- `TEMPLATES_README.md` - Complete documentation
- Admin panel → Templates → "How to Use" section

## Example Downloads

| Type | Use When |
|------|----------|
| Raw Materials | Selling fabric by meter, yarn, material roll |
| Ready-Made | Selling finished garments, pre-assembled products |

## Next Steps

1. Download template from admin panel
2. Fill in your product data
3. Upload images with correct naming
4. Import template via Products section
5. Review in draft status
6. Publish when ready

---

**Last Updated:** October 2024
**Version:** 1.0
