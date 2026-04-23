/**
 * 날짜별로 변경되는 오늘의 말씀 데이터
 */
const VERSES = [
  { text: "주의 말씀은 내 발에 등이요 내 길에 빛이니이다", ref: "시편 119:105" },
  { text: "하나님의 말씀은 살아 있고 활력이 있어 좌우에 날선 어떤 검보다도 예리하여", ref: "히브리서 4:12" },
  { text: "태초에 말씀이 계시니라 이 말씀이 하나님과 함께 계셨으니 이 말씀은 곧 하나님이시니라", ref: "요한복음 1:1" },
  { text: "사람이 떡으로만 살 것이 아니요 하나님의 입으로부터 나오는 모든 말씀으로 살 것이라", ref: "마태복음 4:4" },
  { text: "너희는 말씀을 행하는 자가 되고 듣기만 하여 자신을 속이는 자가 되지 말라", ref: "야고보서 1:22" },
  { text: "풀은 마르고 꽃은 시드나 우리 하나님의 말씀은 영원히 서리라", ref: "이사야 40:8" },
  { text: "복 있는 사람은... 오직 여호와의 율법을 즐거워하여 그의 율법을 주야로 묵상하는도다", ref: "시편 1:1-2" },
  { text: "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라", ref: "잠언 3:5" },
  { text: "평강의 주께서 친히 때마다 일마다 너희에게 평강을 주시고 주께서 너희 모든 사람과 함께 하시기를 원하노라", ref: "데살로니가후서 3:16" },
  { text: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라", ref: "빌립보서 4:13" },
];

/**
 * 오늘 날짜를 기준으로 항상 동일한 인덱스의 말씀을 반환합니다.
 */
export function getDailyVerse() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${today.getMonth()}${today.getDate()}`;
  
  // 날짜 문자열을 숫자로 변환하여 인덱스 계산
  const hash = dateStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % VERSES.length;
  
  return VERSES[index];
}
