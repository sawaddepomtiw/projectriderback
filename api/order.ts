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

router.get("/all", (req, res) => {
    const sql = `
        SELECT 
            orderdelivery.*, 
            sender.name AS sender_name, 
            sender.phone AS sender_phone, 
            sender.address AS sender_address, 
            sender.gps AS sender_gps, 
            sender.image_member AS sender_image_member,
            receiver.name AS receiver_name, 
            receiver.phone AS receiver_phone, 
            receiver.address AS receiver_address, 
            receiver.gps AS receiver_gps, 
            receiver.image_member AS receiver_image_member,
            rider.name AS rider_name,
            rider.phone AS rider_phone,
            rider.plate AS rider_plate,
            rider.image_rider AS rider_image
        FROM orderdelivery
        JOIN member AS sender ON orderdelivery.mid_sender = sender.mid
        JOIN member AS receiver ON orderdelivery.mid_receiver = receiver.mid
        JOIN rider ON orderdelivery.rid = rider.rid -- เชื่อมกับ table rider
    `;
    
    conn.query(sql, (err, result, fields) => {
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