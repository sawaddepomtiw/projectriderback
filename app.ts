import express from "express";
import { router as index } from "./api/index";
import { router as member } from './api/member';
import { router as rider } from './api/rider';
import { router as delivery } from './api/delivery';
import { router as rider_assigns } from './api/rider_assignments';
import bodyParser from "body-parser";


export const app = express();

app.use(bodyParser.json());
app.use("/", index);
app.use("/member", member);
app.use("/rider", rider);
app.use("/delivery", delivery);
app.use("/rider_assigns", rider_assigns);