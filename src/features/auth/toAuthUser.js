// Tokens come back as httpOnly cookies — keep only the user info in localStorage.
// login returns `id`, signup returns `_id`; normalise both and never store the password hash.
const toAuthUser = (body) => {
  const user = { ...(body?.data ?? body) };
  user.id ??= user._id;
  delete user._id;
  delete user.password;
  return user;
};

export default toAuthUser;
