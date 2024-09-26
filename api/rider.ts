import express, { response } from "express";
import { conn } from "../dbconnect";
import mysql from "mysql";
import { Getrider } from "../model/rider_model";


export const router = express.Router();


router.get("/", (req, res) => {
    let sql = "SELECT * FROM rider";

    conn.query(sql, (err, result) => {
        if(err) throw err;
        res.status(200).json({response:true, result})
    })
})

//get id
router.get("/:id", (req, res) => {
    let id = +req.params.id;
    conn.query("select * from rider where rid = ?" , [id], (err, result, fields) => {
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