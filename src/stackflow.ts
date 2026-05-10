import { stackflow } from '@stackflow/react';
import { historySyncPlugin } from '@stackflow/plugin-history-sync';
import { basicUIPlugin } from '@stackflow/plugin-basic-ui';
import { basicRendererPlugin } from '@stackflow/plugin-renderer-basic';
import type { ActivityComponentType } from '@stackflow/react';

import LoginPage from './pages/auth/LoginPage';
import BodyInfoPage from './pages/onboarding/BodyInfoPage';
import HomePage from './pages/home/HomePage';
import ExplorePage from './pages/explore/ExplorePage';
import MyPage from './pages/my/MyPage';
import ReviewDetailPage from './pages/review/ReviewDetailPage';
import ReviewWritePage from './pages/review/ReviewWritePage';
import ChatPage from './pages/chat/ChatPage';

export const { Stack, useFlow, useStepFlow } = stackflow({
  activities: {
    Login: LoginPage as ActivityComponentType<{}>,
    Onboarding: BodyInfoPage as ActivityComponentType<{}>,
    Home: HomePage as ActivityComponentType<{}>,
    Explore: ExplorePage as ActivityComponentType<{}>,
    My: MyPage as ActivityComponentType<{}>,
    ReviewDetail: ReviewDetailPage as ActivityComponentType<{ id: string }>,
    ReviewWrite: ReviewWritePage as ActivityComponentType<{ step?: string }>,
    Chat: ChatPage as ActivityComponentType<{ roomId: string }>,
  },
  transitionDuration: 350,
  plugins: [
    basicRendererPlugin(),
    historySyncPlugin({
      routes: {
        Login: '/login',
        Onboarding: '/onboarding',
        Home: '/home',
        Explore: '/explore',
        My: '/my',
        ReviewDetail: '/review/:id',
        ReviewWrite: '/review/write',
        Chat: '/chat/:roomId',
      },
      fallbackActivity: () => 'Home',
      useHash: true,
    }),
    basicUIPlugin({ theme: 'cupertino' }),
  ],
});
