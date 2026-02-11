import express from "express";
import { prisma } from "../utils/prisma.util.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";

import { createResumeValidator } from "../middlewares/validators/create-resume.validator.js";

const resumesRouter = express.Router();

/** 이력서 생성(C) API **/
resumesRouter.post("/", createResumeValidator, async (req, res, next) => {
  try {
    // 1. 데이터
    const user = req.user;
    const { resumeTitle, resumeContent } = req.body;

    // 2. DB에 데이터 생성
    const data = await prisma.resume.create({
      data: {
        userId: user.userId,
        resumeTitle: resumeTitle,
        resumeContent: resumeContent,
      },
    });

    // 3. 결과 반환
    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.RESUMES.CREATE.SUCCEED,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

/** 이력서 목록 조회(R-A) API **/
resumesRouter.get("/", async (req, res, next) => {
  try {
    // 1. 데이터
    const data = null;

    // 결과 반환
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

/** 이력서 상세 조회(R-D) API **/
resumesRouter.get("/:resumeId", async (req, res, next) => {
  try {
    // 1. 데이터
    const data = null;

    // 결과 반환
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_DETAIL.SUCCEED,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

/** 이력서 수정 API(U) **/
resumesRouter.patch("/:resumeId", async (req, res, next) => {
  try {
    // 1. 데이터
    const data = null;

    // 결과 반환
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.UPDATE.SUCCEED,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

/** 이력서 삭제 API(D) **/
resumesRouter.delete("/:resumeId", async (req, res, next) => {
  try {
    // 1. 데이터
    const data = null;

    // 결과 반환
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.DELETE.SUCCEED,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

export { resumesRouter };
