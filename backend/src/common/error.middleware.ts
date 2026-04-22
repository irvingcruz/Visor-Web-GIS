import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "./ApiResponse";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("ERROR:", err);
  res.status(500).json(ApiResponse.error("Error interno del servidor", 500));
}
