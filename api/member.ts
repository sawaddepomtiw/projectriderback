import { GetMember } from "../model/member_model";
import express from "express";
import { conn } from "../dbconnect";
import mysql from "mysql";

export const router = express.Router();

//getall
router.get("/", (req, res) => {
    conn.query('select * from member', (err, result, fields)=>{
      res.json(result);
    });
  });

//get id
router.get("/:id", (req, res) => {
  let id = +req.params.id;
  conn.query("select * from member where phone = ?" , [id], (err, result, fields) => {
  if (err) throw err;
    res.json(result);
  });
});

//register
router.post("/register", (req, res) => {
  let member: GetMember = req.body;

  let sql = `
          INSERT INTO member (name, phone, password, address, gps, image_member, type)
          VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      sql = mysql.format(sql, [
          member.name,
          member.phone,
          member.password, // Store the hashed password
          member.address,
          member.gps,
          member.image_member,
          member.type = "member",
      ]);

  conn.query(sql, (err) => {
      if (err) {
          res.status(500).send("Error inserting data");
          return;
      }
      res.send("rider registered successfully");
  });
});


  