const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function validatePassword(password) {
  return PASSWORD_RULE.test(
    String(password || "")
  );
}

module.exports = {
  validatePassword,
};