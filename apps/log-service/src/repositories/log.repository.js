import Log from "../models/log.model.js";

export const createLog = (data) => Log.create(data);

export const getLogs = () =>
  Log.find().sort({ createdAt: -1 });

export const getLogById = (id) => Log.findById(id);

export const updateLog = (id, data) =>
  Log.findByIdAndUpdate(id, data, { new: true });