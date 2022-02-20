var express = require("express");
const async = require("hbs/lib/async");
var router = express.Router();
const helper = require("../helpers/query");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("user/index", { title: "Home" });
});

router.get("/school", function (req, res, next) {
  helper.getSchool().then((data) => {
    res.render("user/school", { title: "School", data });
  });
});
router.get("/school/add", function (req, res, next) {
  res.render("user/newSchool", { title: "New School" });
});
router.get("/school/view", async (req, res, next) => {
  let student = await helper.getStudent(req.query.id);
  helper.schoolDetails(req.query.id).then((data) => {
    res.render("user/viewSchool", { title: "View School", data, student });
  });
});
router.get("/school/delete", function (req, res, next) {
  helper.deleteSchool(req.query.id).then(() => {
    res.redirect("/school");
  });
});
router.get("/school/addStudent", function (req, res, next) {
  res.render("user/newStudent", { title: "New Student", id: req.query.id });
});
router.post("/school/new-school", function (req, res, next) {
  helper.addSchool(req.body).then((response) => {
    res.redirect("/school");
  });
});
router.post("/school/new-student", function (req, res, next) {
  helper.addStudent(req.body).then((response) => {
    res.redirect(`/school/view?id=${req.body.schoolId}`);
  });
});

module.exports = router;
