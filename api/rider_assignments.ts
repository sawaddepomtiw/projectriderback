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

router.put("/update/:did", async (req, res) => {
    let order: GetRiderAssignments = req.body;
    let did = parseInt(req.params.did); // แปลง `did` จาก params

    try {
        // ดึงค่า `raid` จาก `delivery_id`
        let raidSql = mysql.format("SELECT * FROM rider_assignments WHERE delivery_id = ? AND status = 'ไรเดอร์เข้ารับสินค้าแล้ว'", [did]);
        let raidResult = await queryAsync(raidSql);
        const raidData = JSON.parse(JSON.stringify(raidResult));
        
        if (raidData.length > 1) {
            res.json("nono can't");
            return;
        }else{

            let raid = raidData[0].raid; // ดึงค่า `raid` จากข้อมูลที่ดึงมา
    
            // ดึงข้อมูลทั้งหมดจาก `rider_assignments` ที่ตรงกับ `raid`
            let sql = mysql.format("SELECT * FROM rider_assignments WHERE raid = ?", [raid]);
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
    
            // Format คำสั่ง SQL ด้วยข้อมูลใหม่และ raid
            sql = mysql.format(sql, [
                updatedOrder.delivery_id,
                updatedOrder.rider_id,
                updatedOrder.status,
                updatedOrder.image_receiver,
                updatedOrder.image_success,
                raid // ใช้ `raid` ที่ดึงมาจากก่อนหน้า
            ]);
    
            // Execute SQL query สำหรับการอัปเดตข้อมูล
            conn.query(sql, (err) => {
                if (err) {
                    res.status(500).send("Error updating data");
                    return;
                }
                res.send("Assignments updated successfully");
            });
        }

    } catch (err) {
        console.error("Error fetching or updating data:", err);
        res.json("Error fetching or updating data");
        
    }
});
