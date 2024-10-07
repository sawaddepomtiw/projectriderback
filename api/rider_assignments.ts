import { GetRiderAssignments } from './../model/rider_assignments_model';
import express from "express";
import { conn,queryAsync } from "../dbconnect";
import mysql from "mysql";

export const router = express.Router();

router.get("/", (req, res) => {
    conn.query('SELECT * FROM `rider_assignments`', (err, result, fields) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(result);
    });
});

router.post("/insert", (req, res) => {
    let order: GetRiderAssignments = req.body;

    // SQL insert query
    let sql = `
        INSERT INTO rider_assignments(delivery_id, rider_id, status, image_receiver, image_success)
        VALUES (?, ?, ?, ?, ?)
    `;

    // Format the SQL query with the values from the request body
    sql = mysql.format(sql, [
        order.delivery_id,    // Sender ID
        order.rider_id,  // Receiver ID
        order.status,        // Status
        order.image_receiver,    // Item Name
        order.image_success,        // Image URL
    ]);

    
    conn.query(sql, (err) => {
        if (err) {
            // Send error response if there is an issue
            res.status(500).send("Error inserting data");
            return;
        }
        // Send success message if insertion is successful
        res.send("Insert rider_assignments successfully");
    });
});

router.put("/update/:raid", async (req, res) => {
    let order: GetRiderAssignments = req.body;
    let raid = parseInt(req.params.raid); // แปลง `did` จาก params

    // ดึงข้อมูลเดิมจากตาราง `delivery` ตาม `did`
    let sql = mysql.format("SELECT * FROM rider_assignments WHERE raid = ?", [raid]);

    try {
        // ใช้ queryAsync เพื่อดึงข้อมูล
        let result = await queryAsync(sql);
        const rawData = JSON.parse(JSON.stringify(result));
        let orderdata = rawData[0]; // ข้อมูลเดิมของการส่ง

        // ผสมข้อมูลใหม่กับข้อมูลเดิม
        let updatedOrder = { ...orderdata, ...order } as GetRiderAssignments;

        // สร้างคำสั่ง SQL สำหรับอัปเดตข้อมูล
        sql = `
            UPDATE rider_assignments
            SET delivery_id = ?, rider_id = ?, status = ?, image_receiver = ?, image_success = ?
            WHERE raid = ?
        `;

        // Format คำสั่ง SQL ด้วยข้อมูลใหม่
        sql = mysql.format(sql, [
            updatedOrder.delivery_id,
            updatedOrder.rider_id,
            updatedOrder.status,
            updatedOrder.image_receiver,
            updatedOrder.image_success,
            raid
        ]);

        // Execute SQL query
        conn.query(sql, (err) => {
            if (err) {
                res.status(500).send("Error updating data");
                return;
            }
            res.send("Assignments updated successfully");
        });
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Error fetching data");
    }
});
