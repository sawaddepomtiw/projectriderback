import { Getorder } from './../model/order_model';
import express from "express";
import { conn,queryAsync } from "../dbconnect";
import mysql from "mysql";

export const router = express.Router();

  router.get("/", (req, res) => {
    conn.query('SELECT * FROM `orderdelivery`', (err, result, fields) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(result);
    });
});

router.post("/insertorder", (req, res) => {
    let order: Getorder = req.body;
  
    let sql = `
            INSERT INTO orderdelivery(mid_sender, mid_receiver,rid, gps_sender, gps_receiver, status, picture_pickup, picture_success)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        sql = mysql.format(sql, [
            order.mid_sender,
            order.mid_receiver,
            order.rid,
            order.gps_sender,
            order.gps_receiver,
            order.status,
            order.picture_pickup,
            order.picture_success,
        ]);
  
    conn.query(sql, (err) => {
        if (err) {
            res.status(500).send("Error inserting data");
            return;
        }
        res.send("insert order successfully");
    });
  });

  //updateProfile
router.put("/updateorder/:oid", async (req, res) => {
    let order: Getorder = req.body;
    let oid = +req.params.oid;
    let orderdata: Getorder | undefined;
    let sql = mysql.format("select * from orderdelivery where oid = ?", [oid]);
  
    let result = await queryAsync(sql);
    const rawData = JSON.parse(JSON.stringify(result));
    orderdata = rawData[0] as Getorder;
  
    let updateorder = {...orderdata, ...order};
  
    sql = "UPDATE `orderdelivery` SET `mid_sender`=?,`mid_receiver`=?,`rid`=?,`gps_sender`=?,`gps_receiver`=?,`status`=?,`picture_pickup`=?,`picture_success`=? WHERE `oid`=?";
    sql = mysql.format(sql, [
        updateorder.mid_sender,
        updateorder.mid_receiver, // Store the hashed password
        updateorder.rid,
        updateorder.gps_sender,
        updateorder.gps_receiver,
        updateorder.status,
        updateorder.picture_pickup,
        updateorder.picture_success,
        oid
    ]);
  
    conn.query(sql, (err) => {
        if (err) {
            res.status(500).send("Error update data");
            return;
        }
        res.send("order update successfully");
    });
  });