import express from "express";
import { router as index } from "./api/index";
import { router as member } from './api/member';
import { router as rider } from './api/rider';
import bodyParser from "body-parser";


export const app = express();

app.use(bodyParser.json());
app.use("/", index);
app.use("/member", member);
app.use("/rider", rider);