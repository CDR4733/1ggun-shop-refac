import express from "express";
import { prisma } from "../utils/prisma.util.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";

import { createResumeValidator } from "../middlewares/validators/create-resume.validator.js";
import { updateResumeValidator } from "../middlewares/validators/update-resume.validator.js";

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
        userId: +user.userId,
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
    // 1. 데이터 : user, sort
    const user = req.user;
    let { sort } = req.query;
    sort = sort?.toLowerCase();
    if (sort !== "desc" && sort !== "asc") {
      sort = "desc"; // default는 desc
    }

    // 2. user가 작성한 resumes 모두 조회
    const datas = await prisma.resume.findMany({
      where: { userId: +user.userId },
      orderBy: {
        createdAt: sort,
      },
      include: {
        user: true, // users 테이블과의 릴레이션으로 가져오기
      },
    });
    // 2-1. 데이터 가공
    const filteredDatas = datas.map((e) => ({
      resumeId: +e.resumeId,
      name: e.user.name,
      resumeTitle: e.resumeTitle,
      resumeContent: e.resumeContent,
      resumeStatus: e.resumeStatus,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));

    // 3. 결과 반환
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
      data: filteredDatas,
    });
  } catch (err) {
    next(err);
  }
});

/** 이력서 상세 조회(R-D) API **/
resumesRouter.get("/:resumeId", async (req, res, next) => {
  try {
    // 1. 데이터
    const user = req.user;
    const { resumeId } = req.params;

    // 2. 해당 이력서 조회
    const data = await prisma.resume.findUnique({
      where: {
        resumeId: +resumeId,
        userId: +user.userId,
      },
      include: { user: true }, // relation으로 user테이블 가져와!
    });
    // 2-1. 해당 이력서가 존재하지 않으면 (404)
    if (!data) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.RESUMES.COMMON.NON_FOUND,
      });
    }
    // 2-2. 데이터 가공
    const filteredData = {
      resumeId: +data.resumeId,
      name: data.user.name,
      resumeTitle: data.resumeTitle,
      resumeContent: data.resumeContent,
      resumeStatus: data.resumeStatus,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    // 3. 결과 반환
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_DETAIL.SUCCEED,
      data: filteredData,
    });
  } catch (err) {
    next(err);
  }
});

/** 이력서 수정 API(U) **/
resumesRouter.patch(
  "/:resumeId",
  updateResumeValidator,
  async (req, res, next) => {
    try {
      // 1. 데이터
      const user = req.user;
      const { resumeId } = req.params;
      const { resumeTitle, resumeContent } = req.body;

      // 2. 수정할 이력서 조회
      const existingResume = await prisma.resume.findUnique({
        where: {
          resumeId: +resumeId,
          userId: +user.userId,
        },
      });
      // 2-1. 해당 이력서가 존재하지 않으면 (404)
      if (!existingResume) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          status: HTTP_STATUS.NOT_FOUND,
          message: MESSAGES.RESUMES.COMMON.NON_FOUND,
        });
      }

      // 3. 이력서 수정
      const data = await prisma.resume.update({
        where: {
          resumeId: +resumeId,
          userId: +user.userId,
        },
        data: {
          ...(resumeTitle && { resumeTitle: resumeTitle }),
          ...(resumeContent && { resumeContent: resumeContent }),
        },
      });

      // 4. 결과 반환
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.UPDATE.SUCCEED,
        data: data,
      });
    } catch (err) {
      next(err);
    }
  },
);

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
