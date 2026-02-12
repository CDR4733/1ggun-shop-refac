import express from "express";
import { prisma } from "../utils/prisma.util.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import { USER_ROLE } from "../constants/user.constant.js";

import { createResumeValidator } from "../middlewares/validators/create-resume.validator.js";
import { updateResumeValidator } from "../middlewares/validators/update-resume.validator.js";
import { updateResumeStatusValidator } from "../middlewares/validators/update-resume-status.validator.js";
import { requireRoles } from "../middlewares/require-roles.middleware.js";
import e from "express";

const resumesRouter = express.Router();

/** 이력서 생성 API(C) **/
resumesRouter.post("/", createResumeValidator, async (req, res, next) => {
  try {
    // 1. Request
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

    // 3. Response
    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.RESUMES.CREATE.SUCCEED,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

/** 이력서 목록 조회 API(R-A) **/
resumesRouter.get("/", async (req, res, next) => {
  try {
    // 1. Request : user, sort
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

    // 3. Response
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
      data: filteredDatas,
    });
  } catch (err) {
    next(err);
  }
});

/** 이력서 상세 조회 API(R-D) **/
resumesRouter.get("/:resumeId", async (req, res, next) => {
  try {
    // 1. Request
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

    // 3. Response
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
      // 1. Request
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

      // 4. Response
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
    // 1. Request
    const user = req.user;
    const { resumeId } = req.params;

    // 2. 삭제할 이력서 조회
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

    // 3. 이력서 삭제
    const data = await prisma.resume.delete({
      where: {
        resumeId: +resumeId,
        userId: +user.userId,
      },
    });

    // 4. Response
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.DELETE.SUCCEED,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

/** 이력서 지원 상태 변경 API(U) **/
resumesRouter.patch(
  "/:resumeId/status",
  requireRoles([USER_ROLE.RECRUITER]),
  updateResumeStatusValidator,
  async (req, res, next) => {
    try {
      // 1. Request
      const user = req.user;
      const recruiterId = +user.userId;
      const resumeId = +req.params.resumeId;
      const { resumeStatus, reason } = req.body;

      // 2. Transaction : status 수정 + log 생성
      await prisma.$transaction(async (tx) => {
        // 2-1. 이력서 정보 조회
        const existingResume = await tx.resume.findUnique({
          where: {
            resumeId: resumeId,
          },
        });
        // 2-2. 이력서 정보가 없는 경우 에러(404)
        if (!existingResume) {
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            status: HTTP_STATUS.NOT_FOUND,
            message: MESSAGES.RESUMES.COMMON.NON_FOUND,
          });
        }
        // 2-3. 이력서 정보 수정
        const updatedResume = await tx.resume.update({
          where: {
            resumeId: resumeId,
          },
          data: {
            resumeStatus: resumeStatus,
          },
        });
        // 2-4. 이력서 로그 생성
        const updateLog = await tx.resumeLog.create({
          data: {
            recruiterId: recruiterId,
            resumeId: resumeId,
            oldStatus: existingResume.resumeStatus,
            newStatus: updatedResume.resumeStatus,
            reason: reason,
          },
        });
        // 2-5. Response
        return res.status(HTTP_STATUS.OK).json({
          stats: HTTP_STATUS.OK,
          message: MESSAGES.RESUMES.UPDATE.STATUS.SUCCEED,
          data: updateLog,
        });
      });
      // 3. Transaction 종료
    } catch (err) {
      next(err);
    }
  },
);

/** 로그 목록 조회 API(R-A) **/
resumesRouter.get("/:resumeId/logs", async (req, res, next) => {
  try {
    // 1. Request
    const resumeId = +req.params.resumeId;

    // 2. 해당 resume의 로그 목록 조회
    const datas = await prisma.resumeLog.findMany({
      where: {
        resumeId: resumeId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        recruiter: true,
      },
    });
    // 2-1. 데이터 가공
    const filteredDatas = datas.map((e) => ({
      lodId: e.logId,
      recruiterName: e.recruiter.name,
      resumeId: e.resumeId,
      oldStatus: e.oldStatus,
      newStatus: e.newStatus,
      reason: e.reason,
      createdAt: e.createdAt,
    }));

    // 3. Response
    return res.status(HTTP_STATUS.OK).json({
      stats: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_LIST.LOG.SUCCEED,
      data: filteredDatas,
    });
  } catch (err) {
    next(err);
  }
});

export { resumesRouter };
