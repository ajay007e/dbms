var db = require("../config/connection");
var collection = require("../config/collections");
var objectId = require("mongodb").ObjectID;
const async = require("hbs/lib/async");
const { ObjectId } = require("mongodb");

const incriment = (id) => {
  return new Promise(async (resolve, reject) => {
    let data = await db
      .get()
      .collection(collection.ID_COLLECTION)
      .findOneAndUpdate({ _id: id }, { $inc: { sequence_value: 1 } });
    resolve(data.value.sequence_value);
  });
};

module.exports = {
  generateReport_01: (id) => {
    return new Promise(async (resolve, reject) => {
      let districtCount = await db
        .get()
        .collection(collection.DISTRICT_COLLECTION)
        .count();
      let schoolCount = await db
        .get()
        .collection(collection.SCHOOL_COLLECTION)
        .count();
      let studentCount = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .count();
      let itemCount = await db
        .get()
        .collection(collection.ITEM_COLLECTION)
        .count();
      let completedCount = await db
        .get()
        .collection(collection.ITEM_COLLECTION)
        .count({ status: "Ended" });
      let notStartedCount = await db
        .get()
        .collection(collection.ITEM_COLLECTION)
        .count({ status: "Not Started" });
      let startedCount = await db
        .get()
        .collection(collection.ITEM_COLLECTION)
        .count({ status: "Started" });

      resolve({
        report:
          "From " +
          districtCount +
          " districts, around " +
          studentCount +
          " students of different " +
          schoolCount +
          " schools are participating on " +
          itemCount +
          " different items . From these items, " +
          notStartedCount +
          " of them are not started," +
          startedCount +
          " of them are started and " +
          completedCount +
          " of them ended also.",
      });
    });
  },

  addDistrict: (name, callback) => {
    name.point = 0;
    db.get()
      .collection(collection.DISTRICT_COLLECTION)
      .insertOne(name)
      .then((data) => {
        callback(data);
      });
  },
  getDistrict: () => {
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.DISTRICT_COLLECTION)
        .find()
        .toArray();
      resolve(data);
    });
  },
  deleteDistrict: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.DISTRICT_COLLECTION)
        .deleteOne({ _id: ObjectId(id) })
        .then((data) => {
          resolve(data);
        });
    });
  },

  addCategory: (data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .insertOne(data)
        .then((data) => {
          resolve(data);
        });
    });
  },
  getCategory: (data) => {
    return new Promise((resolve, reject) => {
      let data = db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(data);
    });
  },
  deleteCategory: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .deleteOne({ _id: ObjectId(id) })
        .then((data) => {
          resolve(data);
        });
    });
  },
  getId: (id) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.ITEM_COLLECTION)
        .find({ id: id })
        .toArray()
        .then((data) => {
          resolve(String(data[0]._id));
        });
    });
  },
  addItem: (details) => {
    return new Promise(async (resolve, reject) => {
      details.id = await incriment("itemId");
      db.get()
        .collection(collection.ITEM_COLLECTION)
        .insertOne(details)
        .then((data) => {
          resolve(data);
        });
    });
  },
  editItem: (id, details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ITEM_COLLECTION)
        .findOneAndReplace({ _id: ObjectId(id) }, details)
        .then((data) => {
          resolve(data.value);
        });
    });
  },
  deleteItem: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ITEM_COLLECTION)
        .deleteOne({ _id: ObjectId(id) })
        .then((data) => {
          resolve(data);
        });
    });
  },
  getItem: () => {
    return new Promise((resolve, reject) => {
      let data = db
        .get()
        .collection(collection.ITEM_COLLECTION)
        .find()
        .toArray();
      resolve(data);
    });
  },
  itemDetails: (id) => {
    return new Promise((resolve, reject) => {
      let data = db
        .get()
        .collection(collection.ITEM_COLLECTION)
        .find({ _id: ObjectId(id) })
        .toArray();
      resolve(data);
    });
  },
  getResult: (id) => {
    return new Promise(async (resolve, reject) => {
      item = await db
        .get()
        .collection(collection.ITEM_COLLECTION)
        .find({ _id: ObjectId(id) })
        .toArray();

      if (item.length != 0) {
        db.get()
          .collection(collection.STUDENT_COLLECTION)
          .aggregate([
            {
              $match: {
                $or: [
                  {
                    "item1.item": String(item[0].id),
                    "item1.position": "",
                    "item1.grade": "",
                  },
                  {
                    "item2.item": String(item[0].id),
                    "item2.position": "",
                    "item2.grade": "",
                  },
                  {
                    "item3.item": String(item[0].id),
                    "item3.position": "",
                    "item3.grade": "",
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "school",
                localField: "schoolId",
                foreignField: "_id",
                as: "school",
              },
            },
            { $unwind: "$school" },
            {
              $project: {
                name: 1,
                category: 1,
                school: "$school.name",
                data: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ["$item1.item", String(item[0].id)] },
                        then: "$item1",
                      },
                      {
                        case: { $eq: ["$item2.item", String(item[0].id)] },
                        then: "$item2",
                      },
                      {
                        case: { $eq: ["$item3.item", String(item[0].id)] },
                        then: "$item3",
                      },
                    ],
                  },
                },
              },
            },
            { $limit: 1 },
          ])
          .toArray()
          .then((data) => {
            data.status = true;
            resolve(data);
          });
      } else {
        resolve({ status: false });
      }
    });
  },
  updateResult: (data) => {
    return new Promise(async (resolve, reject) => {
      let a = await db
        .get()
        .collection(collection.TABLE_COLLECTION)
        .find({ grade: data.grade, position: data.position })
        .toArray();
      let doc = {
        item: data.itemId,
        position: data.position,
        grade: data.grade,
        point: a[0].point,
      };
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .updateOne(
          { _id: ObjectId(data.id) },

          [
            {
              $set: {
                item1: {
                  $cond: {
                    if: { $eq: ["$item1.item", String(data.itemId)] },
                    then: doc,
                    else: "$item1",
                  },
                },
                item2: {
                  $cond: {
                    if: { $eq: ["$item2.item", String(data.itemId)] },
                    then: doc,
                    else: "$item2",
                  },
                },
                item3: {
                  $cond: {
                    if: { $eq: ["$item3.item", String(data.itemId)] },
                    then: doc,
                    else: "$item3",
                  },
                },
              },
            },
          ]
        )
        .then((data) => {
          resolve(data);
        });
    });
  },
  getStudents: (id) => {
    return new Promise(async (resolve, reject) => {
      item = await db
        .get()
        .collection(collection.ITEM_COLLECTION)
        .find({ _id: ObjectId(id) })
        .toArray();
      if (item.length != 0) {
        db.get()
          .collection(collection.STUDENT_COLLECTION)
          .aggregate([
            {
              $match: {
                $or: [
                  {
                    "item1.item": String(item[0].id),
                  },
                  {
                    "item2.item": String(item[0].id),
                  },
                  {
                    "item3.item": String(item[0].id),
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "school",
                localField: "schoolId",
                foreignField: "_id",
                as: "school",
              },
            },
            { $unwind: "$school" },
            {
              $project: {
                name: 1,
                category: 1,
                school: "$school.name",
                data: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ["$item1.item", String(item[0].id)] },
                        then: "$item1",
                      },
                      {
                        case: { $eq: ["$item2.item", String(item[0].id)] },
                        then: "$item2",
                      },
                      {
                        case: { $eq: ["$item3.item", String(item[0].id)] },
                        then: "$item3",
                      },
                    ],
                  },
                },
              },
            },
          ])
          .toArray()
          .then((data) => {
            data.status = true;
            resolve(data);
          });
      } else {
        resolve({ status: false });
      }
    });
  },

  addPointTable: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.TABLE_COLLECTION)
        .insertOne(details)
        .then((data) => {
          resolve(data);
        });
    });
  },
  deletePointTable: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.TABLE_COLLECTION)
        .deleteOne({ _id: ObjectId(id) })
        .then((data) => {
          resolve(data);
        });
    });
  },
  getTable: () => {
    return new Promise((resolve, reject) => {
      let data = db
        .get()
        .collection(collection.TABLE_COLLECTION)
        .find()
        .toArray();
      resolve(data);
    });
  },

  addSchool: (details) => {
    return new Promise((resolve, reject) => {
      details.hssg = 0;
      details.hsg = 0;
      details.hsa = 0;
      details.hss = 0;
      db.get()
        .collection(collection.SCHOOL_COLLECTION)
        .insertOne(details)
        .then((data) => {
          resolve(data);
        });
    });
  },
  getSchool: () => {
    return new Promise((resolve, reject) => {
      let data = db
        .get()
        .collection(collection.SCHOOL_COLLECTION)
        .find()
        .toArray();
      resolve(data);
    });
  },
  deleteSchool: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.SCHOOL_COLLECTION)
        .deleteOne({ _id: ObjectId(id) })
        .then((data) => {
          resolve(data);
        });
    });
  },
  schoolDetails: (id) => {
    return new Promise((resolve, reject) => {
      let data = db
        .get()
        .collection(collection.SCHOOL_COLLECTION)
        .find({ _id: ObjectId(id) })
        .toArray();
      resolve(data);
    });
  },

  addStudent: (details) => {
    details.schoolId = ObjectId(details.schoolId);
    details.item1 = { item: details.item1, position: "", grade: "" };
    details.item2 = { item: details.item2, position: "", grade: "" };
    details.item3 = { item: details.item3, position: "", grade: "" };
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .insertOne(details)
        .then((data) => {
          resolve(data);
        });
    });
  },
  getStudent: (school) => {
    return new Promise((resolve, reject) => {
      let data = db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .find({ schoolId: ObjectId(school) })
        .toArray();
      resolve(data);
    });
  },
};
