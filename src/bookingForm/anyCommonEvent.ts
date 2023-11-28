import createAnalyticsFunction from '@/createAnalyticsFunction'

export type Data = {
  uuid: string;
  name: string;
  id: number;
}

export default createAnalyticsFunction<Data>('any/common/event')
