const passport = require("passport");

exports.isAuth = (req, res, done) => {
  return passport.authenticate("jwt");
};

exports.sanitizeUser = (user) => {
  return { id: user.id, role: user.role };
};

exports.cookieExtractor = function (req) {
  let token = null;
  console.log(req)
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  //random token for test
  // token =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjYwOWY0MDUyYmI3M2IyYzhiMjY5ZSIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTcxNTMzMTI2M30.Gv53IpSIZPf-DRhNgsD8Ae1a_smbhGRH3tV16tvgLTc";

  return token;
};
