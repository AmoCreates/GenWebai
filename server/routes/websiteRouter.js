import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.js";
import {
  deleteWebsite,
  deploy,
  generateWebiste,
  getAllWebsites,
  getBySlug,
  getWebsite,
  saveWebsiteCode,
  updateWebsite,
} from "../controllers/websiteControllers.js";

const websiteRouter = express.Router();

websiteRouter.post("/generate", isLoggedIn, generateWebiste);
websiteRouter.post("/update/:id", isLoggedIn, updateWebsite);
websiteRouter.post("/save-changes/:id", isLoggedIn, saveWebsiteCode);
websiteRouter.get("/get-by-id/:id", isLoggedIn, getWebsite);
websiteRouter.get("/get-by-slug/:slug", getBySlug);
websiteRouter.get("/get/all", isLoggedIn, getAllWebsites);
websiteRouter.get("/delete-by-id/:id", isLoggedIn, deleteWebsite);
websiteRouter.get("/deploy/:id", isLoggedIn, deploy);

export default websiteRouter;
