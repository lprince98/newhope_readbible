import { renderOgImage, OG_ALT, OG_SIZE } from "@/src/presentation/og/renderOgImage";

// X(트위터) 공유 미리보기 이미지 — opengraph-image와 동일
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage();
}
