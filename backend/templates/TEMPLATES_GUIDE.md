# Bulk Product Upload Templates Guide

This guide explains how to use the Excel templates for bulk product uploads to the Bhavya Fabrics system.

## Overview

Two templates are available for different product types:

1. **rawMaterials_template.xlsx** - For meter/raw material products (fabrics by the meter)
2. **readyMade_template.xlsx** - For piece/ready-made products (finished garments)

---

## 1. Raw Materials Template (rawMaterials_template.xlsx)

### Use Case
Use this template for products sold by the meter, such as:
- Fabric rolls
- Yarns
- Raw materials sold in continuous lengths

### Column Descriptions

| Column | Required | Format | Notes |
|--------|----------|--------|-------|
| **SKU** | ✓ | Text | Unique product identifier. Must be unique across the system. Example: `RM001`, `FAB-COTTON-001` |
| **Product Name** | ✓ | Text | Display name of the product. Example: `Premium Cotton Fabric` |
| **Category** | ✓ | Text | Parent category. Must match existing categories in the system. Example: `Fabrics`, `Yarns` |
| **Sub Category** | ✓ | Text | Sub-category within the main category. Example: `Cotton`, `Silk` |
| **Description** | ✓ | Text (Long) | Detailed product description. Can include material, uses, care instructions, etc. |
| **Meter Config: Min Meters** | ✓ | Number | Minimum meters customers can order. Example: `0.5`, `1` |
| **Meter Config: Max Meters** | ✓ | Number | Maximum meters customers can order. Example: `50`, `100` |
| **Meter Config: Increment Meters** | ✓ | Number | Increment step for meter selection. Example: `0.5` (allows 1, 1.5, 2, 2.5, etc.) |
| **Regular Price (Per Meter)** | ✓ | Number | Base price per meter. Example: `150`, `200.50` |
| **Sale Price (Per Meter)** | ✗ | Number | Discounted price per meter. Leave empty if no sale. Example: `120`, `180.50` |
| **Images** | ✓ | Text (comma-separated) | Image filenames. Format: `SKU_1.jpg, SKU_2.jpg, SKU_3.jpg`. Upload images separately to the media folder. |
| **Colors** | ✓ | JSON | Color options with hex codes. See JSON format below. |
| **Bulk Order Note** | ✗ | Text | Special notes for bulk orders. Example: `Minimum 5 meters for bulk discount` |
| **Status** | ✓ | Text | Either `draft` or `published`. Use `draft` to review before publishing. |

### Colors JSON Format

The Colors column expects a JSON array of color objects:

```json
[
  {
    "name": "Red",
    "hex": "#FF0000",
    "images": ["red_1.jpg", "red_2.jpg", "red_3.jpg"]
  },
  {
    "name": "Blue",
    "hex": "#0000FF",
    "images": ["blue_1.jpg", "blue_2.jpg"]
  }
]
```

**Fields:**
- `name` (String): Color name. Example: `Red`, `Navy Blue`
- `hex` (String): Hex color code. Example: `#FF0000`
- `images` (Array): Image filenames for this color

### Example Row

```
RM001 | Premium Cotton Fabric | Fabrics | Cotton | 100% organic cotton, soft and breathable | 1 | 50 | 0.5 | 150 | 120 | RM001_1.jpg, RM001_2.jpg, RM001_3.jpg | [{"name":"Red","hex":"#FF0000","images":["red_1.jpg","red_2.jpg"]},{"name":"Blue","hex":"#0000FF","images":["blue_1.jpg"]}] | Minimum 5 meters for bulk orders | published
```

---

## 2. Ready-Made Template (readyMade_template.xlsx)

### Use Case
Use this template for finished products, such as:
- T-shirts
- Shirts
- Dresses
- Ready-made garments
- Pre-assembled products

### Column Descriptions

