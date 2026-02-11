import express from "express";
import "./utils/prisma.util.js";
import { SERVER_PORT } from "./constants/env.constant.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import { HTTP_STATUS } from "./constants/http-status.constant.js";
import { apiRouter } from "./routers/index.js";

// express 필수 세트
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 서버가 살아있는지 체크 용도
app.get("/health-check", (req, res) => {
  return res.status(HTTP_STATUS.OK).json(`I'm healthy!`);
});

// router와 통합관리하는 index(apiRouter)로 연결
app.use("/", apiRouter);

// 에러핸들러 미들웨어 사용
app.use(errorHandler);

// 서버가 어느 포트에서 열렸는지 표시
app.listen(SERVER_PORT, () => {
  console.log(`서버가 ${SERVER_PORT}번 포트에서 실행 중입니다.`);
});
