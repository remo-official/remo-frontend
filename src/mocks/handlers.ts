import { http, HttpResponse, delay } from 'msw';
import { MOCK_REVIEWS, MOCK_CHAT_ROOMS } from './data';

export const handlers = [
  // 홈 피드 리뷰
  http.get('/api/reviews', async () => {
    await delay(1200);
    return HttpResponse.json(MOCK_REVIEWS);
  }),

  // 탐색 리뷰
  http.get('/api/reviews/explore', async () => {
    await delay(900);
    return HttpResponse.json(MOCK_REVIEWS);
  }),

  // 리뷰 상세
  http.get('/api/reviews/:id', async ({ params }) => {
    await delay(600);
    const review = MOCK_REVIEWS.find(r => r.id === params.id);
    if (!review) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(review);
  }),

  // 채팅방
  http.get('/api/chat/:roomId', async ({ params }) => {
    await delay(500);
    const room = MOCK_CHAT_ROOMS.find(r => r.id === params.roomId);
    if (!room) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(room);
  }),
];
