// 「瀚学」在线课程平台 mock 数据类型。全内存、零外链。
import type { VideoChapter } from "@hulian/ui";

export type CourseCategoryKey = "frontend" | "design" | "ai" | "career";

export interface CourseCategory {
  key: CourseCategoryKey;
  name: string;
  /** 程序化海报主色相。 */
  hue: number;
}

export type CourseLevel = "入门" | "进阶" | "高级";

export interface Lesson {
  id: string;
  title: string;
  /** 单节时长（秒）。 */
  duration: number;
  /** 视频源（demo 复用同一本地 mp4）。 */
  videoSrc: string;
  /** 节内知识点分段标记（cue points），喂 Video 的 chapters。 */
  markers: VideoChapter[];
  /** 可免费试看。 */
  preview?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface CourseFile {
  name: string;
  type: "file" | "folder";
  size?: string;
  children?: CourseFile[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: CourseCategoryKey;
  tags: string[];
  level: CourseLevel;
  instructor: { name: string; title: string };
  rating: number;
  ratingCount: number;
  students: number;
  price: number; // 0 = 免费
  /** 课程简介（markdown）。 */
  summary: string;
  chapters: Chapter[];
  /** 配套课件树。 */
  files: CourseFile[];
  /** 预置「我的学习」种子：是否已报名 + 已完成的小节 id。 */
  seedEnrolled?: boolean;
  seedCompletedLessonIds?: string[];
}

export interface Discussion {
  id: string;
  author: string;
  role: string;
  datetime: string;
  content: string;
  likes: number;
  replies?: Discussion[];
}
