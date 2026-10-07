import Lesson from './lesson';
import {requireChatGPTUser} from '@platform/auth';
export const dynamic='force-dynamic';
export default async function Page(){await requireChatGPTUser('/');return <Lesson/>}
