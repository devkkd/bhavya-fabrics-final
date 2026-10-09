const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const Blog = require('../models/Blog');
const router = express.Router();

// Restrict saved HTML to article-safe elements and attributes. Never allow scripts/events.
function cleanHtml(input) {
  let html = String(input || '').replace(/<!--([\s\S]*?)-->/g, '');
  html = html.replace(/<(script|style|object|embed|form|input|button|textarea|select|svg|math|iframe|video|audio)[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  const allowed = new Set('p br hr strong b em i u s blockquote ul ol li h1 h2 h3 h4 h5 h6 a img table thead tbody tfoot tr th td figure figcaption div span'.split(' '));
  const voidTags = new Set(['br', 'hr', 'img']);
  const attrs = {
    a: ['href', 'title', 'target', 'rel'], img: ['src', 'alt', 'width', 'height', 'loading'],
    th: ['colspan', 'rowspan'], td: ['colspan', 'rowspan'], table: ['border', 'cellpadding', 'cellspacing'],
    ol: ['start'], li: ['value'],
  };
  return html.replace(/<\/?[a-zA-Z][^>]*>/g, (tag) => {
    const closing = /^<\//.test(tag);
    const match = tag.match(/^<\/?\s*([a-zA-Z0-9-]+)/);
    if (!match) return '';
    const name = match[1].toLowerCase();
    if (!allowed.has(name)) return '';
    if (closing) return voidTags.has(name) ? '' : `</${name}>`;
    const attrText = tag.slice(match[0].length, tag.length - 1);
    const found = [];
    const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
    let a;
    while ((a = re.exec(attrText))) {
      const key = a[1].toLowerCase();
      const value = (a[2] ?? a[3] ?? a[4] ?? '').trim();
      if (!(attrs[name] || []).includes(key) || /^on/i.test(key)) continue;
      if (['href', 'src'].includes(key) && !/^(https?:\/\/|mailto:|\/|#)/i.test(value)) continue;
      const safeValue = value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
      found.push(`${key}="${safeValue}"`);
    }
    if (name === 'a' && !found.some(x => x.startsWith('href='))) return '<a>';
    if (name === 'a') found.push('target="_blank"', 'rel="noopener noreferrer"');
    return `<${name}${found.length ? ` ${found.join(' ')}` : ''}${voidTags.has(name) ? ' />' : '>'}`;
  });
}

const makeSlug = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 150);
function normalize(body = {}) {
  const data = { ...body };
  if (data.title !== undefined) data.title = String(data.title).trim();
  data.slug = makeSlug(data.slug || data.title);
  if (data.contentHtml !== undefined) data.contentHtml = cleanHtml(data.contentHtml);
  if (data.excerpt !== undefined) data.excerpt = String(data.excerpt || '').trim();
  if (data.authorName !== undefined) data.authorName = String(data.authorName || 'Bhavya Fabrics').trim();
  if (data.publishedAt) {
    const date = new Date(data.publishedAt);
    if (Number.isNaN(date.getTime())) throw new Error('Please provide a valid publication date and time.');
    data.publishedAt = date;
  } else if (data.status === 'published') {
    data.publishedAt = new Date();
  } else if (data.publishedAt === '') {
    data.publishedAt = null;
  }
  if (typeof data.schemaMarkup === 'string') {
    try { data.schemaMarkup = data.schemaMarkup.trim() ? JSON.parse(data.schemaMarkup) : null; }
    catch { throw new Error('Schema markup must be valid JSON.'); }
  }
  return data;
}

// Public listing: never return draft content.
router.get('/', async (req, res, next) => {
  try {
    const data = await Blog.find({ status: 'published', publishedAt: { $lte: new Date() } })
      .select('-contentHtml -schemaMarkup').sort({ publishedAt: -1, createdAt: -1 }).limit(100).lean();
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

// Admin listing.
router.get('/admin', adminAuth, async (req, res, next) => {
  try { res.json({ success: true, data: await Blog.find().sort({ updatedAt: -1 }).lean() }); }
  catch (e) { next(e); }
});

router.get('/sitemap', async (req, res, next) => {
  try {
    const data = await Blog.find({ status: 'published', publishedAt: { $lte: new Date() } })
      .select('slug updatedAt publishedAt').lean();
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const data = await Blog.findOne({ slug: req.params.slug, status: 'published', publishedAt: { $lte: new Date() } }).lean();
    if (!data) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.post('/', adminAuth, async (req, res, next) => {
  try {
    const payload = normalize(req.body);
    if (!payload.title) return res.status(400).json({ success: false, message: 'Blog title is required.' });
    if (!payload.contentHtml || !payload.contentHtml.replace(/<[^>]*>/g, '').trim()) return res.status(400).json({ success: false, message: 'Blog content is required.' });
    const data = await Blog.create(payload);
    res.status(201).json({ success: true, data });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ success: false, message: 'This slug already exists. Please choose another slug.' });
    if (e.message === 'Schema markup must be valid JSON.' || e.message.startsWith('Please provide')) return res.status(400).json({ success: false, message: e.message });
    next(e);
  }
});

router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const payload = normalize(req.body);
    const data = await Blog.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, data });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ success: false, message: 'This slug already exists. Please choose another slug.' });
    if (e.message === 'Schema markup must be valid JSON.' || e.message.startsWith('Please provide')) return res.status(400).json({ success: false, message: e.message });
    next(e);
  }
});

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true });
  } catch (e) { next(e); }
});
module.exports = router;