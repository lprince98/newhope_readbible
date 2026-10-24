import { renderOgImage, OG_ALT, OG_SIZE } from "@/src/presentation/og/renderOgImage";

// 링크 공유 미리보기 이미지 (빌드 시 정적으로 생성)
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage();
}
