import express, { response } from "express";
import { conn, queryAsync } from "../dbconnect";
import mysql from "mysql";
import { Getrider } from "../model/rider_model";


export const router = express.Router();


router.get("/", (req, res) => {
    conn.query('select * from rider', (err, result, fields)=>{
      res.json(result);
    });
  });

//get id
router.get("/:id", (req, res) => {
    let id = +req.params.id;
    conn.query("select * from rider where phone = ?" , [id], (err, result, fields) => {
    if (err) throw err;
      res.json(result);
    });
  });

  
router.post("/register", (req, res) => {
    let rider: Getrider = req.body;

    let sql = "INSERT INTO `rider`(`name`, `phone`, `password`, `plate`, `image_rider`, `type`) VALUES (?,?,?,?,?,?)";
        sql = mysql.format(sql, [
            rider.name,
            rider.phone,
            rider.password,
            rider.plate,
            rider.image_rider,
            rider.type = "rider",
        ]);

    conn.query(sql, (err) => {
        if (err) {
            res.status(500).send("Error inserting data");
            return;
        }
        res.send("Member registered successfully");
    });
});

//updateProfile
router.put("/updaterider/:phone", async (req, res) => {
  let rider: Getrider = req.body;
  let phone = +req.params.phone;
  let riderdata: Getrider | undefined;
  let sql = mysql.format("select * from rider where phone = ?", [phone]);

  let result = await queryAsync(sql);
  const rawData = JSON.parse(JSON.stringify(result));
  riderdata = rawData[0] as Getrider;

  let updateRider = {...riderdata, ...rider};

  sql = "UPDATE `rider` SET `name`=?,`password`=?,`plate`=?,`image_rider`=? WHERE `PHONE`=?";
  sql = mysql.format(sql, [
      updateRider.name,
      updateRider.password,
      updateRider.plate,
      updateRider.image_rider,
      phone,
  ]);

  conn.query(sql, (err) => {
      if (err) {
          res.status(500).send("Error update data");
          return;
      }
      res.send("rider update successfully");
  });
});