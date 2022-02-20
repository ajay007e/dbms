var express = require("express");
const { redirect } = require("express/lib/response");
const async = require("hbs/lib/async");
const helper = require("../helpers/query");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("admin/index", { title: "Admin Panel", admin: true });
});

router.get("/district", function (req, res, next) {
  helper.getDistrict().then((resp) => {
    res.render("admin/district", {
      title: "Admin Panel | District",
      admin: true,
      data: resp,
    });
  });
});
router.get("/district/add", function (req, res, next) {
  res.render("admin/newDistrict", {
    title: "Admin Panel | New District",
    admin: true,
  });
});
router.get("/district/delete", function (req, res, next) {
  helper.deleteDistrict(req.query.id).then((resp) => {
    res.redirect("/admin/district");
  });
});
router.post("/district/new-district", function (req, res, next) {
  helper.addDistrict(req.body, (response) => {
    res.redirect("/admin/district");
  });
});

router.get("/category", function (req, res, next) {
  helper.getCategory().then((resp) => {
    res.render("admin/category", {
      title: "Admin Panel | Category",
      admin: true,
      data: resp,
    });
  });
});
router.get("/category/add", function (req, res, next) {
  res.render("admin/newCategory", {
    title: "Admin Panel | New Category",
    admin: true,
  });
});
router.get("/category/delete", function (req, res, next) {
  helper.deleteCategory(req.query.id).then((resp) => {
    res.redirect("/admin/category");
  });
});
router.post("/category/new-category", function (req, res, next) {
  helper.addCategory(req.body).then((response) => {
    res.redirect("/admin/category");
  });
});

router.get("/item", function (req, res, next) {
  helper.getItem().then((data) => {
    res.render("admin/item", {
      title: "Admin Panel | Item",
      admin: true,
      data,
    });
  });
});
router.get("/item/add", function (req, res, next) {
  res.render("admin/newItem", {
    title: "Admin Panel | New Item",
    admin: true,
  });
});
router.get("/item/edit", function (req, res, next) {
  helper.itemDetails(req.query.id).then((data) => {
    res.render("admin/editItem", {
      title: "Admin Panel | Edit Item",
      admin: true,
      data,
    });
  });
});
router.get("/item/delete", function (req, res, next) {
  helper.deleteItem(req.query.id).then((resp) => {
    res.redirect("/admin/item");
  });
});
router.get("/item/view", async (req, res, next) => {
  let student = await helper.getStudents(req.query.id);
  helper.itemDetails(req.query.id).then((data) => {
    res.render("admin/viewItem", {
      title: "Admin Panel | View Item",
      admin: true,
      data,
      student,
    });
  });
});
router.get("/item/result", async (req, res, next) => {
  helper.getResult(req.query.id).then((data) => {
    // data.item = req.query.id;
    console.log(data);
    if (data.status) {
      res.render("admin/resultItem", {
        title: "Admin Panel | View Item",
        admin: true,
        data,
      });
    } else {
      res.redirect(`/admin/item/view?id=${req.query.id}`);
    }
  });
});
router.post("/item/item-result", async (req, res, next) => {
  let itemId = await helper.getId(req.body.itemId);
  helper.updateResult(req.body).then((data) => {
    res.redirect(`/admin/item/result?id=${itemId}`);
  });
});
router.post("/item/new-item", function (req, res, next) {
  helper.addItem(req.body).then((response) => {
    res.redirect("/admin/item");
  });
});
router.post("/item/edit-item", function (req, res, next) {
  helper.editItem(req.query.id, req.body).then((response) => {
    if (response.status.toLowerCase() != "ended") {
      res.redirect(`/admin/item/view?id=${req.query.id}`);
    } else {
      res.redirect(`/admin/item/result?id=${req.query.id}`);
    }
  });
});

router.get("/pointTable", function (req, res, next) {
  helper.getTable().then((data) => {
    res.render("admin/pointTable", {
      title: "Admin Panel | Point Table",
      admin: true,
      data,
    });
  });
});
router.get("/pointTable/add", function (req, res, next) {
  res.render("admin/newPointTable", {
    title: "Admin Panel | New Point Table",
    admin: true,
  });
});
router.get("/pointTable/delete", function (req, res, next) {
  helper.deletePointTable(req.query.id).then((resp) => {
    res.redirect("/admin/pointTable");
  });
});
router.post("/pointTable/new-category", function (req, res, next) {
  helper.addPointTable(req.body).then((response) => {
    res.redirect("/admin/pointTable");
  });
});

module.exports = router;
