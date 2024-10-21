import { GetRiderAssignments } from './../model/rider_assignments_model';
import express from "express";
import { conn, queryAsync } from "../dbconnect";
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
    let did = parseInt(req.params.did);

    try {
        // Check if a rider is already assigned to pick up the delivery
        let raidSql = mysql.format("SELECT * FROM rider_assignments WHERE delivery_id = ? AND (status = 'ไรเดอร์เข้ารับสินค้าแล้ว' OR status = 'ไรเดอร์กำลังนำส่งสินค้า')", [did]);
        let raidResult = await queryAsync(raidSql);
        const raidData = JSON.parse(JSON.stringify(raidResult));

        // If more than one assignment is found, return an error
        if (raidData.length > 1) {
            res.json("nono can't");
            return 
        } else if (raidData.length === 0) {
            res.status(404).send("No rider assignment found for this delivery");
            return 
        }

        // Get the raid from the retrieved assignment
        let raid = raidData[0].raid;

        // Retrieve the existing assignment to update
        let sql = mysql.format("SELECT * FROM rider_assignments WHERE raid = ?", [raid]);
        let result = await queryAsync(sql);
        const rawData = JSON.parse(JSON.stringify(result));

        if (rawData.length === 0) {
            res.status(404).send("No existing assignment found");
            return 
        }

        let orderdata = rawData[0];

        // Merge new order data with the existing order data
        let updatedOrder = { ...orderdata, ...order } as GetRiderAssignments;

        // Create an SQL update statement
        sql = `
            UPDATE rider_assignments
            SET delivery_id = ?, rider_id = ?, status = ?, image_receiver = ?, image_success = ?
            WHERE raid = ?
        `;

        // Format SQL query with the updated data
        sql = mysql.format(sql, [
            updatedOrder.delivery_id,
            updatedOrder.rider_id,
            updatedOrder.status,
            updatedOrder.image_receiver,
            updatedOrder.image_success,
            raid
        ]);

        // Execute the SQL update query
        conn.query(sql, (err) => {
            if (err) {
                console.error("Error updating data:", err);
                return res.status(500).send("Error updating data");
            }
            res.send("Assignments updated successfully");
        });

    } catch (err) {
        console.error("Error fetching or updating data:", err);
        res.status(500).json("Error fetching or updating data");
    }
});
