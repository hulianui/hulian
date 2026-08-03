import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "allProjects": "全部项目",
    "photoUploadedSuccessfully": "照片上传成功",
    "addedToWorkPhotoGallery": "已加入工作照片库",
    "all": "全部",
    "total": "共",
    "zhang": "张",
    "uploadPhotos": "上传照片",
    "uploadWorkPhotos": "上传工作照片",
    "thereAreNoPhotosUnderThisFilter": "该筛选下暂无照片",
  },
  en: {
    "allProjects": "All projects",
    "photoUploadedSuccessfully": "Photo uploaded successfully",
    "addedToWorkPhotoGallery": "Added to work photo gallery",
    "all": "All",
    "total": "total",
    "zhang": "Zhang",
    "uploadPhotos": "Upload photos",
    "uploadWorkPhotos": "Upload work photos",
    "thereAreNoPhotosUnderThisFilter": "There are no photos under this filter",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-projects-app-photos-page",
  content: t(content),
};

export default dictionary;
