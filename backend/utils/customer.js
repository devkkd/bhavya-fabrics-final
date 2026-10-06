function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function normalizePhone(phone) {
  return String(phone || "")
    .trim()
    .replace(/[\s\-().]/g, "");
}

function parseBirthday(value) {
  if (!value) return null;

  const raw = String(value).trim();

  const match = raw.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (match) {
    const month = Number(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);

    const date = new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    ) {
      return date;
    }

    return null;
  }

  const date = new Date(raw);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function sanitizeCustomer(customer) {
  if (!customer) return null;

  const data =
    typeof customer.toObject === "function"
      ? customer.toObject()
      : { ...customer };

  delete data.passwordHash;

  return {
    id: String(data._id),
    name: data.name,
    email: data.email,
    phone: data.phone,
    birthday: data.birthday || null,
    gender: data.gender || "",
    role: data.role,
    emailVerified: Boolean(
      data.emailVerified
    ),
    status: data.status,
    marketingOptIn: Boolean(
      data.marketingOptIn
    ),
    lastLoginAt:
      data.lastLoginAt || null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

module.exports = {
  normalizeEmail,
  normalizePhone,
  parseBirthday,
  sanitizeCustomer,
};