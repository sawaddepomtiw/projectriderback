import { Getdelivery } from './../model/delivery_model';
import express from "express";
import { conn,queryAsync } from "../dbconnect";
import mysql from "mysql";

export const router = express.Router();

router.get("/", (req, res) => {
    conn.query('SELECT * FROM `delivery`', (err, result, fields) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(result);
    });
});

router.get("/:id", (req, res) => {
    let id = parseInt(req.params.id); // แปลงเป็นตัวเลข
    const sql = `
        SELECT 
            delivery.*, 
            sender.name AS sender_name, 
            sender.phone AS sender_phone, 
            sender.address AS sender_address, 
            sender.gps AS sender_gps, 
            sender.image_member AS sender_image_member,
            receiver.name AS receiver_name, 
            receiver.phone AS receiver_phone, 
            receiver.address AS receiver_address, 
            receiver.gps AS receiver_gps, 
            receiver.image_member AS receiver_image_member
        FROM delivery
        JOIN member AS sender ON delivery.sender_id = sender.mid
        JOIN member AS receiver ON delivery.receiver_id = receiver.mid
        WHERE delivery.did = ? -- Filtering by id
    `;
    // Execute the query with the id parameter
    conn.query(sql, [id], (err, result, fields) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        // If no results, return a 404 status
        if (result.length === 0) {
            return res.status(404).json({ error: 'No delivery found with this ID' });
        }
        // Return the first result object instead of an array
        res.json(result[0]);
    });
});

router.post("/insert", (req, res) => {
    let order = req.body;

    // SQL insert query
    let sql = `
        INSERT INTO delivery(sender_id, receiver_id, item_name, image, status)
        VALUES (?, ?, ?, ?, ?)
    `;

    // Format the SQL query with the values from the request body
    sql = mysql.format(sql, [
        order.sender_id,    // Sender ID
        order.receiver_id,  // Receiver ID
        order.item_name,    // Item Name
        order.image,        // Image URL
        order.status        // Status
    ]);

    // Execute the SQL query
    conn.query(sql, (err) => {
        if (err) {
            // Send error response if there is an issue
            res.status(500).send("Error inserting data");
            return;
        }
        // Send success message if insertion is successful
        res.send("Insert order successfully");
    });
});

router.put("/update/:did", async (req, res) => {
    let order = req.body; // รับข้อมูลอัปเดตจาก request body
    let did = parseInt(req.params.did); // แปลง `did` จาก params

    // ดึงข้อมูลเดิมจากตาราง `delivery` ตาม `did`
    let sql = mysql.format("SELECT * FROM delivery WHERE did = ?", [did]);

    try {
        // ใช้ queryAsync เพื่อดึงข้อมูล
        let result = await queryAsync(sql);
        const rawData = JSON.parse(JSON.stringify(result));
        let orderdata = rawData[0]; // ข้อมูลเดิมของการส่ง

        // ผสมข้อมูลใหม่กับข้อมูลเดิม
        let updatedOrder = { ...orderdata, ...order };

        // สร้างคำสั่ง SQL สำหรับอัปเดตข้อมูล
        sql = `
            UPDATE delivery
            SET sender_id = ?, receiver_id = ?, item_name = ?, image = ?, status = ?
            WHERE did = ?
        `;

        // Format คำสั่ง SQL ด้วยข้อมูลใหม่
        sql = mysql.format(sql, [
            updatedOrder.sender_id,
            updatedOrder.receiver_id,
            updatedOrder.item_name,
            updatedOrder.image,
            updatedOrder.status,
            did
        ]);

        // Execute SQL query
        conn.query(sql, (err) => {
            if (err) {
                res.status(500).send("Error updating data");
                return;
            }
            res.send("Order updated successfully");
        });
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Error fetching data");
    }
});