| Column | Required | Format | Notes |
|--------|----------|--------|-------|
| **SKU** | ✓ | Text | Unique product identifier. Example: `RM-SHIRT-001`, `TSHIRT-RED-M` |
| **Product Name** | ✓ | Text | Display name. Example: `Cotton T-Shirt` |
| **Category** | ✓ | Text | Parent category. Example: `Ready-Made`, `Garments` |
| **Sub Category** | ✓ | Text | Sub-category. Example: `Shirts`, `T-Shirts` |
| **Description** | ✓ | Text (Long) | Product description with details like material, fit, care instructions. |
| **Regular Price (Per Piece)** | ✓ | Number | Base price per piece. Example: `299`, `599.99` |
| **Sale Price (Per Piece)** | ✗ | Number | Discounted price. Leave empty if no sale. Example: `249`, `499.99` |
| **Images** | ✓ | Text (comma-separated) | Image filenames. Format: `product.jpg, product_2.jpg, product_3.jpg` |
| **Variants JSON** | ✗ | JSON | Color/size options if applicable. See JSON format below. Leave empty if no variants. |
| **Status** | ✓ | Text | Either `draft` or `published`. |

### Variants JSON Format

The Variants column expects a JSON array with color and size combinations:

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
  },
  {
    "colorName": "Red",
    "colorValue": "red",
    "colorHex": "#FF0000",
    "sizeName": "Large",
    "sizeValue": "l",
    "regularPrice": 299,
    "salePrice": 249,
    "stock": 30
  }
]
```

**Fields:**
- `colorName` (String): Display name of color. Example: `Red`, `Navy Blue`
- `colorValue` (String): URL-safe color identifier. Example: `red`, `navy_blue`
- `colorHex` (String): Hex color code. Example: `#FF0000`
- `sizeName` (String): Display name of size. Example: `Medium`, `Small`
- `sizeValue` (String): URL-safe size identifier. Example: `m`, `s`, `l`
- `regularPrice` (Number): Price for this variant
- `salePrice` (Number): Sale price for this variant (optional)
- `stock` (Number): Available quantity for this variant

### Example Row

```
RM-SHIRT-001 | Cotton T-Shirt | Ready-Made | Shirts | 100% cotton t-shirt, comfortable fit | 299 | 249 | shirt.jpg, shirt_2.jpg | [{"colorName":"Red","colorValue":"red","colorHex":"#FF0000","sizeName":"M","sizeValue":"m","regularPrice":299,"salePrice":249,"stock":50}] | published
```

---

## General Instructions

### Before Uploading

1. **Prepare your data:**
   - Ensure all SKUs are unique
   - Validate all prices are numbers (no currency symbols)
   - Check that categories and subcategories exist in the system
   - Verify image filenames match uploaded images

2. **Image naming conventions:**
   - For raw materials: `SKU_1.jpg`, `SKU_2.jpg` (e.g., `RM001_1.jpg`)
   - For ready-made: `product.jpg`, `product_2.jpg` (e.g., `shirt.jpg`, `shirt_2.jpg`)
   - Supported formats: `.jpg`, `.png`, `.webp`, `.gif`

3. **JSON validation:**
   - Use a JSON validator if unsure about formatting
   - Ensure no trailing commas
   - Special characters should be properly escaped

4. **Pricing:**
   - Leave sale price empty if no discount
   - Prices should be numbers only (e.g., `299`, not `₹299` or `$299`)
   - Use decimal points for cents (e.g., `299.50`)

### Uploading

1. Download the template from the admin panel
2. Fill in your product data
3. Save the file with the same `.xlsx` format
4. Upload via the bulk import feature in the admin dashboard
5. Review the preview before confirming
6. System will validate and create products with `draft` status
7. Review and publish from the admin panel

### Status Field

- **draft**: Product is created but not visible to customers
- **published**: Product is visible on the storefront

---

## Troubleshooting

### "Invalid JSON in Variants/Colors column"
- Check for missing quotes around string values
- Ensure no trailing commas inside the JSON array
- Use a JSON validator (jsonlint.com) to verify

### "Image not found"
- Verify filenames match exactly (case-sensitive on some systems)
- Ensure images are uploaded to the media folder
- Check the image format is supported

### "Category not found"
- Go to the Category management section
- Create the category if it doesn't exist
- Use exact category names as they appear in the system

### "Duplicate SKU"
- Each product must have a unique SKU
- Check if the SKU already exists in the system
- Modify the SKU to make it unique

---

## API Endpoints

Templates can be downloaded programmatically:

```
GET /api/templates/list
GET /api/templates/download/rawMaterials
GET /api/templates/download/readyMade
```

All endpoints require admin authentication.

---

## Support

For issues or questions about bulk uploads, please contact the technical team.
